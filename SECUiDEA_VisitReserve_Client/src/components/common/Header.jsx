import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import './Header.scss';

import Logo from '../../assets/images/Logo.svg';

const Header = ({ onToggleNav }) => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("로그아웃 처리 중 오류 발생:", error);
        }
    };

    return (
        <header className="header">
            <div className="header_container">
                <button className="header_menu-toggle" onClick={onToggleNav}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div className="header_logo">
                    <Link to="/">
                        <img src={Logo} alt="Logo" />
                        <h1>방문 예약 시스템</h1>
                    </Link>
                </div>

                <div className="header_actions">
                    {user ? (
                        <>
                            <div className="user-info">
                                <div className="avatar">
                                    {user.userName ? user.userName.charAt(0) : user.id.charAt(0)}
                                </div>
                                <span className="name">{user.userName || user.id}</span>
                            </div>
                            <button onClick={handleLogout} className="logout-btn">
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="login-btn">로그인</Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
