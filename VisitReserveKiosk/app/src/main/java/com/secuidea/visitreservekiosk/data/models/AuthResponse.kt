package com.secuidea.visitreservekiosk.data.models

/** 로그인 인증 응답 데이터 클래스 */
data class AuthResponse(
        val token: TokenResponse // JWT 토큰
)

/** Token 데이터 구조 */
data class TokenResponse(
        val accessToken: String,
        val accessExpiryDate: String,
        val refreshToken: String,
        val refreshExpiryDate: String,
        val isRememberMe: Boolean,
        val enableSessionTimeout: Boolean,
        val sessionId: String,
        val sessionExpiryDate: String
)