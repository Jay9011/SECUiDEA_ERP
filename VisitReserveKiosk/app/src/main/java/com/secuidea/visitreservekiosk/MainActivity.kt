package com.secuidea.visitreservekiosk

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.media3.exoplayer.ExoPlayer
import com.secuidea.visitreservekiosk.language.AppStrings
import com.secuidea.visitreservekiosk.language.LocaleHelper
import com.secuidea.visitreservekiosk.ui.components.VideoPlayer
import com.secuidea.visitreservekiosk.ui.components.VideoPlayerManager
import com.secuidea.visitreservekiosk.ui.components.findVideoFileUri
import com.secuidea.visitreservekiosk.ui.theme.PrimaryColor
import com.secuidea.visitreservekiosk.ui.theme.SecondaryColor
import com.secuidea.visitreservekiosk.ui.theme.VisitReserveKioskTheme

class MainActivity : ComponentActivity() {
        override fun onCreate(savedInstanceState: Bundle?) {
                super.onCreate(savedInstanceState)

                // 상태 표시줄 완전히 숨기기
                window.setFlags(
                        WindowManager.LayoutParams.FLAG_FULLSCREEN,
                        WindowManager.LayoutParams.FLAG_FULLSCREEN
                )

                // API 30+ 일때 숨기기
                WindowCompat.setDecorFitsSystemWindows(window, false)
                val controller = WindowCompat.getInsetsController(window, window.decorView)
                controller.hide(WindowInsetsCompat.Type.systemBars())
                controller.systemBarsBehavior =
                        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

                enableEdgeToEdge()

                // intro, outro 비디오 미리 준비
                val introUri =
                        findVideoFileUri(this, "intro.mp4")
                                ?: Uri.parse("android.resource://${packageName}/${R.raw.intro}")
                val outroUri =
                        findVideoFileUri(this, "outro.mp4")
                                ?: Uri.parse("android.resource://${packageName}/${R.raw.outro}")
                VideoPlayerManager.prepareIntroPlayer(this, introUri)
                VideoPlayerManager.prepareOutroPlayer(this, outroUri)

                setContent {
                        VisitReserveKioskTheme {
                                MainScreen(
                                        onVisitRequestClick = {
                                                // 비디오 플레이어 일시정지
                                                VideoPlayerManager.introPlayer?.pause()
                                                val intent = Intent(this, PrivacyAgreementActivity::class.java)
                                                startActivity(intent)
                                        },
                                        onAdminSettingsClick = {
                                                // API 설정 화면으로 이동
                                                val intent =
                                                        Intent(
                                                                this,
                                                                ApiSettingsActivity::class.java
                                                        )
                                                startActivity(intent)
                                        },
                                        introPlayer = VideoPlayerManager.introPlayer
                                )
                        }
                }
        }

        override fun onDestroy() {
                super.onDestroy()
                // 앱 종료 시 모든 ExoPlayer 인스턴스 해제
                VideoPlayerManager.releaseAll()
        }
}

