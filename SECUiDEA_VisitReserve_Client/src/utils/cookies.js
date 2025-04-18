/**
 * 쿠키 관련 유틸리티 함수
 */

/**
 * 쿠키 설정 함수
 * @param {string} name - 쿠키 이름
 * @param {string} value - 쿠키 값
 * @param {Object} options - 쿠키 옵션 (만료일, path 등)
 */
export function setCookie(name, value, options = {}) {
    const cookieOptions = {
        path: '/',
        SameSite: 'Strict',
        ...options
    };

    let cookieString = `${name}=${encodeURIComponent(value)}`;

    if (cookieOptions.expires) {
        if (typeof cookieOptions.expires === 'number') {
            const date = new Date();
            date.setTime(date.getTime() + cookieOptions.expires * 24 * 60 * 60 * 1000);
            cookieOptions.expires = date;
        }
        cookieString += `; expires=${cookieOptions.expires.toUTCString()}`;
    }

    if (cookieOptions.path) {
        cookieString += `; path=${cookieOptions.path}`;
    }

    if (cookieOptions.SameSite) {
        cookieString += `; SameSite=${cookieOptions.SameSite}`;
    }

    if (cookieOptions.secure) {
        cookieString += '; Secure';
    }

    document.cookie = cookieString;
}

/**
 * 쿠키 가져오기 함수
 * @param {string} name - 쿠키 이름
 * @returns {string|null} 쿠키 값 또는 null
 */
export function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
}

/**
 * 쿠키 삭제 함수
 * @param {string} name - 삭제할 쿠키 이름
 */
export function deleteCookie(name) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
} 