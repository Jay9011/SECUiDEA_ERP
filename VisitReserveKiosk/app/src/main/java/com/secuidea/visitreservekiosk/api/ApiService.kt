package com.secuidea.visitreservekiosk.api

import com.google.gson.GsonBuilder
import com.secuidea.visitreservekiosk.data.models.*
import java.security.SecureRandom
import java.security.cert.X509Certificate
import java.util.concurrent.TimeUnit
import javax.net.ssl.*
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

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
    // 방문 목적 목록 조회 API
    @GET("api/visit/VisitReason")
    suspend fun getVisitReasons(@Query("lan") lan: String): Response<VisitReasonsResponse>

    // 직원 확인 API
    @GET("api/visit/EmployeeByName")
    suspend fun verifyEmployee(@Query("name") name: String): Response<VerifyEmployeeResponse>

    // 방문 신청 API
    @POST("api/visit/VisitReserve")
    suspend fun submitVisitReservation(
            @Body request: VisitReservationRequest
    ): Response<VisitReservationResponse>

    // 카카오 알림톡 발송 API
    @POST("api/Aligo/SendRequest")
    suspend fun sendMessage(
            @Body request: KakaoMessageRequest,
            @retrofit2.http.Header("X-API-KEY") apiKey: String
    ): Response<KakaoMessageResponse>

    // 게스트 로그인 API
    @POST("api/Login/S1Auth/GuestLogin")
    suspend fun loginAsGuest(
            @Body request: GuestLoginModel
    ): Response<ApiResponse<AuthResponse>>

    // 교육 완료 API
    @POST("api/visit/EducationCompletion")
    suspend fun completeEducation(
            @retrofit2.http.Header("Authorization") token: String,
            @Body request: Map<String, Int>
    ): Response<ApiResponse<Boolean>>
}

/** API 서비스 싱글톤 클래스 */
object ApiService {
    private var retrofit: Retrofit? = null
    private var apiInterface: ApiInterface? = null

    /** 안전하지 않은 TrustManager 생성 */
    private fun createUnsafeTrustManager(): X509TrustManager {
        return object : X509TrustManager {
            override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {}
            override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {}
            override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
        }
    }

    /** 안전하지 않은 SSL 소켓 팩토리 생성 */
    private fun createUnsafeSSLSocketFactory(trustManager: X509TrustManager): SSLSocketFactory {
        val sslContext = SSLContext.getInstance("TLS")
        sslContext.init(null, arrayOf(trustManager), SecureRandom())
        return sslContext.socketFactory
    }

    /** OkHttpClient 생성 */
    private fun createOkHttpClient(): OkHttpClient {
        val interceptor =
                HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }

        // 안전하지 않은 TrustManager 생성
        val trustManager = createUnsafeTrustManager()
        val sslSocketFactory = createUnsafeSSLSocketFactory(trustManager)

        return OkHttpClient.Builder()
                .addInterceptor(interceptor)
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                // SSL 검증 무시 설정
                .sslSocketFactory(sslSocketFactory, trustManager)
                .hostnameVerifier { _, _ -> true }
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
