package com.secuidea.visitreservekiosk.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusDirection
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.secuidea.visitreservekiosk.language.AppStrings
import com.secuidea.visitreservekiosk.language.LocaleHelper
import com.secuidea.visitreservekiosk.ui.components.AccordionCard
import com.secuidea.visitreservekiosk.ui.components.ErrorDialog
import com.secuidea.visitreservekiosk.ui.components.HtmlContent
import com.secuidea.visitreservekiosk.ui.components.InactivityTimer
import com.secuidea.visitreservekiosk.ui.components.LoadingOverlay
import com.secuidea.visitreservekiosk.ui.components.detectUserActivity
import com.secuidea.visitreservekiosk.ui.theme.VisitReserveKioskTheme
import com.secuidea.visitreservekiosk.viewmodel.PrivacyAgreementViewModel

// 비활성 타임아웃 시간(초)
private const val INACTIVITY_TIMEOUT_SECONDS = 60

@OptIn(ExperimentalMaterial3Api::class, ExperimentalComposeUiApi::class)
@Composable
fun PrivacyAgreementScreen(
        onBackClick: () -> Unit,
        viewModel: PrivacyAgreementViewModel = viewModel()
) {
        val scrollState = rememberScrollState()
        var privacyAgreed by remember { mutableStateOf<Boolean?>(null) }
        val isLoading by viewModel.isLoading.collectAsState()
        val visitReasons by viewModel.visitReasons.collectAsState()
        val formState by viewModel.formState.collectAsState()
        val formErrors by viewModel.formErrors.collectAsState()
        val isEmployeeVerified by viewModel.isEmployeeVerified.collectAsState()
        val verificationError by viewModel.verificationError.collectAsState()
        val showEmployeeModal by viewModel.showEmployeeModal.collectAsState()
        val employeeList by viewModel.employeeList.collectAsState()
        val apiError by viewModel.apiError.collectAsState()

        // 직원 정보 카드로 스크롤하기 위한 참조 추가
        val employeeCardRef = remember { mutableStateOf<Int?>(null) }

        // 아코디언 확장 상태 관리
        var accordionExpanded by remember { mutableStateOf(true) }

        // 포커스 관리자 추가
        val focusManager = LocalFocusManager.current

        // 비활성 타이머 관리
        var lastActivityTimestamp by remember { mutableStateOf(System.currentTimeMillis()) }

        // 사용자 활동 감지 함수
        val resetInactivityTimer = { lastActivityTimestamp = System.currentTimeMillis() }

        // 페이지 로드 시 방문 목적 데이터 가져오기
        LaunchedEffect(Unit) { viewModel.loadVisitReasons() }

        // 개인정보 동의 시 직원 정보 카드로 스크롤하고 아코디언 접기
        LaunchedEffect(privacyAgreed) {
                if (privacyAgreed == true) {
                        accordionExpanded = false // 아코디언 접기
                        employeeCardRef.value?.let { position ->
                                scrollState.animateScrollTo(position)
                        }
                }
                // 사용자 활동 감지
                resetInactivityTimer()
        }

        Scaffold(
                topBar = {
                        TopAppBar(
                                title = { Text(text = AppStrings.privacyAgreementTitle) },
                                navigationIcon = {
                                        IconButton(onClick = onBackClick) {
                                                Icon(
                                                        Icons.Default.ArrowBack,
                                                        contentDescription = "뒤로 가기"
                                                )
                                        }
                                },
                                actions = {
                                        // 타이머 표시
                                        InactivityTimer(
                                                timeoutSeconds = INACTIVITY_TIMEOUT_SECONDS,
                                                onTimeout = onBackClick,
                                                resetTrigger = lastActivityTimestamp
                                        )
                                }
                        )
                },
                // 키보드 패딩 추가
                contentWindowInsets = WindowInsets(0, 0, 0, 0)
        ) { paddingValues ->
                Box(
                        modifier =
                                Modifier.fillMaxSize()
                                        .padding(paddingValues)
                                        .imePadding() // 키보드 패딩 추가
                                        .navigationBarsPadding() // 네비게이션 바 패딩 추가
                                        // 사용자 활동 감지
                                        .detectUserActivity(resetInactivityTimer)
                ) {
                        Column(
                                modifier =
                                        Modifier.fillMaxSize()
                                                .padding(16.dp)
                                                .verticalScroll(scrollState),
                                horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                                // 개인정보 처리방침 섹션
                                Card(
                                        modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp),
                                        shape = RoundedCornerShape(12.dp),
                                        elevation =
                                                CardDefaults.cardElevation(defaultElevation = 4.dp)
                                ) {
                                        Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                                                Row(
                                                        verticalAlignment =
                                                                Alignment.CenterVertically,
                                                        modifier = Modifier.padding(bottom = 8.dp)
                                                ) {
                                                        Text(
                                                                text =
                                                                        AppStrings
                                                                                .privacyPolicyTitle,
                                                                style =
                                                                        MaterialTheme.typography
                                                                                .titleLarge,
                                                                fontWeight = FontWeight.Bold
                                                        )
                                                }

                                                Text(
                                                        text = AppStrings.privacyPolicyDescription,
                                                        style = MaterialTheme.typography.bodyMedium,
                                                        modifier = Modifier.padding(bottom = 16.dp)
                                                )

                                                // 개인정보 처리방침 아코디언
                                                AccordionCard(
                                                        title =
                                                                AppStrings
                                                                        .privacyPolicyAccordionTitle,
                                                        content = {
                                                                // HTML 파일에서 개인정보 처리방침 불러오기
                                                                val language =
                                                                        LocaleHelper.getLanguage()
                                                                val htmlFilePath =
                                                                        "privacy_policy_$language.html"

                                                                // 스크롤 가능한 Box로 감싸고 높이 제한
                                                                Box(
                                                                        modifier =
                                                                                Modifier.fillMaxWidth()
                                                                                        .height(
                                                                                                LocalConfiguration
                                                                                                        .current
                                                                                                        .screenHeightDp
                                                                                                        .dp /
                                                                                                        3
                                                                                        )
                                                                                        .background(
                                                                                                Color.White
                                                                                        )
                                                                                        .verticalScroll(
                                                                                                rememberScrollState()
                                                                                        )
                                                                                        .padding(
                                                                                                16.dp
                                                                                        )
                                                                                        // 스크롤 시 활동
                                                                                        // 감지
                                                                                        .detectUserActivity(
                                                                                                resetInactivityTimer
                                                                                        )
                                                                ) {
                                                                        // HTML 콘텐츠 표시 (파일이 없으면
                                                                        // AppStrings의 내용 사용)
                                                                        HtmlContent(
                                                                                filePath =
                                                                                        htmlFilePath,
                                                                                fallbackContent =
                                                                                        AppStrings
                                                                                                .privacyPolicyContent,
                                                                                modifier =
                                                                                        Modifier.fillMaxWidth()
                                                                        )
                                                                }
                                                        },
                                                        modifier =
                                                                Modifier.fillMaxWidth()
                                                                        .padding(bottom = 16.dp),
                                                        expanded = accordionExpanded,
                                                        onExpandChange = { expanded ->
                                                                accordionExpanded = expanded
                                                                // 아코디언 상태 변경 시 활동 감지
                                                                resetInactivityTimer()
                                                        }
                                                )
                                                // 개인정보 처리방침 동의 라디오 버튼
                                                Row(modifier = Modifier.fillMaxWidth()) {
                                                        Row(
                                                                verticalAlignment =
                                                                        Alignment.CenterVertically,
                                                                modifier =
                                                                        Modifier.fillMaxWidth(.5f)
                                                                                .padding(
                                                                                        vertical =
                                                                                                8.dp
                                                                                )
                                                        ) {
                                                                RadioButton(
                                                                        selected =
                                                                                privacyAgreed ==
                                                                                        true,
                                                                        onClick = {
                                                                                privacyAgreed = true
                                                                                // 라디오 버튼 클릭 시 활동 감지
                                                                                resetInactivityTimer()
                                                                        }
                                                                )
                                                                Text(
                                                                        text =
                                                                                AppStrings
                                                                                        .privacyAgreeOption,
                                                                        style =
                                                                                MaterialTheme
                                                                                        .typography
                                                                                        .bodyLarge,
                                                                        modifier =
                                                                                Modifier.padding(
                                                                                        start = 8.dp
                                                                                )
                                                                )
                                                        }

                                                        Row(
                                                                verticalAlignment =
                                                                        Alignment.CenterVertically,
                                                                modifier =
                                                                        Modifier.fillMaxWidth()
                                                                                .padding(
                                                                                        vertical =
                                                                                                8.dp
                                                                                )
                                                        ) {
                                                                RadioButton(
                                                                        selected =
                                                                                privacyAgreed ==
                                                                                        false,
                                                                        onClick = {
                                                                                privacyAgreed =
                                                                                        false
                                                                                // 라디오 버튼 클릭 시 활동 감지
                                                                                resetInactivityTimer()
                                                                        }
                                                                )
                                                                Text(
                                                                        text =
                                                                                AppStrings
                                                                                        .privacyDisagreeOption,
                                                                        style =
                                                                                MaterialTheme
                                                                                        .typography
                                                                                        .bodyLarge,
                                                                        modifier =
                                                                                Modifier.padding(
                                                                                        start = 8.dp
                                                                                )
                                                                )
                                                        }
                                                }
                                        }
                                }

                                // 안내문구는 Card 바깥에!
                                if (privacyAgreed == false) {
                                        Text(
                                                text = AppStrings.privacyDisagreeNotice,
                                                style = MaterialTheme.typography.bodyMedium,
                                                color = MaterialTheme.colorScheme.error,
                                                modifier =
                                                        Modifier.fillMaxWidth()
                                                                .padding(bottom = 16.dp)
                                        )
                                }

                                // 방문 대상 직원 정보
                                Card(
                                        modifier =
                                                Modifier.fillMaxWidth()
                                                        .padding(bottom = 16.dp)
                                                        .onGloballyPositioned { coordinates ->
                                                                // 직원 정보 카드의 위치 저장
                                                                employeeCardRef.value =
                                                                        coordinates
                                                                                .positionInRoot()
                                                                                .y
                                                                                .toInt()
                                                        },
                                        shape = RoundedCornerShape(12.dp),
                                        elevation =
                                                CardDefaults.cardElevation(defaultElevation = 4.dp)
                                ) {
                                        Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                                                Row(
                                                        verticalAlignment =
                                                                Alignment.CenterVertically,
                                                        modifier = Modifier.padding(bottom = 16.dp)
                                                ) {
                                                        Icon(
                                                                Icons.Default.Person,
                                                                contentDescription = null,
                                                                tint =
                                                                        MaterialTheme.colorScheme
                                                                                .primary
                                                        )
                                                        Spacer(modifier = Modifier.width(8.dp))
                                                        Text(
                                                                text = AppStrings.employeeInfoTitle,
                                                                style =
                                                                        MaterialTheme.typography
                                                                                .titleLarge,
                                                                fontWeight = FontWeight.Bold
                                                        )
                                                }

                                                // 직원 이름 입력 필드
                                                if (isEmployeeVerified) {
                                                        // 직원 확인 완료 상태
                                                        OutlinedTextField(
                                                                value = formState.employeeName,
                                                                onValueChange = {},
                                                                label = {
                                                                        Text(
                                                                                AppStrings
                                                                                        .employeeNameLabel
                                                                        )
                                                                },
                                                                modifier =
                                                                        Modifier.fillMaxWidth()
                                                                                .detectUserActivity(
                                                                                        resetInactivityTimer
                                                                                )
                                                                                .onFocusChanged {
                                                                                        if (it.isFocused
                                                                                        )
                                                                                                resetInactivityTimer()
                                                                                },
                                                                enabled = false,
                                                                singleLine = true,
                                                                trailingIcon = {
                                                                        IconButton(
                                                                                onClick = {
                                                                                        viewModel
                                                                                                .resetEmployeeVerification()
                                                                                }
                                                                        ) {
                                                                                Icon(
                                                                                        Icons.Default
                                                                                                .Edit,
                                                                                        contentDescription =
                                                                                                "다시 입력"
                                                                                )
                                                                        }
                                                                }
                                                        )

                                                        // 확인 완료 메시지
                                                        Row(
                                                                verticalAlignment =
                                                                        Alignment.CenterVertically,
                                                                modifier =
                                                                        Modifier.fillMaxWidth()
                                                                                .padding(top = 8.dp)
                                                        ) {
                                                                Icon(
                                                                        Icons.Default.CheckCircle,
                                                                        contentDescription = null,
                                                                        tint =
                                                                                MaterialTheme
                                                                                        .colorScheme
                                                                                        .primary,
                                                                        modifier =
                                                                                Modifier.size(16.dp)
                                                                )
                                                                Text(
                                                                        text =
                                                                                AppStrings
                                                                                        .employeeVerifiedMessage,
                                                                        style =
                                                                                MaterialTheme
                                                                                        .typography
                                                                                        .bodyMedium,
                                                                        color =
                                                                                MaterialTheme
                                                                                        .colorScheme
                                                                                        .primary,
                                                                        modifier =
                                                                                Modifier.padding(
                                                                                        start = 8.dp
                                                                                )
                                                                )
                                                        }
                                                } else {
                                                        // 직원 확인 전 상태
                                                        OutlinedTextField(
                                                                value = formState.employeeName,
                                                                onValueChange = {
                                                                        resetInactivityTimer() // 입력
                                                                        // 시
                                                                        // 활동
                                                                        // 감지
                                                                        // 추가
                                                                        viewModel
                                                                                .updateEmployeeName(
                                                                                        it
                                                                                )
                                                                },
                                                                label = {
                                                                        Text(
                                                                                AppStrings
                                                                                        .employeeNameLabel
                                                                        )
                                                                },
                                                                modifier =
                                                                        Modifier.fillMaxWidth()
                                                                                .detectUserActivity(
                                                                                        resetInactivityTimer
                                                                                )
                                                                                .onFocusChanged {
                                                                                        if (it.isFocused
                                                                                        )
                                                                                                resetInactivityTimer()
                                                                                },
                                                                isError =
                                                                        formErrors.employeeName
                                                                                .isNotEmpty(),
                                                                singleLine = true,
                                                                keyboardOptions =
                                                                        KeyboardOptions(
                                                                                imeAction =
                                                                                        ImeAction
                                                                                                .Done
                                                                        ),
                                                                keyboardActions =
                                                                        KeyboardActions(
                                                                                onDone = {
                                                                                        resetInactivityTimer() // 키보드 액션 시 활동 감지 추가
                                                                                        if (formState
                                                                                                        .employeeName
                                                                                                        .isNotBlank()
                                                                                        ) {
                                                                                                viewModel
                                                                                                        .verifyEmployee()
                                                                                        }
                                                                                }
                                                                        ),
                                                                trailingIcon = {
                                                                        Button(
                                                                                onClick = {
                                                                                        viewModel
                                                                                                .verifyEmployee()
                                                                                },
                                                                                enabled =
                                                                                        formState
                                                                                                .employeeName
                                                                                                .isNotBlank()
                                                                        ) {
                                                                                Icon(
                                                                                        Icons.Default
                                                                                                .Search,
                                                                                        contentDescription =
                                                                                                null
                                                                                )
                                                                                Spacer(
                                                                                        modifier =
                                                                                                Modifier.width(
                                                                                                        4.dp
                                                                                                )
                                                                                )
                                                                                Text(
                                                                                        AppStrings
                                                                                                .verifyButtonLabel
                                                                                )
                                                                        }
                                                                }
                                                        )

                                                        if (formErrors.employeeName.isNotEmpty()) {
                                                                Text(
                                                                        text =
                                                                                formErrors
                                                                                        .employeeName,
                                                                        style =
                                                                                MaterialTheme
                                                                                        .typography
                                                                                        .bodySmall,
                                                                        color =
                                                                                MaterialTheme
                                                                                        .colorScheme
                                                                                        .error,
                                                                        modifier =
                                                                                Modifier.padding(
                                                                                        start =
                                                                                                8.dp,
                                                                                        top = 4.dp
                                                                                )
                                                                )
                                                        }

                                                        if (verificationError.isNotEmpty()) {
                                                                Row(
                                                                        verticalAlignment =
                                                                                Alignment
                                                                                        .CenterVertically,
                                                                        modifier =
                                                                                Modifier.fillMaxWidth()
                                                                                        .padding(
                                                                                                top =
                                                                                                        8.dp
                                                                                        )
                                                                ) {
                                                                        Icon(
                                                                                Icons.Default.Clear,
                                                                                contentDescription =
                                                                                        null,
                                                                                tint =
                                                                                        MaterialTheme
                                                                                                .colorScheme
                                                                                                .error,
                                                                                modifier =
                                                                                        Modifier.size(
                                                                                                16.dp
                                                                                        )
                                                                        )
                                                                        Text(
                                                                                text =
                                                                                        verificationError,
                                                                                style =
                                                                                        MaterialTheme
                                                                                                .typography
                                                                                                .bodyMedium,
                                                                                color =
                                                                                        MaterialTheme
                                                                                                .colorScheme
                                                                                                .error,
                                                                                modifier =
                                                                                        Modifier.padding(
                                                                                                start =
                                                                                                        8.dp
                                                                                        )
                                                                        )
                                                                }
                                                        }
                                                }
                                        }
                                }

                                // 방문자 정보
                                Card(
                                        modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
                                        shape = RoundedCornerShape(12.dp),
                                        elevation =
                                                CardDefaults.cardElevation(defaultElevation = 4.dp)
                                ) {
                                        Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                                                Row(
                                                        verticalAlignment =
                                                                Alignment.CenterVertically,
                                                        modifier = Modifier.padding(bottom = 16.dp)
                                                ) {
                                                        Icon(
                                                                Icons.Default.Person,
                                                                contentDescription = null,
                                                                tint =
                                                                        MaterialTheme.colorScheme
                                                                                .primary
                                                        )
                                                        Spacer(modifier = Modifier.width(8.dp))
                                                        Text(
                                                                text = AppStrings.visitorInfoTitle,
                                                                style =
                                                                        MaterialTheme.typography
                                                                                .titleLarge,
                                                                fontWeight = FontWeight.Bold
                                                        )
                                                }

                                                // 방문자 이름과 회사명을 한 줄에 배치
                                                Row(
                                                        modifier =
                                                                Modifier.fillMaxWidth()
                                                                        .padding(bottom = 16.dp),
                                                        horizontalArrangement =
                                                                Arrangement.spacedBy(8.dp)
                                                ) {
                                                        // 방문자 이름 (필수)
                                                        Column(modifier = Modifier.weight(1f)) {
                                                                // 필수 항목 표시
                                                                Text(
                                                                        text =
                                                                                buildAnnotatedString {
                                                                                        withStyle(
                                                                                                style =
                                                                                                        SpanStyle(
                                                                                                                color =
                                                                                                                        Color.Red
                                                                                                        )
                                                                                        ) {
                                                                                                append(
                                                                                                        "* "
                                                                                                )
                                                                                        }
                                                                                        append(
                                                                                                AppStrings
                                                                                                        .visitorNameLabel
                                                                                        )
                                                                                },
                                                                        style =
                                                                                MaterialTheme
                                                                                        .typography
                                                                                        .bodySmall,
                                                                        modifier =
                                                                                Modifier.padding(
                                                                                        bottom =
                                                                                                4.dp
                                                                                )
                                                                )

                                                                OutlinedTextField(
                                                                        value =
                                                                                formState
                                                                                        .visitorName,
                                                                        onValueChange = {
                                                                                resetInactivityTimer() // 입력 시 활동 감지 추가
                                                                                viewModel
                                                                                        .updateFormField(
                                                                                                "visitorName",
                                                                                                it
                                                                                        )
                                                                        },
                                                                        modifier =
                                                                                Modifier.fillMaxWidth()
                                                                                        .detectUserActivity(
                                                                                                resetInactivityTimer
                                                                                        )
                                                                                        .onFocusChanged {
                                                                                                if (it.isFocused
                                                                                                )
                                                                                                        resetInactivityTimer()
                                                                                        },
                                                                        isError =
                                                                                formErrors
                                                                                        .visitorName
                                                                                        .isNotEmpty(),
                                                                        singleLine = true,
                                                                        keyboardOptions =
                                                                                KeyboardOptions(
                                                                                        imeAction =
                                                                                                ImeAction
                                                                                                        .Next
                                                                                ),
                                                                        keyboardActions =
                                                                                KeyboardActions(
                                                                                        onNext = {
                                                                                                resetInactivityTimer() // 키보드 액션 시 활동 감지 추가
                                                                                                focusManager
                                                                                                        .moveFocus(
                                                                                                                FocusDirection
                                                                                                                        .Right
                                                                                                        )
                                                                                        }
                                                                                )
                                                                )

                                                                if (formErrors.visitorName
                                                                                .isNotEmpty()
                                                                ) {
                                                                        Text(
                                                                                text =
                                                                                        formErrors
                                                                                                .visitorName,
                                                                                style =
                                                                                        MaterialTheme
                                                                                                .typography
                                                                                                .bodySmall,
                                                                                color =
                                                                                        MaterialTheme
                                                                                                .colorScheme
                                                                                                .error,
                                                                                modifier =
                                                                                        Modifier.padding(
                                                                                                start =
                                                                                                        8.dp,
                                                                                                top =
                                                                                                        4.dp
                                                                                        )
                                                                        )
                                                                }
                                                        }

                                                        // 방문자 회사
                                                        Column(modifier = Modifier.weight(1f)) {
                                                                Text(
                                                                        text =
                                                                                AppStrings
                                                                                        .visitorCompanyLabel,
                                                                        style =
                                                                                MaterialTheme
                                                                                        .typography
                                                                                        .bodySmall,
                                                                        modifier =
                                                                                Modifier.padding(
                                                                                        bottom =
                                                                                                4.dp
                                                                                )
                                                                )

                                                                OutlinedTextField(
                                                                        value =
                                                                                formState
                                                                                        .visitorCompany,
                                                                        onValueChange = {
                                                                                resetInactivityTimer() // 입력 시 활동 감지 추가
                                                                                viewModel
                                                                                        .updateFormField(
                                                                                                "visitorCompany",
                                                                                                it
                                                                                        )
                                                                        },
                                                                        modifier =
                                                                                Modifier.fillMaxWidth()
                                                                                        .detectUserActivity(
                                                                                                resetInactivityTimer
                                                                                        )
                                                                                        .onFocusChanged {
                                                                                                if (it.isFocused
                                                                                                )
                                                                                                        resetInactivityTimer()
                                                                                        },
                                                                        singleLine = true,
                                                                        keyboardOptions =
                                                                                KeyboardOptions(
                                                                                        imeAction =
                                                                                                ImeAction
                                                                                                        .Next
                                                                                ),
                                                                        keyboardActions =
                                                                                KeyboardActions(
                                                                                        onNext = {
                                                                                                resetInactivityTimer() // 키보드 액션 시 활동 감지 추가
                                                                                                focusManager
                                                                                                        .moveFocus(
                                                                                                                FocusDirection
                                                                                                                        .Down
                                                                                                        )
                                                                                                focusManager
                                                                                                        .moveFocus(
                                                                                                                FocusDirection
                                                                                                                        .Left
                                                                                                        )
                                                                                        }
                                                                                )
                                                                )
                                                        }
                                                }

                                                // 연락처와 차량 번호를 한 줄에 배치
                                                Row(
                                                        modifier =
                                                                Modifier.fillMaxWidth()
                                                                        .padding(bottom = 16.dp),
                                                        horizontalArrangement =
                                                                Arrangement.spacedBy(8.dp)
                                                ) {
                                                        // 방문자 연락처 (필수)
                                                        Column(modifier = Modifier.weight(1f)) {
                                                                // 필수 항목 표시
                                                                Text(
                                                                        text =
                                                                                buildAnnotatedString {
                                                                                        withStyle(
                                                                                                style =
                                                                                                        SpanStyle(
                                                                                                                color =
                                                                                                                        Color.Red
                                                                                                        )
                                                                                        ) {
                                                                                                append(
                                                                                                        "* "
                                                                                                )
                                                                                        }
                                                                                        append(
                                                                                                AppStrings
                                                                                                        .visitorContactLabel
                                                                                        )
                                                                                },
                                                                        style =
                                                                                MaterialTheme
                                                                                        .typography
                                                                                        .bodySmall,
                                                                        modifier =
                                                                                Modifier.padding(
                                                                                        bottom =
                                                                                                4.dp
                                                                                )
                                                                )

                                                                OutlinedTextField(
                                                                        value =
                                                                                formState
                                                                                        .visitorContact,
                                                                        onValueChange = { newValue
                                                                                ->
                                                                                resetInactivityTimer() // 입력 시 활동 감지 추가
                                                                                // 숫자만 허용
                                                                                if (newValue.all {
                                                                                                it.isDigit()
                                                                                        } ||
                                                                                                newValue.isEmpty()
                                                                                ) {
                                                                                        viewModel
                                                                                                .updateFormField(
                                                                                                        "visitorContact",
                                                                                                        newValue
                                                                                                )
                                                                                }
                                                                        },
                                                                        modifier =
                                                                                Modifier.fillMaxWidth()
                                                                                        .detectUserActivity(
                                                                                                resetInactivityTimer
                                                                                        )
                                                                                        .onFocusChanged {
                                                                                                if (it.isFocused
                                                                                                )
                                                                                                        resetInactivityTimer()
                                                                                        },
                                                                        isError =
                                                                                formErrors
                                                                                        .visitorContact
                                                                                        .isNotEmpty(),
                                                                        keyboardOptions =
                                                                                KeyboardOptions(
                                                                                        keyboardType =
                                                                                                KeyboardType
                                                                                                        .Number,
                                                                                        imeAction =
                                                                                                ImeAction
                                                                                                        .Next
                                                                                ),
                                                                        keyboardActions =
                                                                                KeyboardActions(
                                                                                        onNext = {
                                                                                                resetInactivityTimer() // 키보드 액션 시 활동 감지 추가
                                                                                                focusManager
                                                                                                        .moveFocus(
                                                                                                                FocusDirection
                                                                                                                        .Right
                                                                                                        )
                                                                                        }
                                                                                ),
                                                                        singleLine = true,
                                                                        placeholder = {
                                                                                Text("숫자만 입력 가능합니다")
                                                                        }
                                                                )

                                                                if (formErrors.visitorContact
                                                                                .isNotEmpty()
                                                                ) {
                                                                        Text(
                                                                                text =
                                                                                        formErrors
                                                                                                .visitorContact,
                                                                                style =
                                                                                        MaterialTheme
                                                                                                .typography
                                                                                                .bodySmall,
                                                                                color =
                                                                                        MaterialTheme
                                                                                                .colorScheme
                                                                                                .error,
                                                                                modifier =
                                                                                        Modifier.padding(
                                                                                                start =
                                                                                                        8.dp,
                                                                                                top =
                                                                                                        4.dp
                                                                                        )
                                                                        )
                                                                }
                                                        }

                                                        // 차량 번호
                                                        Column(modifier = Modifier.weight(1f)) {
                                                                Text(
                                                                        text =
                                                                                AppStrings
                                                                                        .visitorCarNumberLabel,
                                                                        style =
                                                                                MaterialTheme
                                                                                        .typography
                                                                                        .bodySmall,
                                                                        modifier =
                                                                                Modifier.padding(
                                                                                        bottom =
                                                                                                4.dp
                                                                                )
                                                                )

                                                                OutlinedTextField(
                                                                        value =
                                                                                formState
                                                                                        .visitorCarNumber,
                                                                        onValueChange = {
                                                                                resetInactivityTimer() // 입력 시 활동 감지 추가
                                                                                viewModel
                                                                                        .updateFormField(
                                                                                                "visitorCarNumber",
                                                                                                it
                                                                                        )
                                                                        },
                                                                        modifier =
                                                                                Modifier.fillMaxWidth()
                                                                                        .detectUserActivity(
                                                                                                resetInactivityTimer
                                                                                        )
                                                                                        .onFocusChanged {
                                                                                                if (it.isFocused
                                                                                                )
                                                                                                        resetInactivityTimer()
                                                                                        },
                                                                        singleLine = true,
                                                                        keyboardOptions =
                                                                                KeyboardOptions(
                                                                                        imeAction =
                                                                                                ImeAction
                                                                                                        .Next
                                                                                ),
                                                                        keyboardActions =
                                                                                KeyboardActions(
                                                                                        onNext = {
                                                                                                resetInactivityTimer() // 키보드 액션 시 활동 감지 추가
                                                                                                focusManager
                                                                                                        .moveFocus(
                                                                                                                FocusDirection
                                                                                                                        .Down
                                                                                                        )
                                                                                        }
                                                                                )
                                                                )
                                                        }
                                                }

                                                // 방문 목적
                                                Text(
                                                        text =
                                                                buildAnnotatedString {
                                                                        withStyle(
                                                                                style =
                                                                                        SpanStyle(
                                                                                                color =
                                                                                                        Color.Red
                                                                                        )
                                                                        ) { append("* ") }
                                                                        append(
                                                                                AppStrings
                                                                                        .visitPurposeLabel
                                                                        )
                                                                },
                                                        style = MaterialTheme.typography.bodyLarge,
                                                        modifier = Modifier.padding(bottom = 8.dp)
                                                )

                                                // 방문 목적 선택
                                                if (visitReasons.isNotEmpty()) {
                                                        Row(
                                                                modifier =
                                                                        Modifier.fillMaxWidth()
                                                                                .padding(
                                                                                        bottom =
                                                                                                16.dp
                                                                                )
                                                        ) {
                                                                // 방문 목적 드롭다운
                                                                var expanded by remember {
                                                                        mutableStateOf(false)
                                                                }
                                                                val selectedReason =
                                                                        visitReasons.find {
                                                                                it.visitReasonID ==
                                                                                        formState
                                                                                                .visitReasonId
                                                                        }
                                                                                ?: visitReasons
                                                                                        .firstOrNull()

                                                                ExposedDropdownMenuBox(
                                                                        expanded = expanded,
                                                                        onExpandedChange = {
                                                                                expanded = it
                                                                        },
                                                                        modifier =
                                                                                Modifier.weight(1f)
                                                                                        .padding(
                                                                                                end =
                                                                                                        8.dp
                                                                                        )
                                                                ) {
                                                                        OutlinedTextField(
                                                                                value =
                                                                                        selectedReason
                                                                                                ?.visitReasonName
                                                                                                ?: "",
                                                                                onValueChange = {},
                                                                                readOnly = true,
                                                                                trailingIcon = {
                                                                                        ExposedDropdownMenuDefaults
                                                                                                .TrailingIcon(
                                                                                                        expanded =
                                                                                                                expanded
                                                                                                )
                                                                                },
                                                                                modifier =
                                                                                        Modifier.menuAnchor()
                                                                                                .fillMaxWidth()
                                                                        )

                                                                        ExposedDropdownMenu(
                                                                                expanded = expanded,
                                                                                onDismissRequest = {
                                                                                        expanded =
                                                                                                false
                                                                                }
                                                                        ) {
                                                                                visitReasons
                                                                                        .forEach {
                                                                                                reason
                                                                                                ->
                                                                                                DropdownMenuItem(
                                                                                                        text = {
                                                                                                                Text(
                                                                                                                        reason.visitReasonName
                                                                                                                )
                                                                                                        },
                                                                                                        onClick = {
                                                                                                                viewModel
                                                                                                                        .updateFormField(
                                                                                                                                "visitReasonId",
                                                                                                                                reason.visitReasonID
                                                                                                                        )
                                                                                                                expanded =
                                                                                                                        false
                                                                                                        }
                                                                                                )
                                                                                        }
                                                                        }
                                                                }

                                                                // 방문 목적 상세 입력
                                                                OutlinedTextField(
                                                                        value =
                                                                                formState
                                                                                        .visitPurpose,
                                                                        onValueChange = {
                                                                                resetInactivityTimer() // 입력 시 활동 감지 추가
                                                                                viewModel
                                                                                        .updateFormField(
                                                                                                "visitPurpose",
                                                                                                it
                                                                                        )
                                                                        },
                                                                        placeholder = {
                                                                                Text(
                                                                                        AppStrings
                                                                                                .visitPurposeDetailPlaceholder
                                                                                )
                                                                        },
                                                                        modifier =
                                                                                Modifier.weight(1f)
                                                                                        .detectUserActivity(
                                                                                                resetInactivityTimer
                                                                                        )
                                                                                        .onFocusChanged {
                                                                                                if (it.isFocused
                                                                                                )
                                                                                                        resetInactivityTimer()
                                                                                        },
                                                                        singleLine = true,
                                                                        keyboardOptions =
                                                                                KeyboardOptions(
                                                                                        imeAction =
                                                                                                ImeAction
                                                                                                        .Done
                                                                                ),
                                                                        keyboardActions =
                                                                                KeyboardActions(
                                                                                        onDone = {
                                                                                                resetInactivityTimer() // 키보드 액션 시 활동 감지 추가
                                                                                                focusManager
                                                                                                        .clearFocus()
                                                                                        }
                                                                                )
                                                                )
                                                        }
                                                }
                                        }
                                }

                                // 제출 버튼
                                Row(
                                        modifier =
                                                Modifier.fillMaxWidth().padding(vertical = 16.dp),
                                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                                ) {
                                        Button(
                                                onClick = {
                                                        resetInactivityTimer() // 활동 감지
                                                        onBackClick()
                                                },
                                                modifier = Modifier.weight(1f),
                                                colors =
                                                        ButtonDefaults.buttonColors(
                                                                containerColor =
                                                                        MaterialTheme.colorScheme
                                                                                .surfaceVariant,
                                                                contentColor =
                                                                        MaterialTheme.colorScheme
                                                                                .onSurfaceVariant
                                                        )
                                        ) { Text(text = AppStrings.cancelButtonLabel) }

                                        Button(
                                                onClick = {
                                                        resetInactivityTimer() // 활동 감지
                                                        viewModel.submitForm()
                                                },
                                                modifier = Modifier.weight(1f),
                                                enabled = isEmployeeVerified
                                        ) { Text(text = AppStrings.submitButtonLabel) }
                                }
                        }
                }

                // 로딩 오버레이
                if (isLoading) {
                        LoadingOverlay()
                }

                // 직원 선택 모달
                if (showEmployeeModal) {
                        AlertDialog(
                                onDismissRequest = {
                                        resetInactivityTimer() // 활동 감지
                                        viewModel.hideEmployeeModal()
                                },
                                title = { Text(text = AppStrings.selectEmployeeTitle) },
                                text = {
                                        Column(
                                                modifier =
                                                        Modifier.detectUserActivity(
                                                                        resetInactivityTimer
                                                                )
                                                                .verticalScroll(
                                                                        rememberScrollState()
                                                                )
                                        ) {
                                                employeeList.orEmpty().forEach { employee ->
                                                        Surface(
                                                                modifier =
                                                                        Modifier.fillMaxWidth()
                                                                                .padding(
                                                                                        vertical =
                                                                                                4.dp
                                                                                ),
                                                                onClick = {
                                                                        resetInactivityTimer() // 여기서만 감지
                                                                        viewModel.selectEmployee(
                                                                                employee
                                                                        )
                                                                },
                                                                color =
                                                                        MaterialTheme.colorScheme
                                                                                .surfaceVariant,
                                                                shape = RoundedCornerShape(8.dp)
                                                        ) {
                                                                Row(
                                                                        modifier =
                                                                                Modifier.fillMaxWidth()
                                                                                        .padding(
                                                                                                16.dp
                                                                                        ),
                                                                        verticalAlignment =
                                                                                Alignment
                                                                                        .CenterVertically
                                                                ) {
                                                                        Icon(
                                                                                Icons.Default
                                                                                        .Person,
                                                                                contentDescription =
                                                                                        null,
                                                                                tint =
                                                                                        MaterialTheme
                                                                                                .colorScheme
                                                                                                .primary
                                                                        )
                                                                        Spacer(
                                                                                modifier =
                                                                                        Modifier.width(
                                                                                                16.dp
                                                                                        )
                                                                        )
                                                                        Column {
                                                                                Text(
                                                                                        text =
                                                                                                employee.name,
                                                                                        style =
                                                                                                MaterialTheme
                                                                                                        .typography
                                                                                                        .titleMedium
                                                                                )
                                                                                if (employee.departmentName
                                                                                                .isNotEmpty()
                                                                                ) {
                                                                                        Text(
                                                                                                text =
                                                                                                        employee.departmentName,
                                                                                                style =
                                                                                                        MaterialTheme
                                                                                                                .typography
                                                                                                                .bodyMedium
                                                                                        )
                                                                                }
                                                                        }
                                                                }
                                                        }
                                                }
                                        }
                                },
                                confirmButton = {
                                        TextButton(
                                                onClick = {
                                                        resetInactivityTimer() // 활동 감지
                                                        viewModel.hideEmployeeModal()
                                                }
                                        ) { Text(AppStrings.cancelButtonLabel) }
                                },
                                modifier = Modifier.detectUserActivity(resetInactivityTimer)
                        )
                }

                // API 에러 다이얼로그
                apiError?.let { error ->
                        ErrorDialog(
                                title = error.title,
                                message = error.message,
                                onDismiss = {
                                        resetInactivityTimer() // 활동 감지
                                        viewModel.clearApiError()
                                },
                                onNavigateToHome = {
                                        resetInactivityTimer() // 활동 감지
                                        viewModel.clearApiError()
                                        onBackClick()
                                }
                        )
                }
        }
}

@Preview(showBackground = true, widthDp = 720, heightDp = 1280)
@Composable
fun PrivacyAgreementScreenPreview() {
        VisitReserveKioskTheme { PrivacyAgreementScreen(onBackClick = {}) }
}
