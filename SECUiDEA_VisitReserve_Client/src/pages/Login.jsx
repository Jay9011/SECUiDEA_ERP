import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldHalf, Lock, User } from 'lucide-react';

import { AuthProvider } from '../utils/authProviders';
import './Login.scss';

const Login = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const { loginWithProvider } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await loginWithProvider(AuthProvider.S1, userId, password, rememberMe);
            navigate('/');
        } catch (err) {
            setError(err.message || '로그인에 실패했습니다.');
            console.error('로그인 오류:', err);
        } finally {
            setLoading(false);
        }
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

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <div className="input-icon">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="사용자 ID"
                                required
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
                                placeholder="비밀번호"
                                required
                            />
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>자동 로그인</span>
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