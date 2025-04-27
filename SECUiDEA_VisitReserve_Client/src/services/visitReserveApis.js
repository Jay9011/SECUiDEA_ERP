/**
 * 방문 예약 관련 API 서비스
 */
const API_BASE_URL = '/api';

export async function verifyEmployee(employeeData) {
    try {
        const response = await fetch(`${API_BASE_URL}/verify-employee`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(employeeData),
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
    const response = await fetch(`${API_BASE_URL}/visit-reservation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('방문 신청 API 호출 실패');
    return await response.json();
}