import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from 'react-i18next';

// 컴포넌트
import AuthSection from "./AuthSection";
import LogoComponent from "./Logo";
import LanguageSwitcher from "../LanguageSwitcher";

// 스타일
import './Navigation.scss';

// 개별 메뉴 아이템 컴포넌트
const MenuItem = ({ item, isActive, onClick }) => (
    <li>
        <Link
            to={item.path}
            className={isActive ? 'active' : ''}
            onClick={onClick}
        >
            {item.label}
        </Link>
    </li>
);

const Navigation = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const location = useLocation();
    const [activeLink, setActiveLink] = useState('');
    const { t } = useTranslation('visit');

    useEffect(() => {
        setActiveLink(location.pathname);
    }, [location]);

    // 사용자 권한에 따른 메뉴 필터링
    const menuItems = useMemo(() => {
        let baseMenu = [
            { path: '/', label: t('navigation.menu.home') },
            { path: '/visitReserve/privacyAgreement', label: t('navigation.menu.reservation') },
            { path: '/visitReserve/visitList', label: t('navigation.menu.visitStatus') },
        ];

        // Guest인 경우 추가 메뉴
        if (user && user.role === 'Guest') {
            return [
                ...baseMenu,
                { path: '/education', label: t('navigation.menu.education') }
            ];
        }

        // Employee인 경우
        if (user && user.role === 'Employee') {
            // 제거할 메뉴들
            baseMenu = baseMenu.filter(item => item.path !== '/visitReserve/privacyAgreement');
            return [
                ...baseMenu
            ];
        }

        // 관리자인 경우 추가 메뉴
        if (user && user.role === 'Admin') {
            return [
                ...baseMenu,
                { path: '/admin/dashboard', label: t('navigation.menu.adminDashboard') },
                { path: '/admin/users', label: t('navigation.menu.userManagement') }
            ];
        }

        return baseMenu;
    }, [user, t]);

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
                        textContent={t('navigation.systemTitle')}
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

                    <div className="navigation_language-section">
                        <LanguageSwitcher />
                    </div>
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