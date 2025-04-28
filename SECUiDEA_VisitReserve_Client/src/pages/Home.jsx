import { Link } from "react-router-dom";
import { Calendar, User, FileText, CheckCircle, ChevronRight, ShieldCheck } from "lucide-react"
import { useTranslation } from 'react-i18next';

// 컴포넌트
import { ProcessSteps } from "../components/steps/ProcessStep";

// 스타일
import '../styles/layouts/_container.scss';
import '../styles/layouts/_flex.scss';
import '../styles/layouts/_grid.scss';
import '../styles/components/_button.scss';
import '../styles/components/_card.scss';
import '../styles/components/_icon-circle.scss';
import './Home.scss';

const Home = () => {
    const { t } = useTranslation();

    const processSteps = [
        {
            icon: <Calendar size={32} />,
            title: t('reservation.form.submit'),
            description: t('reservation.message.success'),
            step: 1
        },
        {
            icon: <CheckCircle size={32} />,
            title: t('admin.title'),
            description: t('reservation.status.pending'),
            step: 2
        },
        {
            icon: <User size={32} />,
            title: t('reservation.form.visitor'),
            description: t('reservation.status.approved'),
            step: 3
        }
    ];

    return (
        <div className="home">
            <section className="hero-section section">
                <div className="container container-xl text-center">
                    <div className="content-wrapper">
                        <div className="hero-section_content">
                            <h1>{t('reservation.title')}</h1>
                            <p className="hero-section_subtitle">
                                {t('common.welcome')}
                            </p>
                            <div className="hero-section_actions flex flex-gap-md flex-mobile-col">
                                <Link to="/visitReserve/privacyAgreement" className="btn btn-square-desktop btn-secondary btn-lg btn-icon btn-rounded-desktop-xs">
                                    <Calendar />
                                    {t('reservation.form.submit')}
                                </Link>
                                <Link to="/visitReserve/visitList" className="btn btn-square-desktop btn-outline btn-secondary btn-lg btn-icon btn-rounded-desktop-xs text-white">
                                    <FileText />
                                    {t('admin.reservations')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="process-section section section-light">
                <div className="container container-xl">
                    <div className="section-header text-center">
                        <h2>{t('common.next')}</h2>
                        <p className="section-subtitle">{t('reservation.message.confirm')}</p>
                    </div>

                    <ProcessSteps steps={processSteps} className="mb-lg" />

                    <div className="text-center mt-lg">
                        <Link to="/help" className="process-section_link">
                            {t('common.more')}
                            <ChevronRight size={16} />
                        </Link>
                    </div>

                </div>
            </section>

            <section className="cta-section section section-primary">
                <div className="container container-xl text-center">
                    <div className="content-wrapper">
                        <h2>{t('common.submit')}</h2>
                        <p className="cta-section_subtitle">
                            {t('reservation.form.purpose')}
                        </p>
                        <div className="flex flex-center flex-gap-md flex-mobile-col mt-lg">
                            <Link to="/visitReserve/privacyAgreement" className="btn btn-outline btn-lg">
                                {t('reservation.form.submit')}
                            </Link>
                            <Link to="/help" className="btn btn-light btn-lg">
                                {t('common.more')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;