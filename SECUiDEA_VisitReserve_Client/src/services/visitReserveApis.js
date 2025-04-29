import { api } from '../utils/api';

/**
 * 방문 예약 관련 API 서비스
 */
const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

/**
 * 방문 목적 가져오기 API
 * @param {string} language - 언어 코드
 * @returns {Promise} - API 응답 객체
 */
export async function getVisitReasons(language) {
    try {
        const response = await fetch(`${API_BASE_URL}/Visit/VisitReason?lan=${language}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('API 호출 실패');
        }
        return await response.json();
    } catch (error) {
        console.error('방문 목적 가져오기 중 오류:', error);
        throw error;
    }
}

/**
 * 직원 정보 확인 API
 * @param {Object} employeeData - 직원 정보
 * @see employeeData.name - 직원 이름
 * @returns {Promise} - API 응답 객체
 */
export async function verifyEmployee(employeeData) {
    try {
        const response = await fetch(`${API_BASE_URL}/Visit/EmployeeByName?name=${employeeData.name}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('API 호출 실패');
        }
        return await response.json();
    } catch (error) {
        console.error('직원 정보 확인 중 오류:', error);
        throw error;
    }
}

/**
 * 방문 신청 API
 * @param {Object} data - 방문 신청 정보
 * @see data.employeePid - 직원 PID
 * @see data.employeeName - 직원 이름
 * @see data.visitorName - 방문자 이름
 * @see data.visitorCompany - 회사명
 * @see data.visitorContact - 방문자 연락처
 * @see data.visitorEmail - 방문자 이메일
 * @see data.visitReasonId - 방문 목적 ID
 * @see data.visitPurpose - 방문 목적
 * @see data.visitDate - 방문 날짜
 * @see data.visitTime - 방문 시간
 * @see data.visitEndDate - 방문 종료 날짜
 * @see data.visitEndTime - 방문 종료 시간
 * @see data.visitorCarNumber - 방문자 차량 번호
 * @returns {Promise} - API 응답 객체
 */
export async function submitReservation(data) {
    const response = await fetch(`${API_BASE_URL}/Visit/VisitReserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('방문 신청 API 호출 실패');
    return await response.json();
}

/**
 * 교육 영상 시청 여부 확인 API
 * @param {Object} visitorData - 방문자 정보
 * @see visitorData.visitorName - 방문자 이름
 * @see visitorData.visitorContact - 방문자 연락처
 * @returns {Promise} - API 응답 객체 (isSuccess, needEducation 등)
 */
export async function checkEducationVideo(visitorData) {
    try {
        const response = await fetch(`${API_BASE_URL}/Visit/CheckEducation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(visitorData)
        });

        if (!response.ok) {
            throw new Error('교육 영상 확인 API 호출 실패');
        }

        return await response.json();
    } catch (error) {
        console.error('교육 영상 확인 중 오류:', error);
        throw error;
    }
}

/**
 * 교육 완료 저장 API
 * @returns {Promise} - API 응답 객체
 */
export async function saveEducationCompletion() {
    try {
        const response = await api.post('/Visit/EducationCompletion');
        if (!response.ok) {
            throw new Error('교육 완료 저장 API 호출 실패');
        }
        return await response.json();
    } catch (error) {
        console.error('교육 완료 저장 중 오류:', error);
        throw error;
    }
}