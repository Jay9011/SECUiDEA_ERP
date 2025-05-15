package com.secuidea.visitreservekiosk.language

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable

/** 앱에서 사용하는 문자열 리소스 */
object AppStrings {
    val appTitle: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "ASMK 방문 예약 시스템" else "ASMK Visit Request System"

    val welcomeTitle: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "ASMK 방문을 환영합니다" else "Welcome to ASMK"

    val welcomeSubtitle: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "방문 신청을 위해 아래 버튼을 눌러주세요"
                else "Please press the button below to request a visit"

    val visitRequestButton: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "방문 신청" else "Visit Request"

    val changeLanguageButton: String
        @Composable @ReadOnlyComposable get() = if (LocaleHelper.isKorean()) "English" else "한국어"

    val changeLanguageDescription: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "영어로 전환" else "Switch to Korean"
}
