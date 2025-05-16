package com.secuidea.visitreservekiosk.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.secuidea.visitreservekiosk.language.AppStrings

/**
 * 애플리케이션 전체에서 사용할 수 있는 오류 다이얼로그 컴포넌트
 *
 * @param title 오류 제목
 * @param message 오류 메시지
 * @param onDismiss 다이얼로그 닫기 콜백
 * @param onNavigateToHome 홈 화면으로 이동하는 콜백
 */
@Composable
fun ErrorDialog(
        title: String,
        message: String,
        onDismiss: () -> Unit,
        onNavigateToHome: () -> Unit
) {
    AlertDialog(
            onDismissRequest = onDismiss,
            title = {
                Text(
                        text = title,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column {
                    Text(text = message, style = MaterialTheme.typography.bodyLarge)
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                            text = AppStrings.contactAdminMessage,
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.error,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(top = 8.dp)
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = onNavigateToHome) { Text(AppStrings.goToHomeButtonLabel) }
            }
    )
}
