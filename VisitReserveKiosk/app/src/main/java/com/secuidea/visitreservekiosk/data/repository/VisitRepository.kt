package com.secuidea.visitreservekiosk.data.repository

import com.secuidea.visitreservekiosk.api.ApiException
import com.secuidea.visitreservekiosk.api.ApiService
import com.secuidea.visitreservekiosk.data.models.*

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
     * 카카오 알림톡 발송
     * @param apiKey API 키
     * @param request 알림톡 요청 데이터
     * @throws ApiException API 호출 중 오류가 발생한 경우
     */
    suspend fun sendMessage(apiKey: String, request: KakaoMessageRequest): KakaoMessageResponse {
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
     * @param gubun 구분값
     * @param phoneNumber 수신자 전화번호
     * @param userName 수신자 이름
     * @param templateVariables 템플릿 변수
     * @param queryVariables 쿼리 변수
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
}
