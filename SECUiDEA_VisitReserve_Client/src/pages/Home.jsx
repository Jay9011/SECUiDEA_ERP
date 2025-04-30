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
            title: "방문 일정 등록",
            description: "방문 일정과 방문자 정보를 온라인으로 간편하게 등록하세요.",
            step: 1
        },
        {
            icon: <CheckCircle size={32} />,
            title: "관리자 승인",
            description: "담당자가 방문 신청을 검토하고 신속하게 승인합니다.",
            step: 2
        },
        {
            icon: <User size={32} />,
            title: "방문 완료",
            description: "승인된 방문자는 정해진 시간에 방문하여 출입 절차를 진행합니다.",
            step: 3
        }
    ];

    return (
        <div className="home">
            <section className="hero-section section">
                <div className="container container-xl text-center">
                    <div className="content-wrapper">
                        <div className="hero-section_content">
                            <h1>방문 예약 시스템</h1>
                            <p className="hero-section_subtitle">
                                빠르고 편리한 방문 예약 시스템
                            </p>
                            <div className="hero-section_actions flex flex-gap-md flex-mobile-col">
                                <Link to="/visitReserve/privacyAgreement" className="btn btn-square-desktop btn-secondary btn-lg btn-icon btn-rounded-desktop-xs">
                                    <Calendar />
                                    방문 신청하기
                                </Link>
                                <Link to="/visitReserve/visitList" className="btn btn-square-desktop btn-outline btn-secondary btn-lg btn-icon btn-rounded-desktop-xs text-white">
                                    <FileText />
                                    방문 내역 보기
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="process-section section section-light">
                <div className="container container-xl">
                    <div className="section-header text-center">
                        <h2>간편한 3단계 방문신청</h2>
                        <p className="section-subtitle">빠르고 쉬운 방문 신청 절차</p>
                    </div>

                    <ProcessSteps steps={processSteps} className="mb-lg" />

                    <div className="text-center mt-lg">
                        <Link to="/help" className="process-section_link">
                            방문 절차 자세히 알아보기
                            <ChevronRight size={16} />
                        </Link>
                    </div>

                </div>
            </section>

            <section className="cta-section section section-primary">
                <div className="container container-xl text-center">
                    <div className="content-wrapper">
                        <h2>지금 바로 방문 예약을 시작하세요!</h2>
                        <p className="cta-section_subtitle">
                            빠르고 쉬운 방문 신청 절차를 따라 예약하세요.
                        </p>
                        <div className="flex flex-center flex-gap-md flex-mobile-col mt-lg">
                            <Link to="/visitReserve/privacyAgreement" className="btn btn-outline btn-lg">
                                방문 신청하기
                            </Link>
                            <Link to="/help" className="btn btn-light btn-lg">
                                자세히 알아보기
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;