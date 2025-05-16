package com.secuidea.visitreservekiosk.ui.components

import android.content.Context
import android.text.method.LinkMovementMethod
import android.widget.TextView
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.text.HtmlCompat
import java.io.File
import java.io.IOException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * HTML 콘텐츠를 표시하는 컴포넌트
 *
 * @param htmlContent HTML 문자열 (직접 전달 시)
 * @param filePath HTML 파일 경로 (파일에서 읽을 경우)
 * @param modifier Modifier
 * @param fallbackContent 파일을 찾을 수 없거나 오류 발생 시 표시할 내용
 */
@Composable
fun HtmlContent(
        htmlContent: String? = null,
        filePath: String? = null,
        modifier: Modifier = Modifier,
        fallbackContent: String = "내용을 불러올 수 없습니다."
) {
    val context = LocalContext.current
    var content by remember { mutableStateOf("") }

    // 파일 경로가 제공된 경우 파일에서 HTML 콘텐츠 로드
    LaunchedEffect(filePath) {
        if (!filePath.isNullOrEmpty()) {
            content = loadHtmlFromFile(context, filePath) ?: fallbackContent
        } else if (!htmlContent.isNullOrEmpty()) {
            content = htmlContent
        } else {
            content = fallbackContent
        }
    }

    // HTML 렌더링
    AndroidView(
            factory = { ctx ->
                TextView(ctx).apply {
                    movementMethod = LinkMovementMethod.getInstance() // 링크 클릭 가능하도록 설정
                }
            },
            update = { textView ->
                textView.text = HtmlCompat.fromHtml(content, HtmlCompat.FROM_HTML_MODE_COMPACT)
            },
            modifier = modifier
    )
}

/**
 * 파일에서 HTML 콘텐츠를 로드하는 함수
 *
 * @param context Context
 * @param filePath 파일 경로
 * @return HTML 콘텐츠 문자열 또는 null (파일이 없거나 오류 발생 시)
 */
suspend fun loadHtmlFromFile(context: Context, filePath: String): String? {
    return withContext(Dispatchers.IO) {
        try {
            // 내부 저장소에서 파일 찾기
            val internalFile = File(context.filesDir, filePath)
            if (internalFile.exists()) {
                return@withContext internalFile.readText()
            }

            // 외부 저장소에서 파일 찾기
            val externalFile = File(context.getExternalFilesDir(null), filePath)
            if (externalFile.exists()) {
                return@withContext externalFile.readText()
            }

            // SD 카드에서 파일 찾기 (기본 외부 저장소 외에 추가 저장소)
            context.getExternalFilesDirs(null).forEach { extDir ->
                if (extDir != null && extDir != context.getExternalFilesDir(null)) {
                    val file = File(extDir, filePath)
                    if (file.exists()) {
                        return@withContext file.readText()
                    }
                }
            }

            null
        } catch (e: IOException) {
            e.printStackTrace()
            null
        }
    }
}
