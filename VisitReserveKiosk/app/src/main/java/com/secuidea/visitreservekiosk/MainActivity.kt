package com.secuidea.visitreservekiosk

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.core.animateFloatAsState
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
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.secuidea.visitreservekiosk.language.AppStrings
import com.secuidea.visitreservekiosk.language.LocaleHelper
import com.secuidea.visitreservekiosk.ui.screen.ApiSettingsActivity
import com.secuidea.visitreservekiosk.ui.theme.PrimaryColor
import com.secuidea.visitreservekiosk.ui.theme.SecondaryColor
import com.secuidea.visitreservekiosk.ui.theme.VisitReserveKioskTheme
import java.io.File

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
        setContent {
            VisitReserveKioskTheme {
                // 앱이 시작될 때 내부 리소스에서 기본 동영상 로드
                val defaultVideoUri = "android.resource://${packageName}/raw/intro"
                MainScreen(
                    defaultVideoUri = Uri.parse(defaultVideoUri),
                    onVisitRequestClick = {
                        // 방문 신청 화면으로 이동
                        val intent = Intent(this, PrivacyAgreementActivity::class.java)
                        startActivity(intent)
                    },
                    onAdminSettingsClick = {
                        // API 설정 화면으로 이동
                        val intent = Intent(this, ApiSettingsActivity::class.java)
                        startActivity(intent)
                    }
                )
            }
        }
    }
}

@Composable
fun MainScreen(
    defaultVideoUri: Uri? = null,
    onVisitRequestClick: () -> Unit = {},
    onAdminSettingsClick: () -> Unit = {}
) {
    val context = LocalContext.current

    // 상태 정의
    var videoUri by remember { mutableStateOf(defaultVideoUri) }
    val buttonScale by animateFloatAsState(targetValue = 1f, label = "buttonScale")
    val currentLanguage by remember { LocaleHelper.currentLanguage }

    // 숨겨진 버튼 터치 카운터
    var secretTapCount by remember { mutableIntStateOf(0) }

    // 앱이 시작될 때 외부 저장소에서 동영상 확인
    DisposableEffect(Unit) {
        val externalDir = context.getExternalFilesDir(null)
        val videoFile = File(externalDir, "intro.mp4")

        // 외부 저장소에 동영상이 있으면 해당 동영상 사용
        if (videoFile.exists()) {
            videoUri = Uri.fromFile(videoFile)
        }

        onDispose {}
    }

    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // 상단 메뉴바 (언어 변경 버튼 포함)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // 숨겨진 관리자 설정 영역 (상단 좌측)
                Box(
                    modifier =
                        Modifier
                            .size(100.dp)
                            .clickable {
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
                    modifier = Modifier
                        .width(136.dp)
                        .height(60.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = SecondaryColor),
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
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(.5f)
                    .padding(vertical = 16.dp),
                contentAlignment = Alignment.BottomCenter
            ) {
                Column(
                    Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(text = "ASMK 로고")
                    Text(
                        text = AppStrings.appTitle,
                        style = MaterialTheme.typography.displayLarge,
                        color = PrimaryColor
                    )
                }
            }

            // 동영상 영역
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f), // 16:9 비율 유지
                contentAlignment = Alignment.Center
            ) {
                // 동영상 플레이어
                if (videoUri != null) {
                    VideoPlayer(videoUri = videoUri!!)
                } else {
                    // 비디오가 없을 때 표시할 메시지
                    Text(
                        text = "동영상을 찾을 수 없습니다",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // 하단 환영 메시지 및 버튼
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    modifier =
                        Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp, vertical = 24.dp),
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
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryColor),
                        modifier = Modifier
                            .fillMaxWidth(0.7f)
                            .height(72.dp),
                        shape = RoundedCornerShape(22.dp),
                        contentPadding = ButtonDefaults.ButtonWithIconContentPadding
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                painter = painterResource(android.R.drawable.ic_menu_edit),
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier
                                    .padding(end = 8.dp)
                                    .size(32.dp)
                            )
                            Text(
                                text = AppStrings.visitRequestButton,
                                style = MaterialTheme.typography.displayMedium,
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
