import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
    return (
        <div className="auth-layout">
            <div className="auth-layout__container">
                <div className="auth-layout__logo">
                    <h1>방문 예약 시스템</h1>
                    <p>안전하고 효율적인 방문 관리를 위한 서비스</p>
                </div>
                {children}
                <div className="auth-layout__footer">
                    <div className="auth-layout__links">
                        <Link to="/terms">이용약관</Link>
                        <span className="separator">|</span>
                        <Link to="/privacy">개인정보처리방침</Link>
                        <span className="separator">|</span>
                        <Link to="/help">도움말</Link>
                    </div>
                    <div className="auth-layout__copyright">
                        &copy; {new Date().getFullYear()} 방문 예약 시스템
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout; 