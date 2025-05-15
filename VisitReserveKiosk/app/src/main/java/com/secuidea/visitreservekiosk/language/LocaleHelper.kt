package com.secuidea.visitreservekiosk.language

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.mutableStateOf
import androidx.preference.PreferenceManager

/** 언어 설정을 관리하는 싱글톤 클래스 */
object LocaleHelper {
    private const val LANGUAGE_KEY = "language_key"
    private const val DEFAULT_LANGUAGE = "ko"

    val currentLanguage = mutableStateOf(DEFAULT_LANGUAGE)

    private lateinit var prefs: SharedPreferences

    /** 언어 설정 초기화 */
    fun init(context: Context) {
        prefs = PreferenceManager.getDefaultSharedPreferences(context)
        currentLanguage.value = prefs.getString(LANGUAGE_KEY, DEFAULT_LANGUAGE) ?: DEFAULT_LANGUAGE
    }

    /**
     * 언어 설정
     * @param languageCode 언어 코드 (ko: 한국어, en: 영어)
     */
    fun setLanguage(languageCode: String) {
        prefs.edit().putString(LANGUAGE_KEY, languageCode).apply()
        currentLanguage.value = languageCode
    }

    /** 현재 언어가 한국어인지 확인 */
    fun isKorean(): Boolean {
        return currentLanguage.value == "ko"
    }

    /** 현재 설정된 언어 코드 가져오기 */
    fun getLanguage(): String {
        return currentLanguage.value
    }

    /** 언어 전환 (한국어 <-> 영어) */
    fun toggleLanguage() {
        val newLanguage = if (isKorean()) "en" else "ko"
        setLanguage(newLanguage)
    }
}
