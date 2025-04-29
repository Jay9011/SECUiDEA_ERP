import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldHalf, Lock, User } from 'lucide-react';

import { AuthProvider } from '../utils/authProviders';
import './Login.scss';

const Login = () => {
    const { loginWithProvider, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const sessionExpired = searchParams.get('expired') === 'true';

    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isGuestMode, setIsGuestMode] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 인증 상태 체크 - 인증되어 있으면 홈으로 리다이렉트
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // 로그인 처리
    const handleLogin = async (e) => {
        e.preventDefault();

        if (!id || !password) {
            setError('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const provider = isGuestMode ? AuthProvider.S1_GUEST : AuthProvider.S1;

            if (isGuestMode) {
                // 게스트 모드일 때, 휴대전화 번호가 들어오면 뒤에서 8자리만 사용
                await loginWithProvider(provider, id, password.slice(-8));
            }
            else {
                await loginWithProvider(provider, id, password, rememberMe);
            }
        } catch (err) {
            setError(err.message || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
        } finally {
            setLoading(false);
        }
    };

    // 게스트 모드 토글
    const toggleGuestMode = () => {
        setIsGuestMode(!isGuestMode);
        setId('');
        setPassword('');
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-box">
                    <div className="login-logo">
                        <ShieldHalf size={40} />
                    </div>
                    <h2>방문 예약 시스템</h2>
                    <p className="login-subtitle">계정에 로그인하세요</p>

                    {sessionExpired && (
                        <div className="session-expired-alert">
                            세션이 만료되었습니다. 다시 로그인해주세요.
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}


                    <div className="guest-mode-toggle">
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={isGuestMode}
                                onChange={toggleGuestMode}
                                disabled={loading}
                            />
                            <span className="slider round"></span>
                        </label>
                        <span className="guest-mode-label">게스트 로그인</span>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="form-group">
                            <div className="input-icon">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                id="id"
                                value={id}
                                onChange={(e) => setId(e.target.value)}
                                placeholder={isGuestMode ? "이름을 입력하세요" : "아이디를 입력하세요"}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <div className="input-icon">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={isGuestMode ? "휴대전화번호를 입력하세요" : "비밀번호를 입력하세요"}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-options" style={{ display: "none" }}>
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={loading}
                                />
                                <span>로그인 상태 유지</span>
                            </label>
                            <a href="#" className="forgot-password">비밀번호 찾기</a>
                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? '로그인 중...' : '로그인'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login; 