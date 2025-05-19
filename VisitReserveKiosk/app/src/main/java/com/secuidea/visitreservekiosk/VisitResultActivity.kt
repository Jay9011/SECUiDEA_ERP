package com.secuidea.visitreservekiosk

import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.secuidea.visitreservekiosk.ui.screen.VisitResultScreen
import com.secuidea.visitreservekiosk.ui.theme.VisitReserveKioskTheme

class VisitResultActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 상태 표시줄 완전히 숨기기
        window.setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        )

        // 또는 더 최신 방법 (API 30+)으로 숨기기
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowCompat.getInsetsController(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE

        val visitorName = intent.getStringExtra("visitorName") ?: ""
        val visitDate = intent.getStringExtra("visitDate") ?: ""
        setContent {
            VisitReserveKioskTheme {
                VisitResultScreen(
                        visitorName = visitorName,
                        visitDate = visitDate,
                        onBackClick = { finish() }
                )
            }
        }
    }
}
