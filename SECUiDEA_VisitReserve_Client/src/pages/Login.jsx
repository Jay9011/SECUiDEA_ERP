import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/Auth/Login`, {
                userId,
                password
            });

            if (response.data.isSuccess) {
                // 토큰을 로컬 스토리지에 저장
                localStorage.setItem('token', response.data.data.token);
                localStorage.setItem('userInfo', JSON.stringify(response.data.data.userInfo));

                // 홈 페이지로 이동
                navigate('/');
            } else {
                setError(response.data.message || '로그인에 실패했습니다.');
            }
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || '로그인에 실패했습니다.');
            } else {
                setError('서버와 통신 중 오류가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>로그인</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="userId">사용자 ID</label>
                        <input
                            type="text"
                            id="userId"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? '로그인 중...' : '로그인'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login; 