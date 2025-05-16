package com.secuidea.visitreservekiosk.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

// 폰트 패밀리 정의 - 시스템 폰트 사용
val DefaultFontFamily = FontFamily.Default
val SansSerifFontFamily = FontFamily.SansSerif

// 모던한 타이포그래피 스타일 정의
val KioskTypography =
        Typography(
                // 큰 제목 (환영 메시지용)
                displayLarge =
                        TextStyle(
                                fontFamily = SansSerifFontFamily,
                                fontWeight = FontWeight.Bold,
                                fontSize = 72.sp,
                                lineHeight = 85.sp,
                                letterSpacing = (-0.2).sp
                        ),
                // 중간 제목 (영어 환영 메시지용)
                displayMedium =
                        TextStyle(
                                fontFamily = SansSerifFontFamily,
                                fontWeight = FontWeight.Medium,
                                fontSize = 48.sp,
                                lineHeight = 52.sp,
                                letterSpacing = 0.sp
                        ),
                // 작은 제목
                displaySmall =
                        TextStyle(
                                fontFamily = SansSerifFontFamily,
                                fontWeight = FontWeight.Medium,
                                fontSize = 36.sp,
                                lineHeight = 48.sp,
                                letterSpacing = 0.sp
                        ),
                // 버튼 텍스트
                labelLarge =
                        TextStyle(
                                fontFamily = SansSerifFontFamily,
                                fontWeight = FontWeight.Medium,
                                fontSize = 16.sp,
                                lineHeight = 20.sp,
                                letterSpacing = 0.sp
                        ),
                // 일반 본문 텍스트
                bodyLarge =
                        TextStyle(
                                fontFamily = DefaultFontFamily,
                                fontWeight = FontWeight.Normal,
                                fontSize = 16.sp,
                                lineHeight = 24.sp,
                                letterSpacing = 0.5.sp
                        ),
                // 작은 텍스트
                bodyMedium =
                        TextStyle(
                                fontFamily = DefaultFontFamily,
                                fontWeight = FontWeight.Normal,
                                fontSize = 14.sp,
                                lineHeight = 20.sp,
                                letterSpacing = 0.25.sp
                        ),
                // 매우 작은 텍스트
                bodySmall =
                        TextStyle(
                                fontFamily = DefaultFontFamily,
                                fontWeight = FontWeight.Normal,
                                fontSize = 12.sp,
                                lineHeight = 16.sp,
                                letterSpacing = 0.4.sp
                        )
        )
