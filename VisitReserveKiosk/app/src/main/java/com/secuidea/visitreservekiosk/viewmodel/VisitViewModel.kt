package com.secuidea.visitreservekiosk.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.secuidea.visitreservekiosk.api.VisitRequest
import com.secuidea.visitreservekiosk.data.repository.ApiResult
import com.secuidea.visitreservekiosk.data.repository.VisitRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

/** 방문 신청 관련 ViewModel */
class VisitViewModel : ViewModel() {
    private val repository = VisitRepository()

    // 방문 신청 상태
    private val _submitState = MutableStateFlow<ApiResult<String>>(ApiResult.Loading)
    val submitState: StateFlow<ApiResult<String>> = _submitState

    // 방문 정보 조회 상태
    private val _visitDetailsState = MutableStateFlow<ApiResult<VisitRequest>>(ApiResult.Loading)
    val visitDetailsState: StateFlow<ApiResult<VisitRequest>> = _visitDetailsState

    /** 방문 신청 제출 */
    fun submitVisitRequest(
            visitorName: String,
            purpose: String,
            visitDate: String,
            contactNumber: String
    ) {
        viewModelScope.launch {
            _submitState.value = ApiResult.Loading

            val visitRequest =
                    VisitRequest(
                            visitorName = visitorName,
                            purpose = purpose,
                            visitDate = visitDate,
                            contactNumber = contactNumber
                    )

            val result = repository.submitVisitRequest(visitRequest)
            _submitState.value = result
        }
    }

    /** 방문 정보 조회 */
    fun getVisitDetails(visitId: String) {
        viewModelScope.launch {
            _visitDetailsState.value = ApiResult.Loading
            val result = repository.getVisitDetails(visitId)
            _visitDetailsState.value = result
        }
    }

    /** 상태 초기화 */
    fun resetSubmitState() {
        _submitState.value = ApiResult.Loading
    }

    fun resetVisitDetailsState() {
        _visitDetailsState.value = ApiResult.Loading
    }
}
