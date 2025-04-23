import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";

// 컴포넌트
import AuthSection from "./AuthSection";
import LogoComponent from "./Logo";

// 스타일
import './Navigation.scss';

// 개별 메뉴 아이템 컴포넌트
const MenuItem = React.memo(({ item, isActive, onClick }) => (
    <li>
        <Link
            to={item.path}
            className={isActive ? 'active' : ''}
            onClick={onClick}
        >
            {item.label}
        </Link>
    </li>
));

const Navigation = React.memo(({ isOpen, onClose }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [activeLink, setActiveLink] = useState('');

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location]);

    // 사용자 권한에 따른 메뉴 필터링
    const menuItems = useMemo(() => {
        const baseMenu = [
            { path: '/', label: '홈' },
            { path: '/visit-reservation', label: '방문 예약' },
            { path: '/visit-history', label: '방문 내역' },
        ];

        // 관리자인 경우 추가 메뉴
        if (user && user.role === 'admin') {
            return [
                ...baseMenu,
                { path: '/admin/dashboard', label: '관리자 대시보드' },
                { path: '/admin/users', label: '사용자 관리' }
            ];
        }

        return baseMenu;
    }, [user]);

    return (
        <>
            <nav className={`navigation ${isOpen ? 'open' : ''}`}>
                <div className="navigation_container">
                    <button className="navigation_close" onClick={onClose}>
                        &times;
                    </button>

                    <LogoComponent
                        className="navigation_logo"
                        onClick={onClose}
                        textComponent="span"
                        textContent="방문 예약 시스템"
                    />

                    <div className="navigation_auth">
                        <AuthSection onClose={onClose} />
                    </div>

                    <ul className="navigation_menu">
                        {menuItems.map((item) => (
                            <MenuItem
                                key={item.path}
                                item={item}
                                isActive={activeLink === item.path}
                                onClick={onClose}
                            />
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
});

export default React.memo(Navigation); 