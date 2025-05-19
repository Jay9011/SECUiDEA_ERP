package com.secuidea.visitreservekiosk

import android.content.Context
import android.net.Uri
import android.view.ViewGroup
import android.widget.FrameLayout
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
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import java.io.File

/**
 * 비디오 플레이어 컴포넌트
 *
 * @param videoResId 리소스 ID (R.raw.video)
 * @param videoFileName 파일 이름 (local_video.mp4)
 * @param modifier Modifier
 */
@Composable
fun VideoPlayer(
        videoResId: Int? = null,
        videoFileName: String? = null,
        modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var isBuffering by remember { mutableStateOf(true) }
    var videoUri by remember { mutableStateOf<Uri?>(null) }

    // 비디오 URI 결정
    LaunchedEffect(videoResId, videoFileName) {
        videoUri =
                when {
                    // 1. 파일 이름이 제공되고, 실제 파일이 존재할 때
                    !videoFileName.isNullOrEmpty() && findVideoFileUri(context, videoFileName) != null -> {
                        findVideoFileUri(context, videoFileName)
                    }
                    // 2. 리소스 ID가 제공되고, 리소스가 실제로 존재할 때
                    videoResId != null && resourceExists(context, videoResId) -> {
                        Uri.parse("android.resource://${context.packageName}/$videoResId")
                    }
                    // 3. 둘 다 없으면 null
                    else -> null
                }
    }

    // 비디오 URI가 없으면 표시하지 않음
    if (videoUri == null) {
        return
    }

    // ExoPlayer 인스턴스 생성
    val exoPlayer =
            remember(videoUri) {
                ExoPlayer.Builder(context).build().apply {
                    val mediaItem = MediaItem.fromUri(videoUri!!)
                    setMediaItem(mediaItem)
                    repeatMode = Player.REPEAT_MODE_ALL // 비디오 반복 재생
                    playWhenReady = true // 준비되면 자동 재생
                    videoScalingMode = C.VIDEO_SCALING_MODE_SCALE_TO_FIT_WITH_CROPPING
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

    // PlayerView를 사용하여 동영상 표시
    DisposableEffect(key1 = videoUri) {
        onDispose {
            exoPlayer.release() // 컴포넌트가 해제될 때 플레이어 리소스 해제
        }
    }

    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        // 비디오 플레이어 뷰
        AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        layoutParams =
                                FrameLayout.LayoutParams(
                                        ViewGroup.LayoutParams.MATCH_PARENT,
                                        ViewGroup.LayoutParams.MATCH_PARENT
                                )
                        player = exoPlayer
                        useController = false // 컨트롤러 숨기기
                        setShowBuffering(PlayerView.SHOW_BUFFERING_NEVER)
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

private fun resourceExists(context: Context, resId: Int): Boolean {
    try {
        context.resources.getResourceName(resId)
        return true
    } catch (e: Exception) {
        return false
    }

    return false
}

/**
 * 로컬 스토리지에서 비디오 파일을 찾아 URI를 반환하는 함수
 *
 * @param context Context
 * @param fileName 파일 이름
 * @return 비디오 파일 URI 또는 null (파일이 없는 경우)
 */
private fun findVideoFileUri(context: Context, fileName: String): Uri? {
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

    return null
}
