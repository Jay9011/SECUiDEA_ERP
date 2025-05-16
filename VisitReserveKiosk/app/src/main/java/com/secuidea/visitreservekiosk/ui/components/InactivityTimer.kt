package com.secuidea.visitreservekiosk.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.delay

/**
 * 비활성 타이머 컴포넌트 (원형 호 애니메이션 포함)
 * @param timeoutSeconds 타임아웃 시간(초)
 * @param onTimeout 타임아웃 시 호출될 콜백
 * @param resetTrigger 타이머를 리셋할 트리거 (상태 변경 시 타이머가 리셋됨)
 * @param color 타이머 색상
 */
@Composable
fun InactivityTimer(
        timeoutSeconds: Int = 60,
        onTimeout: () -> Unit,
        resetTrigger: Any? = null,
        color: Color = MaterialTheme.colorScheme.onSurface
) {
    // 남은 시간 상태
    var remainingSeconds by remember { mutableStateOf(timeoutSeconds) }
    // 타이머 활성화 상태
    var isActive by remember { mutableStateOf(true) }

    // resetTrigger가 변경되면 타이머 리셋
    LaunchedEffect(resetTrigger) {
        remainingSeconds = timeoutSeconds
        isActive = true
    }

    // 타이머 로직
    LaunchedEffect(isActive) {
        remainingSeconds = timeoutSeconds
        while (isActive && remainingSeconds > 0) {
            delay(1000)
            remainingSeconds--
        }
        if (remainingSeconds <= 0) {
            onTimeout()
        }
    }

    // 애니메이션: 남은 시간 비율에 따라 호의 길이 변화
    val progress = remainingSeconds / timeoutSeconds.toFloat()
    val animatedSweep by animateFloatAsState(targetValue = 360f * progress, label = "timerArc")
    val timerColor = if (remainingSeconds <= 10) Color.Red else color

    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(end = 8.dp)) {
        Box(
                modifier = Modifier.size(48.dp).clip(CircleShape),
                contentAlignment = Alignment.Center
        ) {
            // 원형 호 그리기
            androidx.compose.foundation.Canvas(modifier = Modifier.size(48.dp)) {
                // 배경 원
                drawArc(
                        color = timerColor.copy(alpha = 0.15f),
                        startAngle = 0f,
                        sweepAngle = 360f,
                        useCenter = false,
                        style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round)
                )
                // 진행 호
                drawArc(
                        color = timerColor,
                        startAngle = -90f,
                        sweepAngle = animatedSweep,
                        useCenter = false,
                        style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round)
                )
            }
            // 시간 텍스트 (한 줄, 중앙)
            Text(
                    text = formatTime(remainingSeconds),
                    style = MaterialTheme.typography.bodySmall,
                    color = timerColor,
                    textAlign = TextAlign.Center,
                    maxLines = 1
            )
        }
    }
}

/** 초를 MM:SS 형식으로 변환 */
private fun formatTime(seconds: Int): String {
    val minutes = TimeUnit.SECONDS.toMinutes(seconds.toLong())
    val remainingSeconds = seconds - TimeUnit.MINUTES.toSeconds(minutes)
    return String.format("%02d:%02d", minutes, remainingSeconds)
}

/**
 * 사용자 활동 감지 컴포넌트
 * @param timeoutSeconds 타임아웃 시간(초)
 * @param onTimeout 타임아웃 시 호출될 콜백
 * @param content 내용 컴포저블
 */
@Composable
fun InactivityDetector(
        timeoutSeconds: Int = 30,
        onTimeout: () -> Unit,
        content: @Composable (resetTimer: () -> Unit) -> Unit
) {
    // 마지막 활동 시간
    var lastActivityTrigger by remember { mutableStateOf(0) }
    // 타이머 리셋 함수
    val resetTimer: () -> Unit = { lastActivityTrigger++ }
    // 타이머 UI
    DisposableEffect(Unit) {
        // 초기 타이머 시작
        resetTimer()
        onDispose {}
    }
    // 내용 렌더링
    content(resetTimer)
    // 타이머 컴포넌트
    InactivityTimer(
            timeoutSeconds = timeoutSeconds,
            onTimeout = onTimeout,
            resetTrigger = lastActivityTrigger
    )
}
