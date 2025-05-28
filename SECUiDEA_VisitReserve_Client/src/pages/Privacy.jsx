import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Shield } from "lucide-react";

import './Privacy.scss';

const Privacy = () => {
    const { t, i18n } = useTranslation('visit');
    const [htmlContent, setHtmlContent] = useState('');

    useEffect(() => {
        let htmlPath = t('visitReserve.privacyAgreement.privacyPolicy.fullContentPath');

        if (import.meta.env.DEV) {
            htmlPath = `${import.meta.env.BASE_URL}${htmlPath}`;
        }

        fetch(htmlPath)
            .then(res => res.text())
            .then(setHtmlContent)
            .catch(error => {
                console.error('개인정보 처리 방침 로드 오류:', error);
            });
    }, [i18n.language, t]);

    return (
        <div className="privacy-page">
            <div className="privacy-page_header">
                <h1>
                    <Shield size={24} />
                    {t('privacy.title')}
                </h1>
                <p>
                    {t('privacy.subtitle')}
                </p>
            </div>

            <section className="privacy-page_content">
                <div
                    className="privacy-policy-content"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
                {!htmlContent && (
                    <div className="loading-content">
                        {t('common.loading')}
                    </div>
                )}
            </section>

            <div className="privacy-page_actions">
                <Link to="/" className="btn btn-primary">{t('privacy.actions.home')}</Link>
                <Link to="/visitReserve/privacyAgreement" className="btn btn-outline">{t('privacy.actions.reservation')}</Link>
            </div>
        </div>
    );
}

export default Privacy; 