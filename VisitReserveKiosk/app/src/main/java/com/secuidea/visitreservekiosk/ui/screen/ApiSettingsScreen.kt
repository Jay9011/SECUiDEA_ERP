package com.secuidea.visitreservekiosk.ui.screen

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.secuidea.visitreservekiosk.api.ApiService
import com.secuidea.visitreservekiosk.api.ApiSettings
import com.secuidea.visitreservekiosk.ui.theme.VisitReserveKioskTheme
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ApiSettingsScreen(onBackClick: () -> Unit) {
    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // 현재 API URL을 가져와서 상태로 저장
    var apiUrl by remember { mutableStateOf(ApiSettings.getBaseUrl()) }
    var isValidUrl by remember { mutableStateOf(true) }

    Scaffold(
            topBar = {
                TopAppBar(
                        title = { Text("API 설정") },
                        navigationIcon = {
                            IconButton(onClick = onBackClick) {
                                Icon(Icons.Default.ArrowBack, contentDescription = "뒤로 가기")
                            }
                        }
                )
            },
            snackbarHost = { SnackbarHost(snackbarHostState) }
    ) { padding ->
        Column(
                modifier = Modifier.fillMaxSize().padding(padding).padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = "현재 API 서버 URL:", style = MaterialTheme.typography.titleMedium)

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                    text = ApiSettings.currentBaseUrl.value,
                    style = MaterialTheme.typography.bodyLarge
            )

            Spacer(modifier = Modifier.height(24.dp))

            // URL 입력 필드
            OutlinedTextField(
                    value = apiUrl,
                    onValueChange = {
                        apiUrl = it
                        isValidUrl = true // 입력 시 유효성 검사 초기화
                    },
                    label = { Text("API 서버 URL") },
                    placeholder = { Text("예: https://api.example.com") },
                    modifier = Modifier.fillMaxWidth(),
                    isError = !isValidUrl,
                    supportingText = {
                        if (!isValidUrl) {
                            Text("유효한 URL 형식이 아닙니다")
                        }
                    }
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 저장 버튼
            Button(
                    onClick = {
                        // URL 유효성 검사 (간단한 검사)
                        if (apiUrl.isBlank()) {
                            isValidUrl = false
                            return@Button
                        }

                        // API 설정 업데이트
                        ApiSettings.setBaseUrl(apiUrl)
                        // API 서비스 재설정
                        ApiService.resetApiService()

                        // 성공 메시지 표시
                        scope.launch { snackbarHostState.showSnackbar("API URL이 변경되었습니다") }
                    },
                    modifier = Modifier.fillMaxWidth()
            ) { Text("저장") }

            Spacer(modifier = Modifier.height(8.dp))

            // 기본값으로 재설정 버튼
            Button(
                    onClick = {
                        ApiSettings.resetToDefault()
                        apiUrl = ApiSettings.getBaseUrl()
                        ApiService.resetApiService()

                        scope.launch { snackbarHostState.showSnackbar("기본 URL로 재설정되었습니다") }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors =
                            ButtonDefaults.buttonColors(
                                    containerColor = MaterialTheme.colorScheme.secondary
                            )
            ) { Text("기본값으로 재설정") }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ApiSettingsScreenPreview() {
    VisitReserveKioskTheme { ApiSettingsScreen(onBackClick = {}) }
}
