import { setCookie, getCookie, deleteCookie, getBooleanCookie, setBooleanCookie, setDateCookie, getDateCookie } from './cookies';
import { S1LoginApi, S1GuestLoginApi, LogoutApi } from './api';
import { AuthProvider } from './authProviders';

/**
 * 인증 관련 서비스 기능을 제공하는 객체
 */
const authService = {
    /**
     * 프로바이더별 로그인 처리
     * @param {string} provider - 인증 프로바이더 (AuthProvider 객체의 상수 중 하나)
     * @param {string} id - 사용자 ID
     * @param {string} password - 사용자 비밀번호 (프로바이더에 따라 필요 없을 수 있음)
     * @param {boolean} rememberMe - 로그인 유지 여부
     * @returns {Promise<Object>} - 로그인 결과
     */
    login: async (provider, id, password, rememberMe = false) => {
        switch (provider) {
            case AuthProvider.S1:
                return await S1LoginApi(id, password, rememberMe);
            case AuthProvider.S1_GUEST:
                return await S1GuestLoginApi(id, password, false);
            case AuthProvider.SECUiDEA:
                // 추후 구현
                throw new Error('아직 구현되지 않은 로그인 방식입니다');
            default:
                throw new Error(`지원하지 않는 인증 프로바이더입니다: ${provider}`);
        }
    },

    /**
     * 서버에 로그아웃 요청 전송
     * @param {string} sessionId - 세션 ID
     * @param {string} refreshToken - 리프레시 토큰
     * @returns {Promise<Response>} - 서버 응답
     */
    logout: async (sessionId, refreshToken) => {
        return await LogoutApi(sessionId, refreshToken);
    },

    /**
     * 비컨 API를 사용한 로그아웃 요청 (페이지 언로드 시)
     * @param {string} apiUrl - API 기본 URL
     * @param {string} sessionId - 세션 ID
     * @param {string} refreshToken - 리프레시 토큰
     */
    sendBeaconLogout: (apiUrl, sessionId, refreshToken) => {
        const logoutUrl = `${apiUrl}/auth/logout`;
        navigator.sendBeacon(
            logoutUrl,
            JSON.stringify({
                sessionId,
                refreshToken
            })
        );
    },

    /**
     * 토큰 만료 또는 인증 오류 시 처리
     * 쿠키를 삭제하고 로그인 페이지로 리다이렉트합니다.
     */
    handleTokenExpiration: () => {
        // 쿠키에서 인증 정보 삭제
        authService.clearAuthCookies();

        // 로그인 페이지로 리다이렉트
        window.location.href = "/visit/login";
    },

    /**
     * 인증 상태 초기화 (쿠키 삭제)
     */
    clearAuthCookies: () => {
        deleteCookie('accessToken');
        deleteCookie('accessExpiryDate');
        deleteCookie('refreshToken');
        deleteCookie('refreshExpiryDate');
        deleteCookie('isRememberMe');
        deleteCookie('sessionId');
        deleteCookie('enableSessionTimeout');
        deleteCookie('sessionExpiryDate');
    },

    /**
     * 쿠키에서 액세스 토큰 가져오기
     * @returns {string|null} 액세스 토큰
     */
    getAccessToken: () => {
        return getCookie('accessToken');
    },

    /**
     * 쿠키에서 액세스 토큰 만료 시간 가져오기
     * @returns {number|null} 액세스 토큰 만료 시간 (타임스탬프)
     */
    getAccessTokenExpiryDate: () => {
        return getDateCookie('accessExpiryDate');
    },

    /**
     * 쿠키에서 리멤버 미 여부 가져오기
     * @returns {boolean} 리멤버 미 여부
     */
    isRememberMe: () => {
        return getBooleanCookie('isRememberMe') || false;
    },

    /**
     * 쿠키에서 리프레시 토큰 가져오기
     * @returns {string|null} 리프레시 토큰
     */
    getRefreshToken: () => {
        return getCookie('refreshToken');
    },

    /**
     * 쿠키에서 리프레시 토큰 만료 시간 가져오기
     * @returns {number|null} 리프레시 토큰 만료 시간 (타임스탬프)
     */
    getRefreshTokenExpiryDate: () => {
        return getDateCookie('refreshExpiryDate');
    },

    /**
     * 쿠키에서 세션 ID 가져오기
     * @returns {string|null} 세션 ID
     */
    getSessionId: () => {
        return getCookie('sessionId');
    },

    /**
     * 쿠키에서 세션 타임아웃 여부 가져오기
     * @returns {boolean} 세션 타임아웃 여부
     */
    getEnableSessionTimeout: () => {
        return getBooleanCookie('enableSessionTimeout') || false;
    },

    /**
     * 쿠키에서 세션 ID 만료 시간 가져오기
     * @returns {number|null} 세션 ID 만료 시간 (타임스탬프)
     */
    getSessionExpiryDate: () => {
        return getDateCookie('sessionExpiryDate');
    },


    /**
     * 쿠키에 인증 정보 저장
     * @param {Object} data - 인증 정보 객체
     */
    setAuthCookies: (data) => {
        // data에 포함된 정보를 쿠키에 저장 (정보가 없다면 기존 쿠키 그대로 유지)
        if (data.accessToken) {
            setCookie('accessToken', data.accessToken);
        }
        if (data.accessExpiryDate) {
            setDateCookie('accessExpiryDate', data.accessExpiryDate);
        }
        if (data.refreshToken) {
            setCookie('refreshToken', data.refreshToken);
        }
        if (data.refreshExpiryDate) {
            setDateCookie('refreshExpiryDate', data.refreshExpiryDate);
        }
        if (data.isRememberMe !== undefined) {
            setBooleanCookie('isRememberMe', data.isRememberMe);
        }
        if (data.sessionId) {
            setCookie('sessionId', data.sessionId);
        }
        if (data.enableSessionTimeout !== undefined) {
            setBooleanCookie('enableSessionTimeout', data.enableSessionTimeout);
        }
        if (data.sessionExpiryDate) {
            setDateCookie('sessionExpiryDate', data.sessionExpiryDate);
        }
    }
};

export default authService; 