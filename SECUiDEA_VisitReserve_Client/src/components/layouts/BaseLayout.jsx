import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';

import Header from '../common/Header';
import Navigation from '../common/Navigation';
import Footer from '../common/Footer';

import './BaseLayout.scss';

const BaseLayout = ({ className = '', children }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // 네비게이션 토글 핸들러
    const toggleMobileMenu = useCallback(() => {
        setMobileMenuOpen(prevState => !prevState);
    }, []);

    const closeMobileMenu = useCallback(() => {
        setMobileMenuOpen(false);
    }, []);

    return (
        <div className={`layout ${className}`}>
            {/* 추가 요소를 삽입할 위치 (예: BackgroundVideo) */}
            {children}

            {/* Header는 모바일에서만 사용 */}
            <div className="mobile-only">
                <Header onToggleNav={toggleMobileMenu} />
            </div>
            <Navigation isOpen={mobileMenuOpen} onClose={closeMobileMenu} />

            <main className="layout_main">
                <div className="layout_container">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BaseLayout; 