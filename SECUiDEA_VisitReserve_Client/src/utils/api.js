import { getCookie, setCookie } from "./cookies"
import { parseJwt } from "./jwt"
import authService from "./authService";

const apiBaseUrl = import.meta.env.VITE_BASE_API_URL;

/**
 * 토큰이 만료 임박 확인 (5분 이내 만료 혹은 이미 만료)
 * @returns {boolean}
 */
const isTokenExpiringSoon = () => {
    const token = getCookie("accessToken");
    if (!token) return true; // TODO: 토큰이 없는 경우 로그인 여부 확인해야 함 (로그인을 했는데 토큰이 만료되어 사라진건지 아니면 로그인 자체를 안했는지 확인해야 함)

    try {
        const decodedToken = parseJwt(token);
        const expirationTime = decodedToken.exp * 1000;
        const currentTime = Date.now();
        const timeRemaining = expirationTime - currentTime;

        // 토큰이 5분 이내로 만료되면 true 반환
        return timeRemaining <= 300000;
    } catch (error) {
        console.error("Error parsing JWT token:", error);
        return false;
    }
};

/**
 * 토큰 갱신
 * @returns {boolean} 토큰 갱신 성공 여부
 */
export const refreshAccessToken = async () => {
    const refreshToken = getCookie("refreshToken");
    const sessionId = getCookie("sessionId");

    if (!refreshToken || !sessionId) {
        return false;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/auth/refreshToken`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Session-Id": sessionId,
                "X-Refresh-Token": refreshToken,
            }
        });

        if (!response.ok) {
            console.error("Failed to refresh access token:", response.statusText);
            return false;
        }

        const data = await response.json();

        // 새로운 토큰 저장
        setCookie("accessToken", data.accessToken);
        // TODO: 추후 RefreshToken이나 SessionId 등 처리 필요
        return true;
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return false;
    }
};

/**
 * 인증 헤더를 포함한 fetch 요청
 * @param {string} endpoind - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @param {boolean} requireAuth - 인증 필요 여부
 */
export const fetchWithAuth = async (endpoind, options = {}, requireAuth = true) => {
    const url = endpoind.startsWith("http") ? endpoind : `${apiBaseUrl}${endpoind}`;

    const fetchOptions = {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        }
    };

    if (requireAuth) {
        if (isTokenExpiringSoon()) {
            const refreshed = await refreshAccessToken();

            // 토큰 갱신 실패시 로그아웃 처리
            if (!refreshed) {
                // 토큰 만료 처리 및 로그인 페이지로 리다이렉트
                authService.handleTokenExpiration();
                throw new Error("Failed to refresh access token");
            }
        }

        // 요청에 최신 토큰을 추가
        const accessToken = getCookie("accessToken");
        if (accessToken) {
            fetchOptions.headers["Authorization"] = `Bearer ${accessToken}`;
        }
    }

    try {
        const response = await fetch(url, fetchOptions);

        // 401 Unauthorized 응답 처리
        if (response.status === 401) {
            // 토큰 갱신 시도
            const refreshed = await refreshAccessToken();

            if (refreshed) {
                // 갱신을 성공하면 요청 재시도
                const accessToken = getCookie("accessToken");
                fetchOptions.headers["Authorization"] = `Bearer ${accessToken}`;
                return fetch(url, fetchOptions); // 재귀 호출의 문제 방지로 일반 fetch로 사용
            } else {
                // 갱신 실패시 로그아웃 처리
                authService.handleTokenExpiration();
                throw new Error("Failed to refresh access token");
            }
        }

        // 다른 오류 처리 위치
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

//////////////////////////////////////////
// API 메서드별 헬퍼 함수
//////////////////////////////////////////

export const api = {
    /**
     * GET 요청
     * @param {string} endpoint - API 엔드포인트
     * @param {boolean} requireAuth - 인증 필요 여부
     * @returns {Promise}
     */
    get: (endpoint, requireAuth = true) => {
        return fetchWithAuth(endpoint, { method: "GET" }, requireAuth);
    },

    /**
     * POST 요청
     * @param {string} endpoint - API 엔드포인트
     * @param {Object} options - 요청 데이터 / 헤더의 경우 { headers: { "Content-Type": "application/json" } } 형식으로 전달
     * @param {boolean} requireAuth - 인증 필요 여부
     * @returns {Promise}
     */
    post: (endpoint, options, requireAuth = true) => {
        return fetchWithAuth(endpoint, {
            ...options,
            method: "POST"
        }, requireAuth);
    },

    /**
     * PUT 요청
     * @param {string} endpoint - API 엔드포인트
     * @param {Object} options - 요청 데이터 / 헤더의 경우 { headers: { "Content-Type": "application/json" } } 형식으로 전달
     * @param {boolean} requireAuth - 인증 필요 여부
     * @returns {Promise}
     */
    put: (endpoint, options, requireAuth = true) => {
        return fetchWithAuth(endpoint, {
            ...options,
            method: "PUT"
        }, requireAuth);
    },

    /**
     * DELETE 요청 (반드시 인증 필요)
     * @param {string} endpoint - API 엔드포인트
     * @param {Object} options - 요청 데이터 / 헤더의 경우 { headers: { "Content-Type": "application/json" } } 형식으로 전달
     * @returns {Promise}
     */
    delete: (endpoint, options) => {
        return fetchWithAuth(endpoint, {
            ...options,
            method: "DELETE"
        });
    }
}

//////////////////////////////////////////
// 인증 관련 API 함수 추가
//////////////////////////////////////////

/**
 * S1 인증 기반 로그인 API 호출
 * @param {string} id
 * @param {string} password
 * @param {boolean} rememberMe
 * @returns {Promise} 로그인 결과 데이터
 */
export async function S1LoginApi(id, password, rememberMe = false) {
    const response = await fetch(`${apiBaseUrl}/Login/S1Auth/Login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password, rememberMe })
    });
    return response.json();
}

/**
 * 로그아웃 API 호출
 * @param {string} sessionId
 * @param {string} refreshToken
 * @returns {Promise} 로그아웃 응답
 */
export async function LogoutApi(sessionId, refreshToken) {
    const response = await fetch(`${apiBaseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, refreshToken })
    });
    return response;
}