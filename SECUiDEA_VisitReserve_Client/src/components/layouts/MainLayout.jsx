import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    // 메뉴 아이템 정의
    const menuItems = [
        { path: '/', label: '홈' },
        { path: '/visit-reservation', label: '방문 신청' },
        { path: '/visit-approval', label: '방문 승인', requiresAuth: true },
        { path: '/visitor-history', label: '방문 이력', requiresAuth: true },
    ];

    // 경로에 따라 활성화된 메뉴 항목 확인
    const isActive = (path) => location.pathname === path;

    // 로그아웃 처리
    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('로그아웃 처리 중 오류 발생:', error);
        }
    };

    // 유저 아바타에 표시할 이니셜 생성
    const getUserInitials = () => {
        if (!user) return '?';
        return (user.userName || user.id || '?').charAt(0).toUpperCase();
    };

    // 모바일 메뉴 토글
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // 메뉴 항목 필터링 (인증 필요 여부에 따라)
    const filteredMenuItems = menuItems.filter(item => {
        if (item.requiresAuth) {
            return user !== null;
        }
        return true;
    });

    return (
        <div className="layout">
            {/* 헤더 */}
            <header className="header">
                <div className="header__container">
                    <div className="header__logo">
                        <Link to="/">
                            <h1>방문 예약 시스템</h1>
                        </Link>
                    </div>

                    <nav className="header__nav">
                        <ul>
                            {filteredMenuItems.map((item) => (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={isActive(item.path) ? 'active' : ''}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="header__actions">
                        {user ? (
                            <>
                                <div className="user-info">
                                    <div className="avatar">{getUserInitials()}</div>
                                    <span className="name">{user.userName || user.id}</span>
                                </div>
                                <button
                                    className="logout-btn"
                                    onClick={handleLogout}
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="login-btn">
                                로그인
                            </Link>
                        )}
                    </div>

                    <button
                        className="header__mobile-toggle"
                        onClick={toggleMobileMenu}
                        aria-label="메뉴 열기"
                    >
                        ☰
                    </button>
                </div>
            </header>

            {/* 모바일 메뉴 */}
            <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-nav__container">
                    <button
                        className="mobile-nav__close"
                        onClick={toggleMobileMenu}
                        aria-label="메뉴 닫기"
                    >
                        ✕
                    </button>

                    <nav className="mobile-nav__menu">
                        {filteredMenuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={isActive(item.path) ? 'active' : ''}
                                onClick={toggleMobileMenu}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mobile-nav__bottom">
                        {user ? (
                            <>
                                <div className="user-info">
                                    <div className="avatar">{getUserInitials()}</div>
                                    <span className="name">{user.userName || user.id}</span>
                                </div>
                                <button
                                    className="logout-btn"
                                    onClick={() => {
                                        handleLogout();
                                        toggleMobileMenu();
                                    }}
                                >
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="login-btn"
                                onClick={toggleMobileMenu}
                            >
                                로그인
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* 메인 콘텐츠 */}
            <main className="layout__main">
                <div className="layout__container">
                    {children}
                </div>
            </main>

            {/* 푸터 */}
            <footer className="footer">
                <div className="footer__container">
                    <div className="footer__content">
                        <div className="footer__info">
                            <h3>방문 예약 시스템</h3>
                            <p>외부인 방문 신청 및 승인을 위한 통합 관리 시스템입니다.</p>
                            <div className="footer__info-contact">
                                <div className="contact-item">
                                    <i>📱</i> 고객지원: 02-123-4567
                                </div>
                                <div className="contact-item">
                                    <i>✉️</i> 이메일: support@visitreserve.com
                                </div>
                            </div>
                        </div>

                        <div className="footer__links">
                            <h4>바로가기</h4>
                            <ul>
                                <li><Link to="/">홈</Link></li>
                                <li><Link to="/visit-reservation">방문 신청</Link></li>
                                <li><Link to="/faq">자주 묻는 질문</Link></li>
                                <li><Link to="/terms">이용약관</Link></li>
                            </ul>
                        </div>

                        <div className="footer__links">
                            <h4>리소스</h4>
                            <ul>
                                <li><Link to="/help">도움말</Link></li>
                                <li><Link to="/privacy">개인정보처리방침</Link></li>
                                <li><Link to="/contact">문의하기</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="footer__bottom">
                        <div className="footer__bottom-copyright">
                            &copy; {new Date().getFullYear()} 방문 예약 시스템. All rights reserved.
                        </div>
                        <div className="footer__bottom-social">
                            <a href="#" aria-label="페이스북">f</a>
                            <a href="#" aria-label="인스타그램">i</a>
                            <a href="#" aria-label="유튜브">y</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout; 