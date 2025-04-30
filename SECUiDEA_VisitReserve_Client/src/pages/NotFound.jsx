import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
    const { t } = useTranslation('visit');

    return (
        <div className="error-layout_content">
            <div className="error-layout_code">{t('notFound.code')}</div>
            <h1 className="error-layout_title">{t('notFound.title')}</h1>
            <p className="error-layout_text">
                {t('notFound.description')}
            </p>
            <div className="error-layout_actions">
                <Link to="/" className="btn-primary">
                    {t('notFound.actions.home')}
                </Link>
                <Link to="/help" className="btn-outline">
                    {t('notFound.actions.help')}
                </Link>
            </div>
        </div>
    );
};

export default NotFound; 