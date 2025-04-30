import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import './About.scss';

const About = () => {
    const { t } = useTranslation('visit');

    return (
        <div className="about-page">
            <div className="about-page_header">
                <h1>{t('about.title')}</h1>
                <p>
                    {t('about.subtitle')}
                </p>
            </div>

            <section className="about-page_section">
                <h2>{t('about.introduction.title')}</h2>
                <p>
                    {t('about.introduction.description')}
                </p>
            </section>

            <section className="about-page_section licenses">
                <h2>{t('about.copyright.title')}</h2>

                <div className="license-item">
                    <h3>{t('about.copyright.lucide.title')}</h3>
                    <div className="license-text">
                        <p>
                            {t('about.copyright.lucide.license')}
                        </p>
                        <p>
                            {t('about.copyright.lucide.text.0')}
                        </p>
                        <p>
                            {t('about.copyright.lucide.text.1')}
                        </p>
                        <p>
                            {t('about.copyright.lucide.text.2')}
                        </p>
                    </div>
                </div>

                <div className="license-item">
                    <h3>{t('about.copyright.notoSansKr.title')}</h3>
                    <div className="license-text">
                        <p>
                            {t('about.copyright.notoSansKr.license')}
                        </p>
                        <p>
                            {t('about.copyright.notoSansKr.text')}
                        </p>
                    </div>
                </div>

                <div className="license-item">
                    <h3>{t('about.copyright.nanumFont.title')}</h3>
                    <div className="license-text">
                        <p>
                            {t('about.copyright.nanumFont.license')}
                        </p>
                        <p>
                            {t('about.copyright.nanumFont.text')}
                        </p>
                    </div>
                </div>
            </section>

            <div className="about-page_actions">
                <Link to="/" className="btn btn-primary">{t('about.actions.home')}</Link>
            </div>
        </div>
    );
}

export default About;
