package com.secuidea.visitreservekiosk.language

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable

/** 앱에서 사용하는 문자열 리소스 */
object AppStrings {
    val appTitle: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "ASMK 방문 예약 시스템" else "ASMK Visit Request System"

    val welcomeTitle: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "ASMK 방문을 환영합니다" else "Welcome to ASMK"

    val welcomeSubtitle: String
        @Composable
        @ReadOnlyComposable
        get() =
            if (LocaleHelper.isKorean()) "방문 신청을 위해 아래 버튼을 눌러주세요"
            else "Please press the button below to request a visit"

    val visitRequestButton: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "방문 신청" else "Visit Request"

    val changeLanguageButton: String
        @Composable @ReadOnlyComposable get() = if (LocaleHelper.isKorean()) "English" else "한국어"

    val changeLanguageDescription: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "영어로 전환" else "Switch to Korean"

    // 방문 신청 화면 문자열
    val privacyAgreementTitle: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "방문 신청" else "Visit Request"

    val privacyAgreementSubtitle: String
        @Composable
        @ReadOnlyComposable
        get() =
            if (LocaleHelper.isKorean()) "방문 신청을 위해 아래 정보를 입력해주세요"
            else "Please fill in the information below to request a visit"

    val privacyPolicyTitle: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "개인정보 처리방침" else "Privacy Policy"

    val privacyPolicyDescription: String
        @Composable
        @ReadOnlyComposable
        get() =
            if (LocaleHelper.isKorean()) "아래 내용을 읽고 개인정보 수집 및 이용에 동의해주세요."
            else
                "Please read the following and agree to the collection and use of personal information."

    val privacyPolicyAccordionTitle: String
        @Composable
        @ReadOnlyComposable
        get() =
            if (LocaleHelper.isKorean()) "개인정보 수집 및 이용 동의"
            else "Consent to collection and use of personal information"

    val privacyPolicyContent: String
        @Composable
        @ReadOnlyComposable
        get() =
            if (LocaleHelper.isKorean())
                """
1. 수집항목: 이름, 연락처, 회사명, 이메일, 차량번호
2. 수집목적: 방문자 확인 및 출입 관리
3. 보유기간: 방문일로부터 1년간 보관 후 파기
4. 동의를 거부할 권리가 있으나, 동의 거부 시 방문 신청이 제한됩니다.
                """
            else
                """
1. Collection items: Name, Contact, Company name, Email, Vehicle number
2. Purpose of collection: Visitor verification and access management
3. Retention period: Stored for 1 year from the date of visit and then destroyed
4. You have the right to refuse consent, but if you refuse consent, your visit request will be restricted.
                """

    val privacyAgreeOption: String
        @Composable @ReadOnlyComposable get() = if (LocaleHelper.isKorean()) "동의합니다" else "I agree"

    val privacyDisagreeOption: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "동의하지 않습니다" else "I disagree"

    val privacyDisagreeNotice: String
        @Composable
        @ReadOnlyComposable
        get() =
            if (LocaleHelper.isKorean()) "개인정보 수집에 동의하지 않으면 방문 신청을 진행할 수 없습니다."
            else
                "If you do not agree to the collection of personal information, you cannot proceed with the visit request."

    val employeeInfoTitle: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "방문 대상 직원 정보" else "Employee Information"

    val employeeNameLabel: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "직원 이름" else "Employee Name"

    val employeeVerifiedMessage: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "직원 확인 완료" else "Employee verified"

    val verifyButtonLabel: String
        @Composable @ReadOnlyComposable get() = if (LocaleHelper.isKorean()) "확인" else "Verify"

    val visitorInfoTitle: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "방문자 정보" else "Visitor Information"

    val visitorNameLabel: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "방문자 이름" else "Visitor Name"

    val visitorCompanyLabel: String
        @Composable @ReadOnlyComposable get() = if (LocaleHelper.isKorean()) "회사명" else "Company"

    val visitorContactLabel: String
        @Composable @ReadOnlyComposable get() = if (LocaleHelper.isKorean()) "연락처" else "Contact"

    val visitorEmailLabel: String
        @Composable @ReadOnlyComposable get() = if (LocaleHelper.isKorean()) "이메일" else "Email"

    val visitPurposeLabel: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "방문 목적" else "Visit Purpose"

    val visitPurposeDetailPlaceholder: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "상세 내용 입력" else "Enter details"

    val visitDateLabel: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "방문 날짜" else "Visit Date"

    val visitTimeLabel: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "방문 시간" else "Visit Time"

    val visitEndDateLabel: String
        @Composable @ReadOnlyComposable get() = if (LocaleHelper.isKorean()) "종료 날짜" else "End Date"

    val visitEndTimeLabel: String
        @Composable @ReadOnlyComposable get() = if (LocaleHelper.isKorean()) "종료 시간" else "End Time"

    val visitorCarNumberLabel: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "차량 번호" else "Vehicle Number"

    val submitButtonLabel: String
        @Composable @ReadOnlyComposable get() = if (LocaleHelper.isKorean()) "제출하기" else "Submit"

    val cancelButtonLabel: String
        @Composable @ReadOnlyComposable get() = if (LocaleHelper.isKorean()) "취소" else "Cancel"

    val selectEmployeeTitle: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "직원 선택" else "Select Employee"

    // 에러 다이얼로그 문자열
    val errorDialogTitle: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "오류 발생" else "Error Occurred"

    val apiErrorDefaultMessage: String
        @Composable
        @ReadOnlyComposable
        get() =
            if (LocaleHelper.isKorean()) "요청을 처리하는 중 오류가 발생했습니다."
            else "An error occurred while processing your request."

    val contactAdminMessage: String
        @Composable
        @ReadOnlyComposable
        get() =
            if (LocaleHelper.isKorean()) "관리자에게 문의해 주세요."
            else "Please contact the administrator."

    val dismissButtonLabel: String
        @Composable @ReadOnlyComposable get() = if (LocaleHelper.isKorean()) "닫기" else "Dismiss"

    val goToHomeButtonLabel: String
        @Composable
        @ReadOnlyComposable
        get() = if (LocaleHelper.isKorean()) "첫 화면으로 돌아가기" else "Return to Home"
}
