import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from 'react-i18next';

// 스타일
import './AuthSection.scss';

const AuthSection = ({ onClose }) => {
    const { isAuthenticated, user, logout } = useAuth();
    const { t } = useTranslation('visit');

    // 로그아웃 처리 함수
    const handleLogout = async () => {
        try {
            await logout();
            onClose(); // 로그아웃 후 네비게이션 닫기
        } catch (error) {
            console.error(t('components.authSection.logoutError'), error);
        }
    };

    return (
        <div className="auth-section">
            {isAuthenticated ? (
                <div className="user-container">
                    <div className="user-info">
                        <div className="avatar">
                            {user.name ? user.name.charAt(0) : user.id.charAt(0)}
                        </div>
                        <div className="user-details">
                            <span className="name">
                                {user?.name || user?.email}
                            </span>
                            <span className="role">
                                {user.role || '일반 사용자'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="logout-btn">
                        {t('components.authSection.logout')}
                    </button>
                </div>
            ) : (
                <Link
                    to="/login"
                    className="btn btn-block btn-secondary btn-animated"
                    onClick={onClose}>
                    {t('components.authSection.login')}
                </Link>
            )}
        </div>
    );
};

export default AuthSection; 