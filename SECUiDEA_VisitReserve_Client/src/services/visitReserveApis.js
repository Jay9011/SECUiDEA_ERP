import authService from '../utils/authService';

/**
 * 방문 예약 관련 API 서비스
 */
const API_BASE_URL = import.meta.env.VITE_BASE_API_URL;

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

export async function verifyEmployee(employeeData) {
    try {
        const response = await fetch(`${API_BASE_URL}/Visit/EmployeeByName?name=${employeeData.name}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authService.getAccessToken()}`
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

export async function submitReservation(data) {
    const response = await fetch(`${API_BASE_URL}/Visit/VisitReserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('방문 신청 API 호출 실패');
    return await response.json();
}