package com.secuidea.visitreservekiosk.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.secuidea.visitreservekiosk.ui.screen.PrivacyAgreementScreen
import com.secuidea.visitreservekiosk.ui.theme.VisitReserveKioskTheme

@Composable
fun LoadingOverlay() {
    Dialog(
        onDismissRequest = { /* 취소 불가 */ },
        properties = DialogProperties(
            dismissOnBackPress = false,
            dismissOnClickOutside = false,
            usePlatformDefaultWidth = false
        ),
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .fillMaxWidth()
                .fillMaxHeight()
                .background(Color.Black.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(
                modifier = Modifier.size(60.dp),
                color = MaterialTheme.colorScheme.primary,
                strokeWidth = 7.dp
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun LoadingOverlayPreview() {
    VisitReserveKioskTheme { LoadingOverlay(); }
}