@Composable
fun MainScreen(
        onVisitRequestClick: () -> Unit = {},
        onAdminSettingsClick: () -> Unit = {},
        introPlayer: ExoPlayer? = null
) {
        val context = LocalContext.current

        // 상태 정의
        val buttonScale by animateFloatAsState(targetValue = 1f, label = "buttonScale")
        val currentLanguage by remember { LocaleHelper.currentLanguage }

        // 로고를 위한 painter
        val logoPainter = painterResource(id = R.drawable.logo)

        // 숨겨진 버튼 터치 카운터
        var secretTapCount by remember { mutableIntStateOf(0) }

        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                Column(
                        modifier = Modifier.fillMaxSize(),
                        horizontalAlignment = Alignment.CenterHorizontally
                ) {
                        // 상단 메뉴바 (언어 변경 버튼 포함)
                        Row(
                                modifier = Modifier.fillMaxWidth().padding(8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                        ) {
                                // 숨겨진 관리자 설정 영역 (상단 좌측)
                                Box(
                                        modifier =
                                                Modifier.size(100.dp).clickable {
                                                        secretTapCount++
                                                        if (secretTapCount >= 5) {
                                                                secretTapCount = 0
                                                                onAdminSettingsClick()
                                                        }
                                                }
                                ) {
                                        // 빈 박스
                                }

                                // 언어 전환 버튼
                                Button(
                                        onClick = { LocaleHelper.toggleLanguage() },
                                        modifier = Modifier.width(136.dp).height(60.dp),
                                        colors =
                                                ButtonDefaults.buttonColors(
                                                        containerColor = SecondaryColor
                                                ),
                                        shape = RoundedCornerShape(13.dp),
                                ) {
                                        Text(
                                                text = AppStrings.changeLanguageButton,
                                                style = MaterialTheme.typography.displaySmall
                                        )
                                }
                        }

                        // 브랜드 이름
                        Box(
                                modifier =
                                        Modifier.fillMaxWidth()
                                                .weight(.5f)
                                                .padding(vertical = 16.dp),
                                contentAlignment = Alignment.BottomCenter
                        ) {
                                Column(
                                        Modifier.fillMaxWidth().padding(horizontal = 24.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.Center
                                ) {
                                        // 회전 애니메이션을 위한 무한 트랜지션
                                        val infiniteTransition =
                                                rememberInfiniteTransition(label = "logoRotation")

                                        // Y축 회전 각도 애니메이션 (0도 ~ 360도)
                                        val rotationY by
                                                infiniteTransition.animateFloat(
                                                        initialValue = 0f,
                                                        targetValue = 360f,
                                                        animationSpec =
                                                                infiniteRepeatable(
                                                                        animation =
                                                                                tween(
                                                                                        4000,
                                                                                        easing =
                                                                                                LinearEasing
                                                                                ),
                                                                        repeatMode =
                                                                                RepeatMode.Restart
                                                                ),
                                                        label = "rotationYAnimation"
                                                )

                                        // 로고 표시 (Y축 회전 효과 적용)
                                        Image(
                                                painter = logoPainter,
                                                contentDescription = "ASMK 로고",
                                                modifier =
                                                        Modifier.size(120.dp).graphicsLayer {
                                                                // Y축 기준 회전
                                                                this.rotationY = rotationY
                                                                // 3D 효과를 위한 카메라 거리 설정
                                                                this.cameraDistance = 8f * density
                                                        }
                                        )

                                        Spacer(modifier = Modifier.height(10.dp))

                                        // 앱 타이틀
                                        Text(
                                                text = AppStrings.appTitle,
                                                style = MaterialTheme.typography.displayLarge,
                                                color = PrimaryColor
                                        )
                                }
                        }

                        // 동영상 영역
                        Box(
                                modifier = Modifier.fillMaxWidth().aspectRatio(16f / 9f),
                                contentAlignment = Alignment.Center
                        ) { VideoPlayer(exoPlayer = introPlayer) }

                        // 하단 환영 메시지 및 버튼
                        Box(
                                modifier = Modifier.fillMaxWidth().weight(1f),
                                contentAlignment = Alignment.Center
                        ) {
                                Column(
                                        modifier =
                                                Modifier.fillMaxWidth()
                                                        .padding(
                                                                horizontal = 24.dp,
                                                                vertical = 24.dp
                                                        ),
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                        verticalArrangement = Arrangement.Center
                                ) {
                                        Text(
                                                text = AppStrings.welcomeTitle,
                                                style = MaterialTheme.typography.displayMedium,
                                                color = MaterialTheme.colorScheme.onBackground,
                                                textAlign = TextAlign.Center
                                        )

                                        Spacer(modifier = Modifier.height(8.dp))

                                        Text(
                                                text = AppStrings.welcomeSubtitle,
                                                style = MaterialTheme.typography.displaySmall,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                textAlign = TextAlign.Center
                                        )

                                        Spacer(modifier = Modifier.height(32.dp))

                                        // 방문 신청 버튼
                                        Button(
                                                onClick = onVisitRequestClick,
                                                colors =
                                                        ButtonDefaults.buttonColors(
                                                                containerColor = PrimaryColor
                                                        ),
                                                modifier =
                                                        Modifier.fillMaxWidth(0.7f).height(72.dp),
                                                shape = RoundedCornerShape(22.dp),
                                                contentPadding =
                                                        ButtonDefaults.ButtonWithIconContentPadding
                                        ) {
                                                Row(
                                                        horizontalArrangement = Arrangement.Center,
                                                        verticalAlignment =
                                                                Alignment.CenterVertically
                                                ) {
                                                        Icon(
                                                                painter =
                                                                        painterResource(
                                                                                android.R
                                                                                        .drawable
                                                                                        .ic_menu_edit
                                                                        ),
                                                                contentDescription = null,
                                                                tint = Color.White,
                                                                modifier =
                                                                        Modifier.padding(end = 8.dp)
                                                                                .size(32.dp)
                                                        )
                                                        Text(
                                                                text =
                                                                        AppStrings
                                                                                .visitRequestButton,
                                                                style =
                                                                        MaterialTheme.typography
                                                                                .displayMedium,
                                                                maxLines = 1
                                                        )
                                                }
                                        }
                                }
                        }
                }
        }
}

@Preview(showBackground = true, widthDp = 720, heightDp = 1280)
@Composable
fun MainScreenPreview() {
        VisitReserveKioskTheme { MainScreen() }
}
