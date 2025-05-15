package com.secuidea.visitreservekiosk.api

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** API 요청 결과를 나타내는 sealed 클래스 */
sealed class ApiResult<out T> {
    data class Success<out T>(val data: T) : ApiResult<T>()
    data class Error(val message: String, val exception: Exception? = null) : ApiResult<Nothing>()
    object Loading : ApiResult<Nothing>()
}

/** 방문 신청 관련 Repository */
class VisitRepository {
    private val apiInterface = ApiService.getApiInterface()

    /** 방문 신청 API 호출 */
    suspend fun submitVisitRequest(visitRequest: VisitRequest): ApiResult<String> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiInterface.submitVisitRequest(visitRequest)

                if (response.isSuccessful) {
                    val apiResponse = response.body()
                    if (apiResponse != null && apiResponse.success) {
                        ApiResult.Success(apiResponse.data ?: "방문 신청이 완료되었습니다.")
                    } else {
                        ApiResult.Error(apiResponse?.message ?: "방문 신청에 실패했습니다.")
                    }
                } else {
                    ApiResult.Error("서버 오류: ${response.code()} - ${response.message()}")
                }
            } catch (e: Exception) {
                ApiResult.Error("네트워크 오류: ${e.message}", e)
            }
        }
    }

    /** 방문 정보 조회 API 호출 */
    suspend fun getVisitDetails(visitId: String): ApiResult<VisitRequest> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiInterface.getVisitDetails(visitId)

                if (response.isSuccessful) {
                    val apiResponse = response.body()
                    if (apiResponse != null && apiResponse.success && apiResponse.data != null) {
                        ApiResult.Success(apiResponse.data)
                    } else {
                        ApiResult.Error(apiResponse?.message ?: "방문 정보를 찾을 수 없습니다.")
                    }
                } else {
                    ApiResult.Error("서버 오류: ${response.code()} - ${response.message()}")
                }
            } catch (e: Exception) {
                ApiResult.Error("네트워크 오류: ${e.message}", e)
            }
        }
    }
}
