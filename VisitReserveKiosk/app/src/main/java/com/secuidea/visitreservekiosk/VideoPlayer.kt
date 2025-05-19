package com.secuidea.visitreservekiosk

import android.content.Context
import android.net.Uri
import android.util.Log
import android.view.ViewGroup
import android.widget.FrameLayout
import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import java.io.File

/** 비디오 반복 모드 */
enum class VideoRepeatMode {
    NONE, // 반복 없음 (한 번만 재생)
    ALL, // 전체 반복
    ONE // 현재 항목 반복
}

/** 비디오 크기 조정 모드 */
enum class VideoScalingMode {
    FIT, // 비디오 비율 유지하며 화면에 맞춤
    FIT_WITH_CROPPING, // 비디오 비율 유지하며 화면에 채우기 (잘릴 수 있음)
    FILL, // 화면에 꽉 차게 표시 (비율 왜곡 가능)
    ZOOM // 확대 (잘릴 수 있음)
}

// ExoPlayer를 전역 관리하는 싱글톤
object VideoPlayerManager {
    var introPlayer: ExoPlayer? = null
    var outroPlayer: ExoPlayer? = null

    fun prepareIntroPlayer(context: Context, videoUri: Uri) {
        if (introPlayer == null) {
            introPlayer =
                    ExoPlayer.Builder(context).build().apply {
                        setMediaItem(MediaItem.fromUri(videoUri))
                        repeatMode = Player.REPEAT_MODE_ALL
                        playWhenReady = true
                        prepare()
                    }
        }
    }

    fun prepareOutroPlayer(context: Context, videoUri: Uri) {
        if (outroPlayer == null) {
            outroPlayer =
                    ExoPlayer.Builder(context).build().apply {
                        setMediaItem(MediaItem.fromUri(videoUri))
                        repeatMode = Player.REPEAT_MODE_OFF
                        playWhenReady = false
                        prepare()
                    }
        }
    }

    // outro 비디오 재생 시작
    fun playOutroVideo() {
        outroPlayer?.apply {
            seekTo(0) // 항상 처음부터 재생
            playWhenReady = true
        }
    }

    // outro 비디오 재생 일시 중지
    fun pauseOutroVideo() {
        outroPlayer?.playWhenReady = false
    }

    // outro 비디오 재생 중지 및 처음으로 되돌리기
    fun resetOutroVideo() {
        outroPlayer?.apply {
            playWhenReady = false
            seekTo(0)
        }
    }

    fun releaseAll() {
        introPlayer?.release()
        outroPlayer?.release()
        introPlayer = null
        outroPlayer = null
    }
}

/** 외부에서 ExoPlayer를 주입받아 PlayerView에 연결하는 컴포저블 */
@Composable
fun VideoPlayer(
        exoPlayer: ExoPlayer?,
        modifier: Modifier = Modifier,
        showLoadingIndicator: Boolean = true,
        showControls: Boolean = false,
        scalingMode: VideoScalingMode = VideoScalingMode.FILL,
        onPlaybackComplete: (() -> Unit)? = null
) {
    var isBuffering by remember { mutableStateOf(false) }

    // PlayerView 크기 조정 모드 변환
    val playerViewResizeMode =
            when (scalingMode) {
                VideoScalingMode.FIT -> AspectRatioFrameLayout.RESIZE_MODE_FIT
                VideoScalingMode.FIT_WITH_CROPPING -> AspectRatioFrameLayout.RESIZE_MODE_ZOOM
                VideoScalingMode.FILL -> AspectRatioFrameLayout.RESIZE_MODE_FILL
                VideoScalingMode.ZOOM -> AspectRatioFrameLayout.RESIZE_MODE_ZOOM
            }

    // 버퍼링 상태 및 재생 완료 리스너 추가
    LaunchedEffect(exoPlayer) {
        exoPlayer?.addListener(
                object : Player.Listener {
                    override fun onPlaybackStateChanged(playbackState: Int) {
                        isBuffering = playbackState == Player.STATE_BUFFERING
                        if (playbackState == Player.STATE_ENDED && onPlaybackComplete != null) {
                            onPlaybackComplete()
                        }
                    }
                }
        )
    }

    // PlayerView를 사용하여 동영상 표시
    DisposableEffect(key1 = exoPlayer) {
        onDispose {
            // 해제는 VideoPlayerManager에서 일괄적으로 관리
        }
    }

    if (exoPlayer == null) return

    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        layoutParams =
                                FrameLayout.LayoutParams(
                                        ViewGroup.LayoutParams.MATCH_PARENT,
                                        ViewGroup.LayoutParams.MATCH_PARENT
                                )
                        player = exoPlayer
                        useController = showControls
                        setShowBuffering(PlayerView.SHOW_BUFFERING_NEVER)
                        resizeMode = playerViewResizeMode
                    }
                },
                modifier = Modifier.fillMaxSize().background(Color.White)
        )
        if (isBuffering && showLoadingIndicator) {
            CircularProgressIndicator(
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.align(Alignment.Center)
            )
        }
    }
}

/**
 * 로컬 스토리지에서 비디오 파일을 찾아 URI를 반환하는 함수
 * @param context Context
 * @param fileName 파일 이름
 * @return 비디오 파일 URI 또는 null (파일이 없는 경우)
 */
fun findVideoFileUri(context: Context, fileName: String): Uri? {
    // 내부 저장소 확인
    val internalFile = File(context.filesDir, fileName)
    if (internalFile.exists()) {
        return Uri.fromFile(internalFile)
    }
    // 외부 저장소 확인
    val externalFile = File(context.getExternalFilesDir(null), fileName)
    if (externalFile.exists()) {
        return Uri.fromFile(externalFile)
    }
    // 추가 외부 저장소 확인 (SD 카드 등)
    context.getExternalFilesDirs(null).forEach { extDir ->
        if (extDir != null && extDir != context.getExternalFilesDir(null)) {
            val file = File(extDir, fileName)
            if (file.exists()) {
                return Uri.fromFile(file)
            }
        }
    }
    Log.w("VideoPlayer", "로컬 파일을 찾을 수 없습니다: $fileName")
    return null
}
