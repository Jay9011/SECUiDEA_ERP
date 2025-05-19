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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.C
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

/**
 * 비디오 플레이어 컴포넌트
 *
 * @param videoResId 리소스 ID (R.raw.video)
 * @param videoFileName 파일 이름 (local_video.mp4)
 * @param modifier Modifier
 * @param showLoadingIndicator 로딩 표시기 보여줄지 여부
 * @param videoRepeatMode 비디오 반복 모드
 * @param muted 음소거 여부
 * @param showControls 미디어 컨트롤러 표시 여부
 * @param scalingMode 비디오 크기 조정 모드
 * @param onPlaybackComplete 재생 완료 시 호출할 콜백 함수
 * @param videoVolume 볼륨 레벨 (0.0f ~ 1.0f)
 */
@Composable
fun VideoPlayer(
        videoResId: Int? = null,
        videoFileName: String? = null,
        modifier: Modifier = Modifier,
        showLoadingIndicator: Boolean = true,
        videoRepeatMode: VideoRepeatMode = VideoRepeatMode.ALL,
        muted: Boolean = false,
        showControls: Boolean = false,
        scalingMode: VideoScalingMode = VideoScalingMode.FILL,
        onPlaybackComplete: (() -> Unit)? = null,
        videoVolume: Float = 1.0f
) {
    val context = LocalContext.current
    var isBuffering by remember { mutableStateOf(true) }
    var videoUri by remember { mutableStateOf<Uri?>(null) }

    // ExoPlayer 비디오 크기 조정 모드 변환
    val exoPlayerScalingMode =
            when (scalingMode) {
                VideoScalingMode.FIT -> C.VIDEO_SCALING_MODE_SCALE_TO_FIT
                VideoScalingMode.FIT_WITH_CROPPING -> C.VIDEO_SCALING_MODE_SCALE_TO_FIT_WITH_CROPPING
                VideoScalingMode.FILL -> C.VIDEO_SCALING_MODE_SCALE_TO_FIT_WITH_CROPPING
                VideoScalingMode.ZOOM -> C.VIDEO_SCALING_MODE_SCALE_TO_FIT_WITH_CROPPING
            }

    // PlayerView 크기 조정 모드 변환
    val playerViewResizeMode =
            when (scalingMode) {
                VideoScalingMode.FIT -> AspectRatioFrameLayout.RESIZE_MODE_FIT
                VideoScalingMode.FIT_WITH_CROPPING -> AspectRatioFrameLayout.RESIZE_MODE_ZOOM
                VideoScalingMode.FILL -> AspectRatioFrameLayout.RESIZE_MODE_FILL
                VideoScalingMode.ZOOM -> AspectRatioFrameLayout.RESIZE_MODE_ZOOM
            }

    // ExoPlayer 반복 모드 변환
    val exoPlayerRepeatMode =
            when (videoRepeatMode) {
                VideoRepeatMode.NONE -> Player.REPEAT_MODE_OFF
                VideoRepeatMode.ALL -> Player.REPEAT_MODE_ALL
                VideoRepeatMode.ONE -> Player.REPEAT_MODE_ONE
            }

    // 비디오 URI 결정
    LaunchedEffect(videoResId, videoFileName) {
        videoUri =
                when {
                    // 1. 파일 이름이 제공되고, 실제 파일이 존재할 때
                    !videoFileName.isNullOrEmpty() &&
                            findVideoFileUri(context, videoFileName) != null -> {
                        findVideoFileUri(context, videoFileName)
                    }
                    // 2. 리소스 ID가 제공되고, 리소스가 실제로 존재할 때
                    videoResId != null && resourceExists(context, videoResId) -> {
                        Uri.parse("android.resource://${context.packageName}/$videoResId")
                    }
                    // 3. 둘 다 없으면 null
                    else -> null
                }

        if (videoUri == null) {
            Log.w(
                    "VideoPlayer",
                    "비디오 URI를 찾을 수 없습니다. videoResId: $videoResId, videoFileName: $videoFileName"
            )
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
                    try {
                        val mediaItem = MediaItem.fromUri(videoUri!!)
                        setMediaItem(mediaItem)
                        this.repeatMode = exoPlayerRepeatMode
                        playWhenReady = true // 준비되면 자동 재생
                        this.videoScalingMode = exoPlayerScalingMode
                        this.volume = if (muted) 0f else videoVolume.coerceIn(0f, 1f)
                        prepare()
                    } catch (e: Exception) {
                        Log.e("VideoPlayer", "ExoPlayer 초기화 오류: ${e.message}")
                    }
                }
            }

    // 버퍼링 상태 및 재생 완료 리스너 추가
    LaunchedEffect(exoPlayer) {
        exoPlayer.addListener(
                object : Player.Listener {
                    override fun onPlaybackStateChanged(playbackState: Int) {
                        isBuffering = playbackState == Player.STATE_BUFFERING

                        // 재생 완료 콜백 실행
                        if (playbackState == Player.STATE_ENDED &&
                                        onPlaybackComplete != null &&
                                        videoRepeatMode == VideoRepeatMode.NONE
                        ) {
                            onPlaybackComplete()
                        }
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
                        useController = showControls
                        setShowBuffering(PlayerView.SHOW_BUFFERING_NEVER)
                        resizeMode = playerViewResizeMode
                    }
                },
                modifier = Modifier.fillMaxSize().background(Color.White)
        )

        // 버퍼링 표시기
        if (isBuffering && showLoadingIndicator) {
            CircularProgressIndicator(
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.align(Alignment.Center)
            )
        }
    }
}

private fun resourceExists(context: Context, resId: Int): Boolean {
    return try {
        context.resources.getResourceName(resId)
        true
    } catch (e: Exception) {
        Log.w("VideoPlayer", "리소스 ID($resId)가 존재하지 않습니다: ${e.message}")
        false
    }
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

    Log.w("VideoPlayer", "로컬 파일을 찾을 수 없습니다: $fileName")
    return null
}
