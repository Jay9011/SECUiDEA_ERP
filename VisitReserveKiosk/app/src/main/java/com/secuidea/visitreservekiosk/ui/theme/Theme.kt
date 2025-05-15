package com.secuidea.visitreservekiosk.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// 모던한 키오스크 테마 색상 스키마
private val KioskColorScheme =
        lightColorScheme(
                primary = PrimaryColor,
                onPrimary = TextOnPrimaryColor,
                secondary = SecondaryColor,
                onSecondary = TextOnPrimaryColor,
                tertiary = TertiaryColor,
                onTertiary = TextOnPrimaryColor,
                background = BackgroundColor,
                onBackground = TextPrimaryColor,
                surface = SurfaceColor,
                onSurface = TextPrimaryColor,
                surfaceVariant = SurfaceTintColor,
                onSurfaceVariant = TextSecondaryColor,
                error = ErrorColor,
                outline = TextTertiaryColor
        )

@Composable
fun VisitReserveKioskTheme(
        darkTheme: Boolean = false, // 항상 라이트 테마 사용
        dynamicColor: Boolean = false, // 커스텀 색상 사용
        content: @Composable () -> Unit
) {
    val colorScheme = KioskColorScheme

    // 상태 표시줄 색상 설정
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = true
        }
    }

    MaterialTheme(colorScheme = colorScheme, typography = KioskTypography, content = content)
}
