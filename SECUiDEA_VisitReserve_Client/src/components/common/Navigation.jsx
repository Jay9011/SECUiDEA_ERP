import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuth } from "../../context/AuthContext";

// 컴포넌트
import AuthSection from "./AuthSection";
// 스타일
import './Navigation.scss';
// 리소스
import Logo from '../../assets/images/Logo.svg';

const Navigation = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [activeLink, setActiveLink] = useState('');

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location]);

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
                        <AuthSection onClose={onClose} />
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