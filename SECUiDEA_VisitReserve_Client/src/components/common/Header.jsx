import { useTranslation } from 'react-i18next';
import LogoComponent from "./Logo";

// 스타일
import './Header.scss';

const Header = ({ onToggleNav }) => {
    const { t } = useTranslation('visit');

    return (
        <header className="header">
            <div className="header_container">
                <div className="header_left">
                    <button className="header_menu-toggle" onClick={onToggleNav}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>

                <div className="header_center">
                    <LogoComponent
                        className="header_logo"
                        textComponent="h1"
                        textContent={t('navigation.systemTitle')}
                    />
                </div>

                <div className="header_right">

                </div>
            </div>
        </header>
    );
};

export default Header;
