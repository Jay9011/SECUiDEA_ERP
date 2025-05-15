package com.secuidea.visitreservekiosk

import android.app.Application
import com.secuidea.visitreservekiosk.api.ApiSettings
import com.secuidea.visitreservekiosk.language.LocaleHelper

class VisitReserveApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        // API 설정 초기화
        ApiSettings.init(this)

        // 언어 설정 초기화
        LocaleHelper.init(this)
    }
}
