package com.secuidea.visitreservekiosk

import android.app.Application
import com.secuidea.visitreservekiosk.api.ApiSettings

class VisitReserveApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        // API 설정 초기화
        ApiSettings.init(this)
    }
}
