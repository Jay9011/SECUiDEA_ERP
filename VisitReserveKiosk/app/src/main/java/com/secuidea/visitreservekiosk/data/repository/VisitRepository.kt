package com.secuidea.visitreservekiosk.data.repository

import com.secuidea.visitreservekiosk.api.ApiException
import com.secuidea.visitreservekiosk.api.ApiService
import com.secuidea.visitreservekiosk.api.VisitRequest
import com.secuidea.visitreservekiosk.data.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** API 요청 결과를 나타내는 sealed 클래스 */
sealed class ApiResult<out T> {
    data class Success<out T>(val data: T) : ApiResult<T>()
    data class Error(val message: String, val exception: Exception? = null) : ApiResult<Nothing>()
    object Loading : ApiResult<Nothing>()
}

/** 방문 관련 API 호출을 처리하는 Repository */
class VisitRepository {
    private val apiInterface = ApiService.getApiInterface()

    /**
     * 방문 목적 목록 조회
     * @param language 언어 코드 (ko: 한국어, en: 영어)
     * @throws ApiException API 호출 중 오류가 발생한 경우
     */
    suspend fun getVisitReasons(language: String): VisitReasonsResponse {
        try {
            val response = apiInterface.getVisitReasons(language)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    if (!body.isSuccess) {
                        throw ApiException.createResponseError(
                                body.message ?: "응답 처리 중 오류가 발생했습니다."
                        )
                    }
                    return body
                } else {
                    throw ApiException.createResponseError("응답이 없습니다.")
                }
            } else {
                throw ApiException.createServerError(response.code(), response.message())
            }
        } catch (e: ApiException) {
            throw e
        } catch (e: Exception) {
            throw ApiException.createNetworkError(e)
        }
    }

    /**
     * 직원 확인
     * @param name 직원 이름
     * @throws ApiException API 호출 중 오류가 발생한 경우
     */
    suspend fun verifyEmployee(name: String): VerifyEmployeeResponse {
        try {
            // GET 방식으로 직원 이름을 쿼리 파라미터로 전달
            val response = apiInterface.verifyEmployee(name)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    return body
                } else {
                    throw ApiException.createResponseError("응답이 없습니다.")
                }
            } else {
                throw ApiException.createServerError(response.code(), response.message())
            }
        } catch (e: ApiException) {
            throw e
        } catch (e: Exception) {
            throw ApiException.createNetworkError(e)
        }
    }

    /**
     * 방문 신청
     * @param request 방문 신청 요청 데이터
     * @throws ApiException API 호출 중 오류가 발생한 경우
     */
    suspend fun submitVisitReservation(request: VisitReservationRequest): VisitReservationResponse {
        try {
            val response = apiInterface.submitVisitReservation(request)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    if (!body.isSuccess) {
                        throw ApiException.createResponseError(
                                body.message ?: "응답 처리 중 오류가 발생했습니다."
                        )
                    }
                    return body
                } else {
                    throw ApiException.createResponseError("응답이 없습니다.")
                }
            } else {
                throw ApiException.createServerError(response.code(), response.message())
            }
        } catch (e: ApiException) {
            throw e
        } catch (e: Exception) {
            throw ApiException.createNetworkError(e)
        }
    }

    /**
     * 일반 방문 신청 API 호출
     * @param visitRequest 방문 요청 객체
     * @return 성공 여부와 메시지를 포함한 결과
     */
    suspend fun submitVisitRequest(visitRequest: VisitRequest): ApiResult<String> {
        return withContext(Dispatchers.IO) {
            try {
                // 실제 구현에서는 이 부분을 주석 해제하고 사용
                // val response = apiInterface.submitVisitRequest(visitRequest)
                // if (response.isSuccessful) {
                //     val apiResponse = response.body()
                //     if (apiResponse != null && apiResponse.success) {
                //         ApiResult.Success(apiResponse.data ?: "방문 신청이 완료되었습니다.")
                //     } else {
                //         ApiResult.Error(apiResponse?.message ?: "방문 신청에 실패했습니다.")
                //     }
                // } else {
                //     ApiResult.Error("서버 오류: ${response.code()} - ${response.message()}")
                // }

                // 테스트용 임시 코드
                ApiResult.Error("테스트")
            } catch (e: Exception) {
                ApiResult.Error("네트워크 오류: ${e.message}", e)
            }
        }
    }

    /**
     * 방문 정보 조회 API 호출
     * @param visitId 방문 ID
     * @return 방문 정보 객체 또는 에러 메시지
     */
    suspend fun getVisitDetails(visitId: String): ApiResult<VisitRequest> {
        return withContext(Dispatchers.IO) {
            try {
                // 실제 구현에서는 이 부분을 주석 해제하고 사용
                // val response = apiInterface.getVisitDetails(visitId)
                // if (response.isSuccessful) {
                //     val apiResponse = response.body()
                //     if (apiResponse != null && apiResponse.success && apiResponse.data != null) {
                //         ApiResult.Success(apiResponse.data)
                //     } else {
                //         ApiResult.Error(apiResponse?.message ?: "방문 정보를 찾을 수 없습니다.")
                //     }
                // } else {
                //     ApiResult.Error("서버 오류: ${response.code()} - ${response.message()}")
                // }

                // 테스트용 임시 코드
                ApiResult.Error("테스트")
            } catch (e: Exception) {
                ApiResult.Error("네트워크 오류: ${e.message}", e)
            }
        }
    }

    /**
     * 알림톡 메시지 발송
     * @param apiKey API 키
     * @param request 알림톡 요청 데이터
     * @throws ApiException API 호출 중 오류가 발생한 경우
     */
    private suspend fun sendMessage(
            apiKey: String,
            request: KakaoMessageRequest
    ): KakaoMessageResponse {
        try {
            val response = apiInterface.sendMessage(request, apiKey)
            if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    return body
                } else {
                    throw ApiException.createResponseError("응답이 없습니다.")
                }
            } else {
                throw ApiException.createServerError(response.code(), response.message())
            }
        } catch (e: ApiException) {
            throw e
        } catch (e: Exception) {
            throw ApiException.createNetworkError(e)
        }
    }

    /**
     * 템플릿 메시지 발송
     * @param apiKey API 키
     * @param gubun 메시지 구분
     * @param phoneNumber 수신자 전화번호
     * @param userName 수신자 이름
     * @param templateVariables 템플릿 변수 맵
     * @param queryVariables 쿼리 변수 맵
     */
    suspend fun sendTemplateMessage(
            apiKey: String,
            gubun: String,
            phoneNumber: String,
            userName: String,
            templateVariables: Map<String, String> = mapOf(),
            queryVariables: Map<String, String> = mapOf()
    ): KakaoMessageResponse {
        // 수신자 정보 생성
        val receiver =
                ReceiverInfo(
                        phone = phoneNumber,
                        name = userName,
                        variables = templateVariables,
                        queryVariables = queryVariables
                )

        // 요청 모델 생성
        val requestModel = KakaoMessageRequest(gubun = gubun, receiverList = listOf(receiver))

        // API 호출
        return sendMessage(apiKey, requestModel)
    }

    /**
     * 방문자 교육 완료 처리를 자동으로 수행합니다.
     * @param visitorName 방문자 이름
     * @param visitorContact 방문자 연락처
     * @return 성공 여부와 에러 메시지를 포함한 결과
     */
    suspend fun autoCompleteEducation(request: GuestLoginModel): ApiResult<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                // 1. S1_GUEST로 임시 로그인 요청
                val loginResult = apiInterface.loginAsGuest(request)

                if (!loginResult.isSuccessful) {
                    return@withContext ApiResult.Error(
                            "게스트 로그인 실패: ${loginResult.code()} - ${loginResult.message()}"
                    )
                }

                val loginResponse = loginResult.body()
                if (loginResponse == null || loginResponse.data?.token?.accessToken.isNullOrEmpty()) {
                    return@withContext ApiResult.Error("인증 토큰을 받지 못했습니다.")
                }

                // 2. 받은 JWT 토큰으로 교육 완료 API 호출
                val accessToken = loginResponse.data.token.accessToken
                val completionResponse =
                        apiInterface.completeEducation(
                                "Bearer $accessToken",
                                mapOf("completionType" to 2) // 키오스크 임시 교육 완료 타입
                        )

                if (!completionResponse.isSuccessful) {
                    return@withContext ApiResult.Error(
                            "교육 완료 처리 실패: ${completionResponse.code()} - ${completionResponse.message()}"
                    )
                }

                ApiResult.Success(true)
            } catch (e: Exception) {
                ApiResult.Error("교육 완료 처리 중 오류 발생: ${e.message}", e)
            }
        }
    }
}
