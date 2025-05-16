package com.secuidea.visitreservekiosk.api

import android.content.Context
import android.content.SharedPreferences
import androidx.compose.runtime.mutableStateOf
import androidx.preference.PreferenceManager

/** API 설정을 관리하는 싱글톤 클래스 */
object ApiSettings {
    private const val KEY_BASE_URL = "api_base_url"
    private const val DEFAULT_BASE_URL = "https://10.0.2.2:7151/" // 기본 URL

    // 현재 BaseURL을 상태로 관리
    val currentBaseUrl = mutableStateOf(DEFAULT_BASE_URL)

    private lateinit var prefs: SharedPreferences

    /** ApiSettings 초기화 */
    fun init(context: Context) {
        prefs = PreferenceManager.getDefaultSharedPreferences(context)
        currentBaseUrl.value = prefs.getString(KEY_BASE_URL, DEFAULT_BASE_URL) ?: DEFAULT_BASE_URL
    }

    /** BaseURL 설정 */
    fun setBaseUrl(url: String) {
        // URL 형식 검증
        val formattedUrl = formatUrl(url)

        // 설정 저장
        prefs.edit().putString(KEY_BASE_URL, formattedUrl).apply()
        currentBaseUrl.value = formattedUrl
    }

    /** BaseURL 가져오기 */
    fun getBaseUrl(): String {
        return currentBaseUrl.value
    }

    /** URL 포맷 검증 및 수정 */
    private fun formatUrl(url: String): String {
        var formattedUrl = url.trim()

        // http:// 또는 https:// 프로토콜이 없으면 https:// 추가
        if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
            formattedUrl = "https://$formattedUrl"
        }

        // 마지막에 / 가 없으면 추가
        if (!formattedUrl.endsWith("/")) {
            formattedUrl = "$formattedUrl/"
        }

        return formattedUrl
    }

    /** 기본 URL로 재설정 */
    fun resetToDefault() {
        setBaseUrl(DEFAULT_BASE_URL)
    }
}
