/**
 * JWT 토큰 관련 유틸리티 함수
 */

/**
 * JWT 토큰을 디코딩하여 페이로드를 파싱합니다.
 * @param {string} token - JWT 토큰
 * @returns {Object} 디코딩된 토큰 페이로드
 */
export function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
    );
    return JSON.parse(jsonPayload);
}

/**
 * JWT 토큰에서 권한 정보를 추출합니다.
 * @param {string} token - JWT 토큰
 * @returns {Object} 추출된 권한 정보
 */
export function extractPermissions(token) {
    const decodedToken = parseJwt(token);
    const permissions = {};

    // 모든 클레임을 순회하면서 Permission: 접두사가 있는 클레임 찾기
    Object.keys(decodedToken).forEach(key => {
        if (key.startsWith('Permission:')) {
            const feature = key.split(':')[1];
            const level = parseInt(decodedToken[key]);
            permissions[feature] = level;
        }
    });

    return permissions;
} 