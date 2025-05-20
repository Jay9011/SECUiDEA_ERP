package com.secuidea.visitreservekiosk.viewmodel

import androidx.lifecycle.ViewModel
import com.secuidea.visitreservekiosk.api.ApiErrorHandler.launchSafeApiCall
import com.secuidea.visitreservekiosk.api.ApiException
import com.secuidea.visitreservekiosk.data.models.*
import com.secuidea.visitreservekiosk.data.repository.ApiResult
import com.secuidea.visitreservekiosk.data.repository.VisitRepository
import com.secuidea.visitreservekiosk.language.AppStrings
import com.secuidea.visitreservekiosk.language.LocaleHelper
import java.text.SimpleDateFormat
import java.util.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class PrivacyAgreementViewModel : ViewModel() {
    private val repository = VisitRepository()

    // 로딩 상태
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    // 방문 목적 목록
    private val _visitReasons = MutableStateFlow<List<VisitReason>>(emptyList())
    val visitReasons: StateFlow<List<VisitReason>> = _visitReasons.asStateFlow()

    // 폼 상태
    private val _formState = MutableStateFlow(VisitFormState())
    val formState: StateFlow<VisitFormState> = _formState.asStateFlow()

    // 폼 에러
    private val _formErrors = MutableStateFlow(VisitFormErrors())
    val formErrors: StateFlow<VisitFormErrors> = _formErrors.asStateFlow()

    // 직원 확인 상태
    private val _isEmployeeVerified = MutableStateFlow(false)
    val isEmployeeVerified: StateFlow<Boolean> = _isEmployeeVerified.asStateFlow()

    // 직원 확인 에러
    private val _verificationError = MutableStateFlow("")
    val verificationError: StateFlow<String> = _verificationError.asStateFlow()

    // 직원 선택 모달 상태
    private val _showEmployeeModal = MutableStateFlow(false)
    val showEmployeeModal: StateFlow<Boolean> = _showEmployeeModal.asStateFlow()

    // 직원 목록
    private val _employeeList = MutableStateFlow<List<Employee>>(emptyList())
    val employeeList: StateFlow<List<Employee>> = _employeeList.asStateFlow()

    // API 에러 상태
    private val _apiError = MutableStateFlow<ApiException?>(null)
    val apiError: StateFlow<ApiException?> = _apiError.asStateFlow()

    // 예약 성공 시 결과 화면 이동 신호
    private val _reservationSuccess = MutableStateFlow(false)
    val reservationSuccess: StateFlow<Boolean> = _reservationSuccess.asStateFlow()

    // 현재 언어
    private val currentLanguage: String
        get() = LocaleHelper.getLanguage()

    // 방문 목적 목록 로드
    fun loadVisitReasons() {
        launchSafeApiCall(_apiError, _isLoading) {
            val language = currentLanguage
            val response = repository.getVisitReasons(language)
            _visitReasons.value = response.data?.reasons ?: emptyList()
            if (response.data?.reasons?.isNotEmpty() == true) {
                updateFormField("visitReasonId", response.data.reasons[0].visitReasonID)
            }
        }
    }

    // 직원 이름 업데이트
    fun updateEmployeeName(name: String) {
        _formState.value = _formState.value.copy(employeeName = name, employeePid = 0)
        _isEmployeeVerified.value = false
        _verificationError.value = ""

        // 에러 메시지 초기화
        if (_formErrors.value.employeeName.isNotEmpty()) {
            clearFieldError("employeeName")
        }
    }

    // 직원 확인
    fun verifyEmployee() {
        val name = _formState.value.employeeName.trim()
        if (name.isEmpty()) {
            updateFieldError(
                    "employeeName",
                    AppStrings.ErrorMessages.getLocalizedMessage(
                            "employeeNameRequired",
                            currentLanguage
                    )
            )
            return
        }

        _verificationError.value = ""

        launchSafeApiCall(_apiError, _isLoading) {
            val response = repository.verifyEmployee(name)
            val employees = response.data?.employees ?: emptyList()
            if (employees == null) {
                _verificationError.value =
                        AppStrings.ErrorMessages.getLocalizedMessage(
                                "serverResponseError",
                                currentLanguage
                        )
            } else if (employees.isEmpty()) {
                _verificationError.value =
                        AppStrings.ErrorMessages.getLocalizedMessage(
                                "employeeNotFound",
                                currentLanguage
                        )
            } else if (employees.size == 1) {
                // 직원이 한 명인 경우 바로 선택
                val employee = employees[0]
                _formState.value =
                        _formState.value.copy(
                                employeeName = employee.name,
                                employeePid = employee.pid
                        )
                _isEmployeeVerified.value = true
            } else {
                // 직원이 여러 명인 경우 모달로 선택
                _employeeList.value = employees
                _showEmployeeModal.value = true
            }
        }
    }

    // 직원 선택 (모달에서)
    fun selectEmployee(employee: Employee) {
        _formState.value =
                _formState.value.copy(employeeName = employee.name, employeePid = employee.pid)
        _isEmployeeVerified.value = true
        _showEmployeeModal.value = false
    }

    // 직원 선택 모달 닫기
    fun hideEmployeeModal() {
        _showEmployeeModal.value = false
    }

    // 직원 확인 상태 초기화
    fun resetEmployeeVerification() {
        _isEmployeeVerified.value = false
        _formState.value = _formState.value.copy(employeePid = 0)
    }

    // 폼 필드 업데이트
    fun updateFormField(field: String, value: String) {
        _formState.value =
                when (field) {
                    "visitorName" -> _formState.value.copy(visitorName = value)
                    "visitorCompany" -> _formState.value.copy(visitorCompany = value)
                    "visitorContact" -> _formState.value.copy(visitorContact = value)
                    "visitorEmail" -> _formState.value.copy(visitorEmail = value)
                    "visitorCarNumber" -> _formState.value.copy(visitorCarNumber = value)
                    "visitReasonId" -> _formState.value.copy(visitReasonId = value)
                    "visitPurpose" -> _formState.value.copy(visitPurpose = value)
                    "visitDate" -> _formState.value.copy(visitDate = value)
                    "visitTime" -> _formState.value.copy(visitTime = value)
                    "visitEndDate" -> _formState.value.copy(visitEndDate = value)
                    "visitEndTime" -> _formState.value.copy(visitEndTime = value)
                    else -> _formState.value
                }

        // 에러 메시지 초기화
        clearFieldError(field)
    }

    // 필드 에러 업데이트
    private fun updateFieldError(field: String, errorMessage: String) {
        val currentErrors = _formErrors.value
        _formErrors.value =
                when (field) {
                    "employeeName" -> currentErrors.copy(employeeName = errorMessage)
                    "visitorName" -> currentErrors.copy(visitorName = errorMessage)
                    "visitorContact" -> currentErrors.copy(visitorContact = errorMessage)
                    "visitorEmail" -> currentErrors.copy(visitorEmail = errorMessage)
                    "visitDate" -> currentErrors.copy(visitDate = errorMessage)
                    "visitTime" -> currentErrors.copy(visitTime = errorMessage)
                    "visitEndDate" -> currentErrors.copy(visitEndDate = errorMessage)
                    "visitEndTime" -> currentErrors.copy(visitEndTime = errorMessage)
                    "employee" -> currentErrors.copy(employee = errorMessage)
                    else -> currentErrors
                }
    }

    // 필드 에러 초기화
    private fun clearFieldError(field: String) {
        val currentErrors = _formErrors.value
        _formErrors.value =
                when (field) {
                    "employeeName" -> currentErrors.copy(employeeName = "")
                    "visitorName" -> currentErrors.copy(visitorName = "")
                    "visitorContact" -> currentErrors.copy(visitorContact = "")
                    "visitorEmail" -> currentErrors.copy(visitorEmail = "")
                    "visitDate" -> currentErrors.copy(visitDate = "")
                    "visitTime" -> currentErrors.copy(visitTime = "")
                    "visitEndDate" -> currentErrors.copy(visitEndDate = "")
                    "visitEndTime" -> currentErrors.copy(visitEndTime = "")
                    "employee" -> currentErrors.copy(employee = "")
                    else -> currentErrors
                }
    }

    // 폼 유효성 검사
    private fun validateForm(): Boolean {
        var isValid = true

        // 직원 확인 여부 검사
        if (!_isEmployeeVerified.value || _formState.value.employeePid == 0) {
            updateFieldError(
                    "employee",
                    AppStrings.ErrorMessages.getLocalizedMessage(
                            "employeeVerificationRequired",
                            currentLanguage
                    )
            )
            isValid = false
        }

        // 필수 필드 검사
        if (_formState.value.visitorName.trim().isEmpty()) {
            updateFieldError(
                    "visitorName",
                    AppStrings.ErrorMessages.getLocalizedMessage(
                            "visitorNameRequired",
                            currentLanguage
                    )
            )
            isValid = false
        }

        if (_formState.value.visitorContact.trim().isEmpty()) {
            updateFieldError(
                    "visitorContact",
                    AppStrings.ErrorMessages.getLocalizedMessage("contactRequired", currentLanguage)
            )
            isValid = false
        }

        // 날짜/시간 검사 제거 (자동 설정으로 변경)

        return isValid
    }

    // 폼 제출
    fun submitForm() {
        if (!validateForm()) {
            return
        }

        val form = _formState.value

        // 현재 날짜와 시간 가져오기
        val currentDate = Calendar.getInstance()
        val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())

        val today = dateFormat.format(currentDate.time)
        val nowTime = timeFormat.format(currentDate.time)

        // 방문 시작 날짜/시간은 현재로, 종료 날짜는 오늘, 종료 시간은 23:59:59로 설정
        val updatedForm =
                form.copy(
                        visitDate = today,
                        visitTime = nowTime,
                        visitEndDate = today,
                        visitEndTime = "23:59:59"
                )

        val request =
                VisitReservationRequest(
                        employeePid = updatedForm.employeePid,
                        employeeName = updatedForm.employeeName,
                        visitorName = updatedForm.visitorName,
                        visitorCompany = updatedForm.visitorCompany,
                        visitorContact = updatedForm.visitorContact,
                        visitorEmail = updatedForm.visitorEmail,
                        visitReasonId = updatedForm.visitReasonId,
                        visitPurpose = updatedForm.visitPurpose,
                        visitDate = updatedForm.visitDate,
                        visitTime = updatedForm.visitTime,
                        visitEndDate = updatedForm.visitEndDate,
                        visitEndTime = updatedForm.visitEndTime,
                        visitorCarNumber = updatedForm.visitorCarNumber
                )

        launchSafeApiCall(_apiError, _isLoading) {
            val response = repository.submitVisitReservation(request)
            if (response.isSuccess && response.data != null) {
                val apiKey = response.data.ApiKey
                val visitReserveVisitantId = response.data.visitReserveVisitantId
                val employeePhone = response.data.EmployeePhone
                val visitorName = updatedForm.visitorName
                val visitorCompany = updatedForm.visitorCompany
                val employeeName = updatedForm.employeeName
                val visitDate = updatedForm.visitDate

                // 1. 방문자에게 알림톡 발송
                // 템플릿 이름 설정 - 한국어는 'VisitReserve', 다른 언어는 'VisitReserve_언어코드'
                val currentLang = LocaleHelper.getLanguage()
                val visitorTemplateName = if (currentLang == "ko") "VisitReserve" else "VisitReserve_${currentLang}"

                repository.sendTemplateMessage(
                        apiKey = apiKey,
                        gubun = visitorTemplateName,
                        phoneNumber = updatedForm.visitorContact,
                        userName = visitorName
                )

                // 2. 접견인(직원)에게 알림톡 발송 (전화번호가 있을 때만)
                if (!employeePhone.isNullOrBlank() && !visitReserveVisitantId.isNullOrBlank()) {
                    val templateVariables =
                            mapOf(
                                    "방문자회사" to visitorCompany,
                                    "방문자이름" to visitorName,
                                    "방문일" to visitDate,
                                    "신청시간" to
                                            SimpleDateFormat(
                                                            "yyyy-MM-dd HH:mm:ss",
                                                            Locale.getDefault()
                                                    )
                                                    .format(Date())
                            )
                    val queryVariables =
                            mapOf(
                                    "방문승인URL" to "/" // 실제 URL 필요시 수정
                            )

                    // 접견인 알림톡 템플릿 이름 설정
                    val employeeTemplateName = if (currentLang == "ko") "RequestApprove" else "RequestApprove_${currentLang}"

                    repository.sendTemplateMessage(
                            apiKey = apiKey,
                            gubun = employeeTemplateName,
                            phoneNumber = employeePhone,
                            userName = employeeName,
                            templateVariables = templateVariables,
                            queryVariables = queryVariables
                    )
                }

                // 3. 방문자 임시 교육 완료 처리
                try {
                    val contactLastEight = updatedForm.visitorContact.takeLast(8)
                    val id = "${visitorName}|${contactLastEight}"
                    val body = GuestLoginModel(id = id, password = contactLastEight)

                    val educationResult = repository.autoCompleteEducation(body)

                    if (educationResult is ApiResult.Success) {
                        // 교육 완료 처리 성공
                        println("방문자 교육 완료 처리 성공")
                    } else if (educationResult is ApiResult.Error) {
                        // 교육 완료 처리 실패 (로그만 남기고 결과에는 영향 없음)
                        println("방문자 교육 완료 처리 실패: ${educationResult.message}")
                    }
                } catch (e: Exception) {
                    // 교육 완료 처리 중 오류 발생 (로그만 남기고 결과에는 영향 없음)
                    println("교육 완료 처리 오류: ${e.message}")
                }

                // 예약 성공 신호
                _reservationSuccess.value = true
            }
        }
    }

    // API 에러 처리 완료
    fun clearApiError() {
        _apiError.value = null
    }
}
