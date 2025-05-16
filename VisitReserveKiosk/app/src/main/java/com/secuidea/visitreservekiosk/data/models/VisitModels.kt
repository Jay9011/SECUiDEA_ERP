package com.secuidea.visitreservekiosk.data.models

import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter

/** 방문 신청 폼 상태 */
data class VisitFormState(
    val employeePid: Int = 0,
    val employeeName: String = "",
    val visitorName: String = "",
    val visitorCompany: String = "",
    val visitorContact: String = "",
    val visitorEmail: String = "",
    val visitorCarNumber: String = "",
    val visitReasonId: String = "",
    val visitPurpose: String = "",
    val visitDate: String = getCurrentDate(),
    val visitTime: String = getCurrentTime(),
    val visitEndDate: String = getCurrentDate(),
    val visitEndTime: String = "23:59"
)

/** 폼 에러 상태 */
data class VisitFormErrors(
    val employeeName: String = "",
    val visitorName: String = "",
    val visitorContact: String = "",
    val visitorEmail: String = "",
    val visitDate: String = "",
    val visitTime: String = "",
    val visitEndDate: String = "",
    val visitEndTime: String = "",
    val employee: String = ""
)

/** 방문 목적 모델 */
data class VisitReason(val visitReasonID: String, val visitReasonName: String)

/** 직원 정보 모델 */
data class Employee(val pid: Int, val sabun: String? = "", val name: String, val departmentName: String = "", val personStatusId: Int, val personStatusName: String? = "")

/** 현재 날짜 문자열 반환 */
fun getCurrentDate(): String {
    return LocalDate.now().format(DateTimeFormatter.ISO_DATE)
}

/** 현재 시간 문자열 반환 */
fun getCurrentTime(): String {
    return LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"))
}

/** 방문 신청 요청 모델 */
data class VisitReservationRequest(
    val employeePid: Int,
    val employeeName: String,
    val visitorName: String,
    val visitorCompany: String,
    val visitorContact: String,
    val visitorEmail: String,
    val visitReasonId: String,
    val visitPurpose: String,
    val visitDate: String,
    val visitTime: String,
    val visitEndDate: String,
    val visitEndTime: String,
    val visitorCarNumber: String
)

/** 방문 신청 응답 모델 */
data class VisitReservationResponse(
    val isSuccess: Boolean,
    val message: String,
    val data: VisitReservationData? = null
)

/** 방문 신청 응답 데이터 */
data class VisitReservationData(
    val ApiKey: String,
    val visitReserveVisitantId: String,
    val EmployeePhone: String?
)

/** 직원 확인 요청 모델 */
data class VerifyEmployeeRequest(val name: String)

/** 직원 확인 응답 모델 */
data class VerifyEmployeeResponse(
    val isSuccess: Boolean,
    val message: String,
    val data: VerifyEmployeeData? = null
)

/** 직원 확인 응답 데이터 */
data class VerifyEmployeeData(val employees: List<Employee>)

/** 방문 목적 응답 모델 */
data class VisitReasonsResponse(
    val isSuccess: Boolean,
    val message: String,
    val data: VisitReasonsData? = null
)

/** 방문 목적 응답 데이터 */
data class VisitReasonsData(val reasons: List<VisitReason>)
