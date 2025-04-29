import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// 스타일
import './AuthSection.scss';

const AuthSection = ({ onClose }) => {
    const { user, logout } = useAuth();

    // 로그아웃 처리 함수
    const handleLogout = async () => {
        try {
            await logout();
            onClose(); // 로그아웃 후 네비게이션 닫기
        } catch (error) {
            console.error("로그아웃 처리 중 오류 발생:", error);
        }
    };

    return (
        <div className="auth-section">
            {user ? (
                <div className="user-container">
                    <div className="user-info">
                        <div className="avatar">
                            {user.name ? user.name.charAt(0) : user.id.charAt(0)}
                        </div>
                        <div className="user-details">
                            <span className="name">{user.name || user.id}</span>
                            <span className="role">{user.role || '일반 사용자'}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="logout-btn">
                        로그아웃
                    </button>
                </div>
            ) : (
                <Link
                    to="/login"
                    className="btn btn-block btn-secondary btn-animated"
                    onClick={onClose}>
                    로그인
                </Link>
            )}
        </div>
    );
};

export default AuthSection; 