package com.secuidea.visitreservekiosk.api

import com.google.gson.GsonBuilder
import java.util.concurrent.TimeUnit
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

/** API 응답에 대한 래퍼 클래스 */
data class ApiResponse<T>(val success: Boolean, val data: T?, val message: String?)

/** 방문 신청 데이터 클래스 */
// TODO: 현재 임시 데이터로, 수정 필요
data class VisitRequest(
        val visitorName: String,
        val purpose: String,
        val visitDate: String,
        val contactNumber: String
)

/** Retrofit API 인터페이스 */
interface ApiInterface {
    // 방문 신청 API
    @POST("visits/request")
    suspend fun submitVisitRequest(@Body request: VisitRequest): Response<ApiResponse<String>>

    // 방문 확인 API
    @GET("visits/{visitId}")
    suspend fun getVisitDetails(@Path("visitId") visitId: String): Response<ApiResponse<VisitRequest>>
}

/** API 서비스 싱글톤 클래스 */
object ApiService {
    private var retrofit: Retrofit? = null
    private var apiInterface: ApiInterface? = null

    /** OkHttpClient 생성 */
    private fun createOkHttpClient(): OkHttpClient {
        val interceptor =
                HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }

        return OkHttpClient.Builder()
                .addInterceptor(interceptor)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .build()
    }

    /** Retrofit 인스턴스 생성 */
    private fun createRetrofit(baseUrl: String): Retrofit {
        val gson = GsonBuilder().setLenient().create()

        return Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(createOkHttpClient())
                .addConverterFactory(GsonConverterFactory.create(gson))
                .build()
    }

    /** API 인터페이스 가져오기 */
    fun getApiInterface(): ApiInterface {
        val currentBaseUrl = ApiSettings.getBaseUrl()

        // BaseURL이 변경되었거나 아직 초기화되지 않은 경우 Retrofit 재생성
        if (retrofit == null || apiInterface == null) {
            retrofit = createRetrofit(currentBaseUrl)
            apiInterface = retrofit?.create(ApiInterface::class.java)
        }

        return apiInterface!!
    }

    /** API 재설정 (BaseURL 변경 시 호출) */
    fun resetApiService() {
        val currentBaseUrl = ApiSettings.getBaseUrl()
        retrofit = createRetrofit(currentBaseUrl)
        apiInterface = retrofit?.create(ApiInterface::class.java)
    }
}
