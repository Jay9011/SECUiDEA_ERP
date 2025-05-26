import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldHalf, Lock, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AuthProvider } from '../utils/authProviders';
import './Login.scss';

const Login = () => {
    const { loginWithProvider, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const sessionExpired = searchParams.get('expired') === 'true';
    const { t } = useTranslation('visit');

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
            setError(t('login.error.emptyFields'));
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
            setError(err.message || t('login.error.loginFailed'));
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
                    <h2>{t('login.title')}</h2>
                    <p className="login-subtitle">{t('login.subtitle')}</p>

                    {sessionExpired && (
                        <div className="session-expired-alert">
                            {t('login.sessionExpired')}
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
                        <span className="guest-mode-label">{t('login.guestMode')}</span>
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
                                placeholder={isGuestMode ? t('login.userName') : t('login.userId')}
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
                                placeholder={isGuestMode ? t('login.phoneNumber') : t('login.password')}
                                disabled={loading}
                            />
                        </div>

                        <div className="form-options">
                            <label className="remember-me" style={{ display: "none" }}>
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={loading}
                                />
                                <span>{t('login.rememberMe')}</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-password">{t('login.forgotPassword')}</Link>
                        </div>

                        <button
                            type="submit"
                            className="login-btn"
                            disabled={loading}
                        >
                            {loading ? t('login.loggingIn') : t('login.loginButton')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login; 