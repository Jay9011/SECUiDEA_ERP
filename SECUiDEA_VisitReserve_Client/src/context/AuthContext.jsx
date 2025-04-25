import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { parseJwt } from '../utils/jwt';
import { refreshAccessToken } from '../utils/api';
import authService from '../utils/authService';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [lastUsedProvider, setLastUsedProvider] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const apiUrl = useMemo(() => import.meta.env.VITE_API_URL, []);

    // 쿠키 및 상태 초기화 함수
    const clearAuthState = useCallback(() => {
        // 쿠키에서 인증 정보 삭제
        authService.clearAuthCookies();

        // 상태 초기화
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    /**
     * 사용자 정보를 설정하는 통합 함수
     * @param {Object} tokenData - 토큰 데이터 또는 디코딩된 토큰 데이터
     * @param {Object} options - 추가 옵션
     * @param {string} options.provider - 사용한 인증 프로바이더
     * @param {string} options.userId - 사용자 ID (토큰에 없는 경우)
     */
    const updateUserState = useCallback((tokenData, options = {}) => {
        if (!tokenData) {
            clearAuthState();
            return;
        }

        // 사용자 정보 설정
        setUser({
            id: tokenData.nameid || tokenData.id || options.userId,
            role: tokenData.role,
            name: tokenData.name,
            // 추가 정보를 추출
            ...(tokenData.permissions && {
                permissions:
                    typeof tokenData.permissions === 'string'
                        ? JSON.parse(tokenData.permissions)
                        : tokenData.permissions
            })
        });

        // 인증 상태 설정
        setIsAuthenticated(true);

        // 프로바이더 정보 저장
        if (options.provider) {
            setLastUsedProvider(options.provider);
            localStorage.setItem('authProvider', options.provider);
        } else if (!lastUsedProvider) {
            // 저장된 프로바이더 복원
            const savedProvider = localStorage.getItem('authProvider');
            if (savedProvider) {
                setLastUsedProvider(savedProvider);
            }
        }
    }, [clearAuthState, lastUsedProvider]);

    // 토큰 유효성 검사 함수
    const validateTokens = useCallback(async () => {
        // 리프레시 토큰이 있다면, 유효시간을 검사하고 만료되었다면 로그아웃 처리
        const refreshToken = authService.getRefreshToken();
        if (!refreshToken) {
            // 리프레시 토큰이 없다면 로그아웃 처리
            clearAuthState();
            return false;
        }

        const refreshTokenExpiryDate = authService.getRefreshTokenExpiryDate();
        if (refreshTokenExpiryDate && refreshTokenExpiryDate < Date.now()) {
            // 리프레시 토큰이 만료되었다면 로그아웃 처리 및 세션 만료 상태 설정
            console.log('리프레시 토큰 만료됨:', new Date(refreshTokenExpiryDate).toLocaleString(), '현재 시간:', new Date(Date.now()).toLocaleString());
            clearAuthState();
            setSessionExpired(true);
            return false;
        }

        // 리프레시 토큰이 유효하다면, 액세스 토큰을 가져오고 유효시간을 검사
        const accessToken = authService.getAccessToken();
        if (accessToken) {
            const accessTokenExpiryDate = authService.getAccessTokenExpiryDate();
            if (accessTokenExpiryDate && accessTokenExpiryDate < Date.now()) {
                // 액세스 토큰이 만료되었다면, 리프레시 토큰을 사용하여 새로운 액세스 토큰 가져오기를 시도
                console.log('액세스 토큰 만료됨:', new Date(accessTokenExpiryDate).toLocaleString(), '현재 시간:', new Date(Date.now()).toLocaleString());
                if (!await refreshAccessToken()) {
                    clearAuthState();
                    return false;
                }
            }
        }

        // 액세스 토큰이 유효하다면, 사용자 정보를 가져오고 인증 헤더를 설정
        const token = authService.getAccessToken();
        if (token) {
            const decodedToken = parseJwt(token);
            updateUserState(decodedToken);
            return true;
        }

        return false;
    }, [clearAuthState, updateUserState]);

    // 최초 로드 시 토큰 확인하여 사용자 상태 설정
    useEffect(() => {
        const initializeAuth = async () => {
            await validateTokens();
            setLoading(false);
        };

        initializeAuth();
    }, [validateTokens]);

    // 페이지 이동 시 토큰 유효성 검사
    useEffect(() => {
        if (!loading) {
            validateTokens();
        }
    }, [location.pathname, validateTokens, loading]);

    // 세션 만료 시 로그인 페이지로 리다이렉트
    useEffect(() => {
        if (sessionExpired && !loading) {
            // 현재 로그인 페이지가 아닌 경우에만 리다이렉트
            if (location.pathname !== '/login') {
                // 세션 만료 메시지를 query parameter로 전달
                navigate('/login?expired=true', { replace: true });
                // 메시지 상태 초기화
                setSessionExpired(false);
            }
        }
    }, [sessionExpired, loading, navigate, location.pathname]);

    const handleBeforeUnload = useCallback(() => {
        if (isAuthenticated) {
            // 비컨 API로 로그아웃 요청 (비동기 요청이 완료되지 않아도 브라우저가 닫힘)
            const sessionId = authService.getSessionId();
            const refreshToken = authService.getRefreshToken();

            if (sessionId && refreshToken) {
                authService.sendBeaconLogout(apiUrl, sessionId, refreshToken);
            }
        }
    }, [isAuthenticated, apiUrl]);

    // 브라우저 닫기 이벤트에 로그아웃 함수 연결
    useEffect(() => {
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [handleBeforeUnload]);

    /**
     * 프로바이더 기반 로그인 처리
     * @param {string} provider - 인증 프로바이더
     * @param {string} id - 사용자 ID
     * @param {string} password - 사용자 비밀번호
     * @param {boolean} rememberMe - 로그인 유지 여부
     */
    const loginWithProvider = useCallback(async (provider, id, password, rememberMe = false) => {
        try {
            const data = await authService.login(provider, id, password, rememberMe);
            if (data.isSuccess) {
                const tokenResponse = data.data.token;
                authService.setAuthCookies(tokenResponse);

                // 통합 함수로 사용자 상태 업데이트
                updateUserState(tokenResponse, { provider, userId: id });
            } else {
                throw new Error(data.message || '로그인에 실패했습니다.');
            }
        } catch (error) {
            console.error('로그인 처리 중 오류 발생:', error);
            throw error;
        }
    }, [updateUserState]);

    const logout = useCallback(async () => {
        try {
            const sessionId = authService.getSessionId();
            const refreshToken = authService.getRefreshToken();

            // 백엔드에 로그아웃 요청 보내기
            if (sessionId && refreshToken) {
                const response = await authService.logout(sessionId, refreshToken);
                if (!response.ok) {
                    throw new Error('로그아웃 처리 중 오류가 발생했습니다.');
                }
            }
        } catch (error) {
            console.error('서버 로그아웃 처리 중 오류 발생:', error);
        } finally {
            clearAuthState();
        }
    }, [clearAuthState]);

    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated,
        sessionExpired,
        loginWithProvider,
        logout,
        lastUsedProvider
    }), [user, loading, isAuthenticated, sessionExpired, loginWithProvider, logout, lastUsedProvider]);

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);