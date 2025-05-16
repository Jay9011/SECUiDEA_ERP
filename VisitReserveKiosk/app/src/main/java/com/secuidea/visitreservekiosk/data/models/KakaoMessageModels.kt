package com.secuidea.visitreservekiosk.data.models

import com.google.gson.annotations.SerializedName

/** 카카오 알림톡 수신자 정보 */
data class ReceiverInfo(
        @SerializedName("phone") val phone: String,
        @SerializedName("name") val name: String,
        @SerializedName("variables") val variables: Map<String, String> = mapOf(),
        @SerializedName("queryVariables") val queryVariables: Map<String, String> = mapOf()
)

/** 카카오 알림톡 발송 요청 모델 */
data class KakaoMessageRequest(
        @SerializedName("gubun") val gubun: String,
        @SerializedName("receiverList") val receiverList: List<ReceiverInfo>
)

/** 카카오 알림톡 발송 응답 모델 */
data class KakaoMessageResponse(
        @SerializedName("isSuccess") val isSuccess: Boolean,
        @SerializedName("message") val message: String?,
        @SerializedName("data") val data: Any?
)
