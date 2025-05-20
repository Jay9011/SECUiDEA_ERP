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
    const { t } = useTranslation('visit');

    const processSteps = [
        {
            icon: <Calendar size={32} />,
            title: t('home.process.step1.title'),
            description: t('home.process.step1.description'),
            step: 1
        },
        {
            icon: <CheckCircle size={32} />,
            title: t('home.process.step2.title'),
            description: t('home.process.step2.description'),
            step: 2
        },
        {
            icon: <User size={32} />,
            title: t('home.process.step3.title'),
            description: t('home.process.step3.description'),
            step: 3
        }
    ];

    return (
        <div className="home">
            <section className="hero-section section">
                <div className="container container-xl text-center">
                    <div className="content-wrapper">
                        <div className="hero-section_content">
                            <h1>{t('home.title')}</h1>
                            <p className="hero-section_subtitle">
                                {t('home.subtitle')}
                            </p>
                            <div className="hero-section_actions flex flex-gap-md flex-mobile-col">
                                <Link to="/visitReserve/privacyAgreement" className="btn btn-square-desktop btn-secondary btn-lg btn-icon btn-rounded-desktop-xs">
                                    <Calendar />
                                    {t('home.applyVisit')}
                                </Link>
                                <Link to="/visitReserve/visitList" className="btn btn-square-desktop btn-outline btn-secondary btn-lg btn-icon btn-rounded-desktop-xs text-white">
                                    <FileText />
                                    {t('home.viewVisitHistory')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="process-section section section-light">
                <div className="container container-xl">
                    <div className="section-header text-center">
                        <h2>{t('home.process.title')}</h2>
                        <p className="section-subtitle">{t('home.process.subtitle')}</p>
                    </div>

                    <ProcessSteps steps={processSteps} className="mb-lg" />

                </div>
            </section>

            <section className="cta-section section section-primary">
                <div className="container container-xl text-center">
                    <div className="content-wrapper">
                        <h2>{t('home.cta.title')}</h2>
                        <p className="cta-section_subtitle">
                            {t('home.cta.subtitle')}
                        </p>
                        <div className="flex flex-center flex-gap-md flex-mobile-col mt-lg">
                            <Link to="/visitReserve/privacyAgreement" className="btn btn-outline btn-lg">
                                {t('home.cta.applyVisit')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;