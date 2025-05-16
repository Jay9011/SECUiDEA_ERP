package com.secuidea.visitreservekiosk.ui.components

import android.content.Context
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import java.io.File
import java.io.IOException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * HTML 콘텐츠를 표시하는 컴포넌트 - WebView 사용
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

    // WebView로 HTML 렌더링
    AndroidView(
            factory = { ctx ->
                WebView(ctx).apply {
                    webViewClient = WebViewClient()
                    settings.javaScriptEnabled = false
                    settings.loadWithOverviewMode = true
                    settings.useWideViewPort = true
                    settings.setSupportZoom(true)
                    setBackgroundColor(android.graphics.Color.WHITE)
                }
            },
            update = { webView ->
                // HTML 헤더와 베이스 스타일 추가
                val htmlWithBase =
                        if (!content.trim().startsWith("<!DOCTYPE html>") &&
                                        !content.trim().startsWith("<html")
                        ) {
                            """
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                line-height: 1.6;
                                padding: 8px;
                                color: #333;
                            }
                            h1 { font-size: 20px; margin-top: 16px; }
                            h2 { font-size: 18px; margin-top: 14px; }
                            p { margin-bottom: 12px; }
                            ul { padding-left: 20px; }
                            li { margin-bottom: 8px; }
                            table {
                                width: 100%;
                                border-collapse: collapse;
                                margin: 20px 0;
                            }
                            th, td {
                                border: 1px solid #ddd;
                                padding: 10px;
                                text-align: left;
                            }
                            .indent { margin-left: 20px; }
                        </style>
                    </head>
                    <body>
                    $content
                    </body>
                    </html>
                    """
                        } else {
                            content
                        }

                webView.loadDataWithBaseURL(null, htmlWithBase, "text/html", "UTF-8", null)
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
            // 리소스에서 파일 찾기 (raw 폴더)
            try {
                val resourceId =
                        context.resources.getIdentifier(
                                filePath.substringBeforeLast("."),
                                "raw",
                                context.packageName
                        )

                if (resourceId != 0) {
                    context.resources.openRawResource(resourceId).use { inputStream ->
                        return@withContext inputStream.bufferedReader().use { it.readText() }
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }

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
