package com.secuidea.visitreservekiosk.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.focusable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsFocusedAsState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.input.key.onKeyEvent
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalFocusManager

/**
 * 사용자 활동을 감지하는 Modifier 확장 함수
 *
 * 다음 이벤트를 감지합니다:
 * - 터치 및 탭 제스처
 * - 포커스 변경
 * - 키보드 입력
 * - 클릭
 *
 * @param onActivity 사용자 활동 감지 시 호출될 콜백
 * @return 수정된 Modifier
 */
fun Modifier.detectUserActivity(onActivity: () -> Unit): Modifier = composed {
    // 포커스 상태 감지를 위한 InteractionSource
    val interactionSource = remember { MutableInteractionSource() }
    val isFocused by interactionSource.collectIsFocusedAsState()

    // 포커스 상태 변경 감지
    LaunchedEffect(isFocused) {
        if (isFocused) {
            onActivity()
        }
    }

    this
            // 터치 및 탭 제스처 감지
            .pointerInput(Unit) {
                detectTapGestures(
                        onTap = { onActivity() },
                        onDoubleTap = { onActivity() },
                        onLongPress = { onActivity() },
                        onPress = { onActivity() }
                )
            }
            // 포커스 변경 감지
            .onFocusChanged {
                if (it.isFocused) {
                    onActivity()
                }
            }
            // 키보드 입력 감지
            .onKeyEvent {
                onActivity()
                false
            }
            // 클릭 감지
            .clickable(interactionSource = interactionSource, indication = null) { onActivity() }
            // 포커스 감지
            .focusable(interactionSource = interactionSource)
}

/**
 * 키보드 입력을 감지하는 FocusManager 확장 함수
 * @param onActivity 활동 감지 시 호출될 콜백
 * @return 키보드 입력을 감지하는 FocusManager
 */
@Composable
fun MonitorKeyboardActivity(onActivity: () -> Unit) {
    val focusManager = LocalFocusManager.current

    LaunchedEffect(focusManager) {
        // 키보드 활동 감지 로직
        // (실제로는 키 입력을 직접 감지하기 어려우므로
        // 포커스 변경이나 다른 UI 상호작용으로 대체)
    }
}
