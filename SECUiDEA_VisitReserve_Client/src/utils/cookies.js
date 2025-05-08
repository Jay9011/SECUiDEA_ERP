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

/**
 * 숫자 값을 쿠키로 저장
 * @param {string} name - 쿠키 이름
 * @param {number} value - 저장할 숫자 값
 * @param {Object} options - 쿠키 옵션 (만료일, path 등)
 */
export function setNumberCookie(name, value, options = {}) {
    if (typeof value !== 'number') {
        console.warn(`setNumberCookie의 값은 숫자여야 합니다. 현재 타입: ${typeof value}`);
        return;
    }
    setCookie(name, value.toString(), options);
}

/**
 * 쿠키에서 숫자 값 가져오기
 * @param {string} name - 쿠키 이름
 * @returns {number|null} 쿠키 숫자 값 또는 null
 */
export function getNumberCookie(name) {
    const value = getCookie(name);
    if (value === null) return null;

    const number = Number(value);
    return isNaN(number) ? null : number;
}

/**
 * 불리언 값을 쿠키로 저장
 * @param {string} name - 쿠키 이름
 * @param {boolean} value - 저장할 불리언 값
 * @param {Object} options - 쿠키 옵션 (만료일, path 등)
 */
export function setBooleanCookie(name, value, options = {}) {
    setCookie(name, value ? 'true' : 'false', options);
}

/**
 * 쿠키에서 불리언 값 가져오기
 * @param {string} name - 쿠키 이름
 * @returns {boolean|null} 쿠키 불리언 값 또는 null
 */
export function getBooleanCookie(name) {
    const value = getCookie(name);
    if (value === null) return null;
    return value === 'true';
}

/**
 * 날짜 객체를 쿠키로 저장 (타임스탬프로 변환)
 * @param {string} name - 쿠키 이름
 * @param {Date|number} value - 저장할 날짜 (Date 객체 또는 타임스탬프)
 * @param {Object} options - 쿠키 옵션 (만료일, path 등)
 */
export function setDateCookie(name, value, options = {}) {
    let timestamp = new Date(value).getTime();
    if (isNaN(timestamp)) {
        if (value instanceof Date) {
            timestamp = value.getTime();
        } else if (typeof value === 'number') {
            timestamp = value.getTime();
        } else {
            console.warn(`setDateCookie의 값은 Date 객체나 타임스탬프(숫자)여야 합니다. 현재 타입: ${typeof value}`);
            return;
        }
    }

    setCookie(name, timestamp.toString(), options);
}

/**
 * 쿠키에서 날짜 값 가져오기 (타임스탬프로 반환)
 * @param {string} name - 쿠키 이름
 * @returns {number|null} 타임스탬프 또는 null
 */
export function getDateCookie(name) {
    const value = getCookie(name);
    if (value === null) return null;

    const timestamp = Number(value);
    if (isNaN(timestamp)) return null;

    return new Date(timestamp);
} 