import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

import './Navigation.scss';

import Logo from '../../assets/images/Logo.svg';

const Navigation = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [activeLink, setActiveLink] = useState('');

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location]);

    // 로그아웃 처리 함수
    const handleLogout = async () => {
        try {
            await logout();
            onClose(); // 로그아웃 후 네비게이션 닫기
        } catch (error) {
            console.error("로그아웃 처리 중 오류 발생:", error);
        }
    };

    // 사용자 권한에 따른 메뉴 필터링 (예시)
    const getMenuItems = () => {
        const baseMenu = [
            { path: '/', label: '홈' },
            { path: '/visit-reservation', label: '방문 예약' },
            { path: '/visit-history', label: '방문 내역' },
        ];

        // 관리자인 경우 추가 메뉴
        if (user && user.role === 'admin') {
            baseMenu.push(
                { path: '/admin/dashboard', label: '관리자 대시보드' },
                { path: '/admin/users', label: '사용자 관리' }
            );
        }

        return baseMenu;
    };

    const menuItems = getMenuItems();

    return (
        <>
            <nav className={`navigation ${isOpen ? 'open' : ''}`}>
                <div className="navigation_container">
                    <button className="navigation_close" onClick={onClose}>
                        &times;
                    </button>

                    <div className="navigation_logo">
                        <Link to="/" onClick={onClose}>
                            <img src={Logo} alt="Logo" />
                            <span>방문 예약 시스템</span>
                        </Link>
                    </div>

                    <div className="navigation_auth">
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="navigation_auth-logout">
                                로그아웃
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="btn btn-block btn-secondary btn-animated"
                                onClick={onClose}>
                                로그인
                            </Link>
                        )}
                    </div>

                    <ul className="navigation_menu">
                        {menuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={activeLink === item.path ? 'active' : ''}
                                    onClick={onClose}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {user && (
                        <div className="navigation_user">
                            <div className="user-info">
                                <div className="avatar">
                                    {user.userName ? user.userName.charAt(0) : user.id.charAt(0)}
                                </div>
                                <div className="user-details">
                                    <span className="name">{user.userName || user.id}</span>
                                    <span className="role">{user.userRole || user.role || '일반 사용자'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* 모바일 네비게이션 오버레이 */}
            <div
                className={`navigation-overlay ${isOpen ? 'active' : ''}`}
                onClick={onClose}
            ></div>
        </>
    );
};

export default Navigation; 