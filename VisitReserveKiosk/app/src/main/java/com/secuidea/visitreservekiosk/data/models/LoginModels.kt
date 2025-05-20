package com.secuidea.visitreservekiosk.data.models

data class GuestLoginModel(
    val id: String = "",
    val password: String = "",
    val rememberMe: Boolean = false
)