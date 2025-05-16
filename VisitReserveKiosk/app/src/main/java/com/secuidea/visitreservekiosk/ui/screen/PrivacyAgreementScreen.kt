package com.secuidea.visitreservekiosk.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.secuidea.visitreservekiosk.language.AppStrings
import com.secuidea.visitreservekiosk.ui.components.AccordionCard
import com.secuidea.visitreservekiosk.ui.components.ErrorDialog
import com.secuidea.visitreservekiosk.ui.components.LoadingOverlay
import com.secuidea.visitreservekiosk.ui.theme.VisitReserveKioskTheme
import com.secuidea.visitreservekiosk.viewmodel.PrivacyAgreementViewModel

@OptIn(ExperimentalMaterial3Api::class)
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

    // 페이지 로드 시 방문 목적 데이터 가져오기
    LaunchedEffect(Unit) { viewModel.loadVisitReasons() }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = AppStrings.privacyAgreementTitle) },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "뒤로 가기")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(modifier = Modifier
            .fillMaxSize()
            .padding(paddingValues)) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
                    .verticalScroll(scrollState),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // 페이지 헤더
                Text(
                    text = AppStrings.privacyAgreementTitle,
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp)
                )

                Text(
                    text = AppStrings.privacyAgreementSubtitle,
                    style = MaterialTheme.typography.bodyLarge,
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp)
                )

                // 개인정보 처리방침 섹션
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 24.dp),
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(bottom = 8.dp)
                        ) {
                            Text(
                                text = AppStrings.privacyPolicyTitle,
                                style = MaterialTheme.typography.titleLarge,
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
                            title = AppStrings.privacyPolicyAccordionTitle,
                            content = {
                                Text(
                                    text = AppStrings.privacyPolicyContent,
                                    style = MaterialTheme.typography.bodySmall,
                                    modifier = Modifier.padding(16.dp)
                                )
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 16.dp)
                        )
                        // 개인정보 처리방침 동의 라디오 버튼
                        Row(modifier = Modifier.fillMaxWidth()) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth(.5f)
                                    .padding(vertical = 8.dp)
                            ) {
                                RadioButton(
                                    selected = privacyAgreed == true,
                                    onClick = { privacyAgreed = true }
                                )
                                Text(
                                    text = AppStrings.privacyAgreeOption,
                                    style = MaterialTheme.typography.bodyLarge,
                                    modifier = Modifier.padding(start = 8.dp)
                                )
                            }

                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 8.dp)
                            ) {
                                RadioButton(
                                    selected = privacyAgreed == false,
                                    onClick = { privacyAgreed = false }
                                )
                                Text(
                                    text = AppStrings.privacyDisagreeOption,
                                    style = MaterialTheme.typography.bodyLarge,
                                    modifier = Modifier.padding(start = 8.dp)
                                )
                            }

                            if (privacyAgreed == false) {
                                Text(
                                    text = AppStrings.privacyDisagreeNotice,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.error,
                                    modifier = Modifier.padding(top = 8.dp)
                                )
                            }
                        }
                    }
                }

                // 방문 정보 입력 폼
                if (privacyAgreed == true) {
                    // 방문 대상 직원 정보
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(bottom = 16.dp)
                            ) {
                                Icon(
                                    Icons.Default.Person,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = AppStrings.employeeInfoTitle,
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            // 직원 이름 입력 필드
                            if (isEmployeeVerified) {
                                // 직원 확인 완료 상태
                                OutlinedTextField(
                                    value = formState.employeeName,
                                    onValueChange = {},
                                    label = { Text(AppStrings.employeeNameLabel) },
                                    modifier = Modifier.fillMaxWidth(),
                                    enabled = false,
                                    trailingIcon = {
                                        IconButton(
                                            onClick = {
                                                viewModel.resetEmployeeVerification()
                                            }
                                        ) {
                                            Icon(
                                                Icons.Default.Edit,
                                                contentDescription = "다시 입력"
                                            )
                                        }
                                    }
                                )

                                // 확인 완료 메시지
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(top = 8.dp)
                                ) {
                                    Icon(
                                        Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        tint = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Text(
                                        text = AppStrings.employeeVerifiedMessage,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.primary,
                                        modifier = Modifier.padding(start = 8.dp)
                                    )
                                }
                            } else {
                                // 직원 확인 전 상태
                                OutlinedTextField(
                                    value = formState.employeeName,
                                    onValueChange = { viewModel.updateEmployeeName(it) },
                                    label = { Text(AppStrings.employeeNameLabel) },
                                    modifier = Modifier.fillMaxWidth(),
                                    isError = formErrors.employeeName.isNotEmpty(),
                                    trailingIcon = {
                                        Button(
                                            onClick = { viewModel.verifyEmployee() },
                                            enabled = formState.employeeName.isNotBlank()
                                        ) {
                                            Icon(
                                                Icons.Default.Search,
                                                contentDescription = null
                                            )
                                            Spacer(modifier = Modifier.width(4.dp))
                                            Text(AppStrings.verifyButtonLabel)
                                        }
                                    }
                                )

                                if (formErrors.employeeName.isNotEmpty()) {
                                    Text(
                                        text = formErrors.employeeName,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.error,
                                        modifier = Modifier.padding(start = 8.dp, top = 4.dp)
                                    )
                                }

                                if (verificationError.isNotEmpty()) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(top = 8.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.Clear,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.error,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Text(
                                            text = verificationError,
                                            style = MaterialTheme.typography.bodyMedium,
                                            color = MaterialTheme.colorScheme.error,
                                            modifier = Modifier.padding(start = 8.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // 방문자 정보
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 16.dp),
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(bottom = 16.dp)
                            ) {
                                Icon(
                                    Icons.Default.Person,
                                    contentDescription = null,
                                    tint = MaterialTheme.colorScheme.primary
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = AppStrings.visitorInfoTitle,
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            // 방문자 이름
                            OutlinedTextField(
                                value = formState.visitorName,
                                onValueChange = {
                                    viewModel.updateFormField("visitorName", it)
                                },
                                label = { Text(AppStrings.visitorNameLabel) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 16.dp),
                                isError = formErrors.visitorName.isNotEmpty()
                            )
                            if (formErrors.visitorName.isNotEmpty()) {
                                Text(
                                    text = formErrors.visitorName,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.error,
                                    modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
                                )
                            }

                            // 방문자 회사
                            OutlinedTextField(
                                value = formState.visitorCompany,
                                onValueChange = {
                                    viewModel.updateFormField("visitorCompany", it)
                                },
                                label = { Text(AppStrings.visitorCompanyLabel) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 16.dp)
                            )

                            // 방문자 연락처
                            OutlinedTextField(
                                value = formState.visitorContact,
                                onValueChange = {
                                    viewModel.updateFormField("visitorContact", it)
                                },
                                label = { Text(AppStrings.visitorContactLabel) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 16.dp),
                                isError = formErrors.visitorContact.isNotEmpty()
                            )
                            if (formErrors.visitorContact.isNotEmpty()) {
                                Text(
                                    text = formErrors.visitorContact,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.error,
                                    modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
                                )
                            }

                            // 방문자 이메일
                            OutlinedTextField(
                                value = formState.visitorEmail,
                                onValueChange = {
                                    viewModel.updateFormField("visitorEmail", it)
                                },
                                label = { Text(AppStrings.visitorEmailLabel) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 16.dp),
                                isError = formErrors.visitorEmail.isNotEmpty()
                            )
                            if (formErrors.visitorEmail.isNotEmpty()) {
                                Text(
                                    text = formErrors.visitorEmail,
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.error,
                                    modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
                                )
                            }

                            // 방문 목적
                            Text(
                                text = AppStrings.visitPurposeLabel,
                                style = MaterialTheme.typography.bodyLarge,
                                modifier = Modifier.padding(bottom = 8.dp)
                            )

                            // 방문 목적 선택
                            if (visitReasons.isNotEmpty()) {
                                Row(modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 16.dp)) {
                                    // 방문 목적 드롭다운
                                    var expanded by remember { mutableStateOf(false) }
                                    val selectedReason =
                                        visitReasons.find {
                                            it.visitReasonID == formState.visitReasonId
                                        }
                                            ?: visitReasons.firstOrNull()

                                    ExposedDropdownMenuBox(
                                        expanded = expanded,
                                        onExpandedChange = { expanded = it },
                                        modifier = Modifier
                                            .weight(1f)
                                            .padding(end = 8.dp)
                                    ) {
                                        OutlinedTextField(
                                            value = selectedReason?.visitReasonName ?: "",
                                            onValueChange = {},
                                            readOnly = true,
                                            trailingIcon = {
                                                ExposedDropdownMenuDefaults.TrailingIcon(
                                                    expanded = expanded
                                                )
                                            },
                                            modifier = Modifier
                                                .menuAnchor()
                                                .fillMaxWidth()
                                        )

                                        ExposedDropdownMenu(
                                            expanded = expanded,
                                            onDismissRequest = { expanded = false }
                                        ) {
                                            visitReasons.forEach { reason ->
                                                DropdownMenuItem(
                                                    text = { Text(reason.visitReasonName) },
                                                    onClick = {
                                                        viewModel.updateFormField(
                                                            "visitReasonId",
                                                            reason.visitReasonID
                                                        )
                                                        expanded = false
                                                    }
                                                )
                                            }
                                        }
                                    }

                                    // 방문 목적 상세 입력
                                    OutlinedTextField(
                                        value = formState.visitPurpose,
                                        onValueChange = {
                                            viewModel.updateFormField("visitPurpose", it)
                                        },
                                        placeholder = {
                                            Text(AppStrings.visitPurposeDetailPlaceholder)
                                        },
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                            }

                            // 방문 날짜/시간
                            Row(modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 16.dp)) {
                                // 방문 시작 날짜
                                OutlinedTextField(
                                    value = formState.visitDate,
                                    onValueChange = {
                                        viewModel.updateFormField("visitDate", it)
                                    },
                                    label = { Text(AppStrings.visitDateLabel) },
                                    modifier = Modifier
                                        .weight(1f)
                                        .padding(end = 8.dp),
                                    leadingIcon = {
                                        Icon(Icons.Default.DateRange, contentDescription = null)
                                    },
                                    isError = formErrors.visitDate.isNotEmpty()
                                )

                                // 방문 시작 시간
                                OutlinedTextField(
                                    value = formState.visitTime,
                                    onValueChange = {
                                        viewModel.updateFormField("visitTime", it)
                                    },
                                    label = { Text(AppStrings.visitTimeLabel) },
                                    modifier = Modifier.weight(1f),
                                    leadingIcon = {
                                        Icon(Icons.Default.DateRange, contentDescription = null)
                                    },
                                    isError = formErrors.visitTime.isNotEmpty()
                                )
                            }

                            if (formErrors.visitDate.isNotEmpty() ||
                                formErrors.visitTime.isNotEmpty()
                            ) {
                                Text(
                                    text =
                                        formErrors.visitDate.ifEmpty {
                                            formErrors.visitTime
                                        },
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.error,
                                    modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
                                )
                            }

                            // 방문 종료 날짜/시간
                            Row(modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 16.dp)) {
                                // 방문 종료 날짜
                                OutlinedTextField(
                                    value = formState.visitEndDate,
                                    onValueChange = {
                                        viewModel.updateFormField("visitEndDate", it)
                                    },
                                    label = { Text(AppStrings.visitEndDateLabel) },
                                    modifier = Modifier
                                        .weight(1f)
                                        .padding(end = 8.dp),
                                    leadingIcon = {
                                        Icon(Icons.Default.DateRange, contentDescription = null)
                                    },
                                    isError = formErrors.visitEndDate.isNotEmpty()
                                )

                                // 방문 종료 시간
                                OutlinedTextField(
                                    value = formState.visitEndTime,
                                    onValueChange = {
                                        viewModel.updateFormField("visitEndTime", it)
                                    },
                                    label = { Text(AppStrings.visitEndTimeLabel) },
                                    modifier = Modifier.weight(1f),
                                    leadingIcon = {
                                        Icon(Icons.Default.DateRange, contentDescription = null)
                                    },
                                    isError = formErrors.visitEndTime.isNotEmpty()
                                )
                            }

                            if (formErrors.visitEndDate.isNotEmpty() ||
                                formErrors.visitEndTime.isNotEmpty()
                            ) {
                                Text(
                                    text =
                                        formErrors.visitEndDate.ifEmpty {
                                            formErrors.visitEndTime
                                        },
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.error,
                                    modifier = Modifier.padding(start = 8.dp, bottom = 8.dp)
                                )
                            }

                            // 차량 번호
                            OutlinedTextField(
                                value = formState.visitorCarNumber,
                                onValueChange = {
                                    viewModel.updateFormField("visitorCarNumber", it)
                                },
                                label = { Text(AppStrings.visitorCarNumberLabel) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(bottom = 16.dp)
                            )
                        }
                    }

                    // 제출 버튼
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Button(
                            onClick = onBackClick,
                            modifier = Modifier.weight(1f),
                            colors =
                                ButtonDefaults.buttonColors(
                                    containerColor =
                                        MaterialTheme.colorScheme.surfaceVariant,
                                    contentColor =
                                        MaterialTheme.colorScheme.onSurfaceVariant
                                )
                        ) { Text(text = AppStrings.cancelButtonLabel) }

                        Button(
                            onClick = { viewModel.submitForm() },
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
                    onDismissRequest = { viewModel.hideEmployeeModal() },
                    title = { Text(text = AppStrings.selectEmployeeTitle) },
                    text = {
                        Column {
                            employeeList.forEach { employee ->
                                Surface(
                                    modifier =
                                        Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 4.dp),
                                    onClick = { viewModel.selectEmployee(employee) },
                                    color = MaterialTheme.colorScheme.surfaceVariant,
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(16.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            Icons.Default.Person,
                                            contentDescription = null,
                                            tint = MaterialTheme.colorScheme.primary
                                        )
                                        Spacer(modifier = Modifier.width(16.dp))
                                        Column {
                                            Text(
                                                text = employee.name,
                                                style = MaterialTheme.typography.titleMedium
                                            )
                                            if (employee.department.isNotEmpty()) {
                                                Text(
                                                    text = employee.department,
                                                    style =
                                                        MaterialTheme.typography
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
                        TextButton(onClick = { viewModel.hideEmployeeModal() }) {
                            Text(AppStrings.cancelButtonLabel)
                        }
                    }
                )
            }

            // API 에러 다이얼로그
            apiError?.let { error ->
                ErrorDialog(
                    title = error.title,
                    message = error.message,
                    onDismiss = { viewModel.clearApiError() },
                    onNavigateToHome = {
                        viewModel.clearApiError()
                        onBackClick()
                    }
                )
            }
        }
    }
}

@Preview(
    showBackground = true,
    widthDp = 1080,
    heightDp = 1920
)
@Composable
fun PrivacyAgreementScreenPreview() {
    VisitReserveKioskTheme { PrivacyAgreementScreen(onBackClick = {}) }
}
