package com.secuidea.visitreservekiosk.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.secuidea.visitreservekiosk.VideoPlayer
import com.secuidea.visitreservekiosk.VideoPlayerManager
import com.secuidea.visitreservekiosk.ui.components.InactivityTimer

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VisitResultScreen(visitorName: String, visitDate: String, onBackClick: () -> Unit) {
    // 화면 표시될 때 비디오 재생 시작
    LaunchedEffect(Unit) { VideoPlayerManager.playOutroVideo() }

    // 화면 사라질 때 비디오 초기화
    DisposableEffect(Unit) { onDispose { VideoPlayerManager.resetOutroVideo() } }

    // 컨테이너 레이아웃
    Box(modifier = Modifier.fillMaxSize().background(Color.White)) {
        // 1. 배경 비디오 (미리 준비된 outroPlayer 사용)
        VideoPlayer(
                exoPlayer = VideoPlayerManager.outroPlayer,
                modifier = Modifier.fillMaxSize(),
                showLoadingIndicator = false
        )

        // 2. 결과 화면 UI
        Scaffold(
                modifier = Modifier.fillMaxSize(),
                containerColor = Color.Transparent,
                contentColor = MaterialTheme.colorScheme.onBackground,
                topBar = {
                    TopAppBar(
                            title = { Text("방문 신청 완료") },
                            actions = {
                                // 타이머 표시
                                InactivityTimer(timeoutSeconds = 30, onTimeout = onBackClick)
                            }
                    )
                }
        ) { padding ->
            // 결과 카드
            Box(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    contentAlignment = Alignment.Center
            ) {
                Card(
                        modifier = Modifier.fillMaxWidth(0.85f).padding(16.dp),
                        shape = RoundedCornerShape(16.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
                        colors =
                                CardDefaults.cardColors(
                                        containerColor = Color.White.copy(alpha = 0.9f)
                                )
                ) {
                    Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = Color(0xFF4CAF50),
                                modifier = Modifier.size(80.dp)
                        )

                        Spacer(modifier = Modifier.height(24.dp))

                        Text("감사합니다, $visitorName 님!", style = MaterialTheme.typography.titleLarge)

                        Spacer(modifier = Modifier.height(8.dp))

                        Text("방문일: $visitDate", style = MaterialTheme.typography.bodyLarge)

                        Spacer(modifier = Modifier.height(24.dp))

                        Text(
                                "귀하의 방문 신청이 정상적으로 접수되었습니다.\n담당자가 확인 후 연락드릴 예정입니다.",
                                style = MaterialTheme.typography.bodyMedium
                        )

                        Spacer(modifier = Modifier.height(32.dp))

                        Button(
                                onClick = onBackClick,
                                colors =
                                        ButtonDefaults.buttonColors(
                                                containerColor = MaterialTheme.colorScheme.primary
                                        ),
                                modifier = Modifier.width(200.dp)
                        ) { Text("처음으로") }
                    }
                }
            }
        }
    }
}
