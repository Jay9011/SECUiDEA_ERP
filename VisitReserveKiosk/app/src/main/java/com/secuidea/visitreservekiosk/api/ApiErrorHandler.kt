package com.secuidea.visitreservekiosk.api

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch

/** API 오류 처리를 위한 확장 함수와 유틸리티를 제공하는 클래스 */
object ApiErrorHandler {
    /**
     * ViewModel에서 API 호출을 안전하게 실행하기 위한 확장 함수
     *
     * @param apiErrorState API 오류 상태를 저장할 StateFlow
     * @param loadingState 로딩 상태를 저장할 StateFlow (nullable)
     * @param block 실행할 API 호출 코드 블록
     */
    suspend fun <T> ViewModel.safeApiCall(
        apiErrorState: MutableStateFlow<ApiException?>,
        loadingState: MutableStateFlow<Boolean>? = null,
        block: suspend () -> T
    ): T? {
        loadingState?.value = true
        return try {
            block()
        } catch (e: ApiException) {
            apiErrorState.value = e
            null
        } catch (e: Exception) {
            apiErrorState.value =
                ApiException(
                    title = "예상치 못한 오류",
                    message = "알 수 없는 오류가 발생했습니다: ${e.message}",
                    cause = e
                )
            null
        } finally {
            loadingState?.value = false
        }
    }

    /** 코루틴 범위 내에서 API 호출을 안전하게 실행하기 위한 확장 함수 */
    fun ViewModel.launchSafeApiCall(
        apiErrorState: MutableStateFlow<ApiException?>,
        loadingState: MutableStateFlow<Boolean>? = null,
        block: suspend () -> Unit
    ) {
        viewModelScope.launch { safeApiCall(apiErrorState, loadingState, block) }
    }
}
