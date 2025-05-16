package com.secuidea.visitreservekiosk.data.repository

import com.secuidea.visitreservekiosk.api.ApiService
import com.secuidea.visitreservekiosk.data.models.*

/** 방문 관련 API 호출을 처리하는 Repository */
class VisitRepository {
    private val apiInterface = ApiService.getApiInterface()

    /**
     * 방문 목적 목록 조회
     * @param language 언어 코드 (ko: 한국어, en: 영어)
     */
    suspend fun getVisitReasons(language: String): VisitReasonsResponse {
        try {
            val response = apiInterface.getVisitReasons(language)
            if (response.isSuccessful) {
                return response.body()
                        ?: VisitReasonsResponse(
                                isSuccess = false,
                                message = "응답이 없습니다.",
                                data = null
                        )
            } else {
                return VisitReasonsResponse(
                        isSuccess = false,
                        message = "서버 오류: ${response.code()} ${response.message()}",
                        data = null
                )
            }
        } catch (e: Exception) {
            return VisitReasonsResponse(
                    isSuccess = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
            )
        }
    }

    /**
     * 직원 확인
     * @param name 직원 이름
     */
    suspend fun verifyEmployee(name: String): VerifyEmployeeResponse {
        try {
            val request = VerifyEmployeeRequest(name = name)
            val response = apiInterface.verifyEmployee(request)
            if (response.isSuccessful) {
                return response.body()
                        ?: VerifyEmployeeResponse(
                                isSuccess = false,
                                message = "응답이 없습니다.",
                                data = null
                        )
            } else {
                return VerifyEmployeeResponse(
                        isSuccess = false,
                        message = "서버 오류: ${response.code()} ${response.message()}",
                        data = null
                )
            }
        } catch (e: Exception) {
            return VerifyEmployeeResponse(
                    isSuccess = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
            )
        }
    }

    /**
     * 방문 신청
     * @param request 방문 신청 요청 데이터
     */
    suspend fun submitVisitReservation(request: VisitReservationRequest): VisitReservationResponse {
        try {
            val response = apiInterface.submitVisitReservation(request)
            if (response.isSuccessful) {
                return response.body()
                        ?: VisitReservationResponse(
                                isSuccess = false,
                                message = "응답이 없습니다.",
                                data = null
                        )
            } else {
                return VisitReservationResponse(
                        isSuccess = false,
                        message = "서버 오류: ${response.code()} ${response.message()}",
                        data = null
                )
            }
        } catch (e: Exception) {
            return VisitReservationResponse(
                    isSuccess = false,
                    message = "네트워크 오류: ${e.message}",
                    data = null
            )
        }
    }
}
