package com.secuidea.visitreservekiosk

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import com.secuidea.visitreservekiosk.ui.screen.ApiSettingsScreen
import com.secuidea.visitreservekiosk.ui.theme.VisitReserveKioskTheme

class ApiSettingsActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            VisitReserveKioskTheme {
                Surface(color = MaterialTheme.colorScheme.background) {
                    ApiSettingsScreen(onBackClick = { finish() })
                }
            }
        }
    }
}
