package com.secuidea.visitreservekiosk

import android.net.Uri
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView

@Composable
fun VideoPlayer(videoUri: Uri, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    var isBuffering by remember { mutableStateOf(true) }

    // ExoPlayer 인스턴스 생성
    val exoPlayer = remember {
        ExoPlayer.Builder(context).build().apply {
            // 비디오 반복 재생 설정
            repeatMode = Player.REPEAT_MODE_ALL
            // 자동 재생 설정
            playWhenReady = true
            // 비디오 소스 설정
            setMediaItem(MediaItem.fromUri(videoUri))
            // 비디오 준비
            prepare()
        }
    }

    // 버퍼링 상태 리스너 추가
    LaunchedEffect(exoPlayer) {
        exoPlayer.addListener(
                object : Player.Listener {
                    override fun onPlaybackStateChanged(playbackState: Int) {
                        isBuffering = playbackState == Player.STATE_BUFFERING
                    }
                }
        )
    }

    // PlayerView를 사용하여 비디오 표시
    DisposableEffect(key1 = Unit) {
        onDispose {
            // 컴포저블이 화면에서 제거될 때 ExoPlayer 해제
            exoPlayer.release()
        }
    }

    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        // 비디오 플레이어 뷰
        AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        player = exoPlayer
                        useController = false // 컨트롤러 숨김
                        setShowBuffering(PlayerView.SHOW_BUFFERING_NEVER) // 버퍼링 표시 숨김
                        resizeMode = AspectRatioFrameLayout.RESIZE_MODE_FILL // 화면에 꽉 차게 표시
                    }
                },
                modifier = Modifier.fillMaxSize()
        )

        // 버퍼링 표시기
        if (isBuffering) {
            CircularProgressIndicator(
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.align(Alignment.Center)
            )
        }
    }
}
