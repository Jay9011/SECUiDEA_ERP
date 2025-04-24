import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { parseJwt } from '../utils/jwt';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authHeader, setAuthHeader] = useState(null);

    const apiUrl = useMemo(() => import.meta.env.VITE_API_URL, []);

    // 쿠키에서 토큰 확인하여 사용자 상태 설정
    useEffect(() => {
        const token = getCookie('accessToken');
        if (token) {
            const decodedToken = parseJwt(token);
            setUser({
                id: decodedToken.nameid,
                role: decodedToken.role,
                // 추가 정보가 토큰에 포함되면 여기서 추출
                // userName: decodedToken.userName,
                // permissions: decodedToken.permissions ? JSON.parse(decodedToken.permissions) : []
            });
            setIsAuthenticated(true);

            // 인증 헤더 설정
            setAuthHeader({ 'Authorization': `Bearer ${token}` });
        }

        setLoading(false);
    }, []);

    // handleBeforeUnload 함수를 메모이제이션
    const handleBeforeUnload = useCallback(() => {
        if (isAuthenticated) {
            // 비컨 API로 로그아웃 요청 (비동기 요청이 완료되지 않아도 브라우저가 닫힘)
            const sessionId = getCookie('sessionId');
            const refreshToken = getCookie('refreshToken');

            if (sessionId && refreshToken) {
                const logoutUrl = `${apiUrl}/auth/logout`;
                navigator.sendBeacon(
                    logoutUrl,
                    JSON.stringify({
                        sessionId,
                        refreshToken
                    })
                );
            }
        }
    }, [isAuthenticated, apiUrl]);

    // 브라우저 닫기 이벤트에 로그아웃 함수 연결
    useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [handleBeforeUnload]);

    const login = useCallback((token, userInfo) => {
        // 세션 쿠키로 저장 (브라우저 닫히면 자동 삭제)
        setCookie('accessToken', token);
        setCookie('refreshToken', userInfo.refreshToken);
        setCookie('sessionId', userInfo.sessionId);

        // 사용자 상태 업데이트
        setUser(userInfo);
        setIsAuthenticated(true);
        setAuthHeader({ 'Authorization': `Bearer ${token}` });
    }, []);

    const logout = useCallback(async () => {
        try {
            const sessionId = getCookie('sessionId');
            const refreshToken = getCookie('refreshToken');

            // 백엔드에 로그아웃 요청 보내기
            if (sessionId && refreshToken) {
                const response = await fetch(`${apiUrl}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...authHeader
                    },
                    body: JSON.stringify({
                        sessionId,
                        refreshToken
                    })
                });

                if (!response.ok) {
                    throw new Error('로그아웃 처리 중 오류가 발생했습니다.');
                }
            }
        } catch (error) {
            console.error('서버 로그아웃 처리 중 오류 발생:', error);
        } finally {
            // 쿠키에서 토큰 및 세션 정보 제거
            deleteCookie('accessToken');
            deleteCookie('refreshToken');
            deleteCookie('sessionId');

            // 상태 초기화
            setUser(null);
            setIsAuthenticated(false);
            setAuthHeader(null);
        }
    }, [authHeader, apiUrl]);

    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        authHeader
    }), [user, loading, isAuthenticated, authHeader, login, logout]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);