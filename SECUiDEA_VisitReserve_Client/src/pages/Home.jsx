import { Link } from "react-router-dom";
import { Calendar, User, FileText, CheckCircle, ChevronRight, ShieldCheck } from "lucide-react"
import { useTranslation } from 'react-i18next';
import { useState } from 'react';


import authService from '../utils/authService'

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

const apiBaseUrl = import.meta.env.VITE_BASE_API_URL;

const Home = () => {
    const { t } = useTranslation();
    const [apiResponse, setApiResponse] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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

    // Test API 호출 함수
    const callTestApi = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiBaseUrl}/Visit/Test`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getAccessToken()}` // JWT 토큰
                },
            });

            if (!response.ok) {
                throw new Error(`API 호출 실패: ${response.status}`);
            }

            const data = await response.json();
            setApiResponse(data);
            console.log('Test API 응답:', data);
        } catch (err) {
            setError(err.message);
            console.error('API 호출 중 오류 발생:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Employee 전용 API 호출 함수
    const callEmployeeVisitInfo = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiBaseUrl}/Visit/GetEmployeeVisitInfo`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getAccessToken()}` // JWT 토큰
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('인증되지 않은 사용자입니다.');
                } else if (response.status === 403) {
                    throw new Error('접근 권한이 없습니다. Employee 이상 권한이 필요합니다.');
                } else {
                    throw new Error(`API 호출 실패: ${response.status}`);
                }
            }

            const data = await response.json();
            setApiResponse(data);
            console.log('Employee API 응답:', data);
        } catch (err) {
            setError(err.message);
            console.error('API 호출 중 오류 발생:', err);
        } finally {
            setIsLoading(false);
        }
    };

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
                                <Link to="/visit-reservation" className="btn btn-square-desktop btn-secondary btn-lg btn-icon btn-rounded-desktop-xs">
                                    <Calendar />
                                    {t('reservation.form.submit')}
                                </Link>
                                <Link to="/visit-history" className="btn btn-square-desktop btn-outline btn-secondary btn-lg btn-icon btn-rounded-desktop-xs text-white">
                                    <FileText />
                                    {t('admin.reservations')}
                                </Link>
                                <button
                                    onClick={callEmployeeVisitInfo}
                                    className="btn btn-square-desktop btn-primary btn-lg btn-icon btn-rounded-desktop-xs"
                                    disabled={isLoading}
                                >
                                    <ShieldCheck />
                                    {isLoading ? t('common.loading') || '로딩 중...' : t('employee.access') || '직원 전용'}
                                </button>
                                <button
                                    onClick={callTestApi}
                                    className="btn btn-square-desktop btn-info btn-lg btn-icon btn-rounded-desktop-xs"
                                    disabled={isLoading}
                                >
                                    <User />
                                    {isLoading ? t('common.loading') || '로딩 중...' : t('common.test') || '테스트 API'}
                                </button>
                            </div>

                            {/* API 응답 결과 표시 */}
                            {apiResponse && (
                                <div className="api-response mt-lg p-md bg-light rounded">
                                    <h3>{t('api.response') || 'API 응답 결과'}</h3>
                                    <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                                </div>
                            )}

                            {/* 에러 메시지 표시 */}
                            {error && (
                                <div className="error-message mt-md p-md bg-danger text-white rounded">
                                    <h3>{t('common.error') || '오류'}</h3>
                                    <p>{error}</p>
                                </div>
                            )}
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
                            <Link to="/visit-reservation" className="btn btn-outline btn-lg">
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