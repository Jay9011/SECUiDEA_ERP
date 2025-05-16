package com.secuidea.visitreservekiosk.api

/**
 * API 호출 중 발생하는 예외를 표현하는 클래스
 *
 * @param title 오류 제목
 * @param message 오류 메시지
 * @param cause 원인 예외
 * @param errorCode 에러 코드 (선택)
 */
class ApiException(
    val title: String,
    override val message: String,
    override val cause: Throwable? = null,
    val errorCode: String? = null
) : Exception(message, cause) {
    companion object {
        /** 네트워크 오류에 대한 ApiException 생성 */
        fun createNetworkError(e: Throwable): ApiException {
            return ApiException(
                title = "네트워크 오류",
                message = "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.",
                cause = e
            )
        }

        /** 서버 오류에 대한 ApiException 생성 */
        fun createServerError(code: Int, message: String): ApiException {
            return ApiException(
                title = "서버 오류",
                message = "서버에서 오류가 발생했습니다. (오류 코드: $code)",
                errorCode = code.toString()
            )
        }

        /** 응답 처리 중 오류에 대한 ApiException 생성 */
        fun createResponseError(message: String): ApiException {
            return ApiException(title = "응답 처리 오류", message = message)
        }
    }
}
