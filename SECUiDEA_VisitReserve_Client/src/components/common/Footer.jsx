import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation('visit');

    return (
        <footer className="footer">
            <div className="footer_container">
                <div className="footer_content">
                    <div className="footer_info">
                        <h3>{t('components.footer.title')}</h3>
                        <p>{t('components.footer.description')}</p>
                    </div>

                    <div className="footer_links">
                        <h4>{t('components.footer.shortcuts')}</h4>
                        <ul>
                            <li><Link to="/">{t('navigation.menu.home')}</Link></li>
                            <li><Link to="/visitReserve/privacyAgreement">{t('navigation.menu.reservation')}</Link></li>
                        </ul>
                    </div>

                    <div className="footer_links">
                        <h4>{t('components.footer.resources')}</h4>
                        <ul>
                            <li><Link to="/privacy">{t('components.footer.privacy')}</Link></li>
                            <li><Link to="/about">{t('about.title')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer_bottom">
                    <div className="footer_bottom-copyright">
                        &copy; {new Date().getFullYear()} SECUiDEA. {t('components.footer.allRightsReserved')}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
