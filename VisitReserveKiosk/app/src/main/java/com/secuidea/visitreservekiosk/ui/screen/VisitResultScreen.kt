package com.secuidea.visitreservekiosk.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.secuidea.visitreservekiosk.VideoPlayer
import com.secuidea.visitreservekiosk.VideoPlayerManager
import com.secuidea.visitreservekiosk.language.AppStrings
import com.secuidea.visitreservekiosk.ui.components.InactivityTimer
import com.secuidea.visitreservekiosk.ui.theme.PrimaryColor
import com.secuidea.visitreservekiosk.ui.theme.SuccessColor
import com.secuidea.visitreservekiosk.ui.theme.TextPrimaryColor
import com.secuidea.visitreservekiosk.ui.theme.VisitReserveKioskTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VisitResultScreen(visitorName: String, visitDate: String, onBackClick: () -> Unit) {
    // 화면 표시될 때 비디오 재생 시작
    LaunchedEffect(Unit) { VideoPlayerManager.playOutroVideo() }

    // 화면 사라질 때 비디오 초기화
    DisposableEffect(Unit) { onDispose { VideoPlayerManager.resetOutroVideo() } }

    // 전체 레이아웃 (비디오 + UI 요소)
    Box(modifier = Modifier.fillMaxSize()) {
        // 1. 배경 비디오 (미리 준비된 outroPlayer 사용)
        VideoPlayer(
                exoPlayer = VideoPlayerManager.outroPlayer,
                modifier = Modifier.fillMaxSize(),
                showLoadingIndicator = false
        )

        // 2. 3단 레이아웃 (상단: 메시지, 중앙: 빈 공간, 하단: 버튼)
        Scaffold(
                modifier = Modifier.fillMaxSize(),
                containerColor = Color.Transparent,
                contentColor = MaterialTheme.colorScheme.onBackground,
                topBar = {
                    TopAppBar(
                            title = { Text(AppStrings.visitCompleteTitle) },
                            actions = {
                                InactivityTimer(timeoutSeconds = 10, onTimeout = onBackClick)
                            }
                    )
                }
        ) { padding ->
            Column(
                    modifier = Modifier.fillMaxSize().padding(padding),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.SpaceBetween
            ) {
                // 상단 영역 (감사 메시지)
                Box(
                        modifier = Modifier.fillMaxWidth().weight(.8f),
                        contentAlignment = Alignment.Center
                ) {
                    Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = SuccessColor,
                                modifier = Modifier.size(64.dp)
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                                "${AppStrings.visitThankYouMessage} $visitorName 님!",
                                style = MaterialTheme.typography.titleLarge,
                                color = PrimaryColor
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                                "${AppStrings.visitDateLabel}$visitDate",
                                style = MaterialTheme.typography.bodyLarge,
                                color = TextPrimaryColor
                        )
                    }
                }

                // 중앙 영역 (비디오에 집중할 수 있도록 비움)
                Spacer(modifier = Modifier.weight(1f))

                // 하단 영역 (버튼)
                Box(
                        modifier = Modifier.fillMaxWidth().weight(.8f),
                        contentAlignment = Alignment.Center
                ) {
                    Column(
                            modifier = Modifier.fillMaxSize().padding(padding),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.SpaceAround
                    ) {
                        Text(
                                AppStrings.visitRequestCompletedMessage,
                                style = MaterialTheme.typography.bodyMedium,
                                color = PrimaryColor,
                                textAlign = TextAlign.Center
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Button(
                                onClick = onBackClick,
                                colors =
                                        ButtonDefaults.buttonColors(
                                                containerColor =
                                                        MaterialTheme.colorScheme.primary.copy(
                                                                alpha = 0.9f
                                                        )
                                        ),
                                modifier =
                                        Modifier.padding(bottom = 48.dp)
                                                .width(200.dp)
                                                .height(56.dp),
                                shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                    AppStrings.returnToHomeButton,
                                    style = MaterialTheme.typography.titleMedium
                            )
                        }
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true, widthDp = 720, heightDp = 1280)
@Composable
fun VisitResultScreenPreview() {
    VisitReserveKioskTheme {
        VisitResultScreen(visitorName = "테스트", visitDate = "2025-05-19", onBackClick = {})
    }
}
