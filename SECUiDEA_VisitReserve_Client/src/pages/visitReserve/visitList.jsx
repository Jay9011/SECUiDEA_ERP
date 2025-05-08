import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, X, AlertCircle, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { getColorVariables } from '../../utils/cssVariables';

import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import useNetworkErrorAlert from '../../hooks/useNetworkErrorAlert';
import { sendTemplateMessage } from '../../services/aligoService';

// 컴포넌트
import VisitCard from '../../components/cards/VisitCard';

// 스타일
import './visitList.scss';

// 방문 현황 목록 컴포넌트
const VisitList = () => {
    const { t } = useTranslation('visit');
    const location = useLocation();
    const { user } = useAuth();
    const { showNetworkErrorAlert } = useNetworkErrorAlert();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const isLoadingRef = useRef(false); // useRef를 사용하여 로딩 상태 추적 (리렌더링 방지)

    const [pendingStatusChanges, setPendingStatusChanges] = useState({});
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    // 사용자 권한 확인 (Employee 또는 Guest)
    const isMember = user?.role === 'Employee';

    // 페이징 관련
    const [page, setPage] = useState(1);
    const limit = 10;

    // 페이지 이동 시 모달과 알림 정리
    useEffect(() => {
        return () => {
            // 컴포넌트 언마운트 시 실행
            Swal.close();
        };
    }, []);

    // 라우트 변경 감지하여 알림창 닫기
    useEffect(() => {
        Swal.close();
    }, [location]);

    // 방문 내역 데이터 가져오기
    const fetchVisits = useCallback(async () => {
        if (isLoadingRef.current) return;

        setLoading(true);
        isLoadingRef.current = true;

        try {
            // 네트워크 연결 확인
            if (!navigator.onLine) {
                throw new Error(t('common.offlineError'));
            }

            const endpoint = `/Visit/VisitReserveList?page=${page}&limit=${limit}`;
            const response = await api.get(endpoint);
            const data = await response.json();

            if (!data.isSuccess) {
                throw new Error(data.message || t('visitReserve.visitList.loadingError'));
            }

            const newVisits = data.data.data || [];

            if (newVisits.length === 0) {
                setHasMore(false);
            } else {
                setVisits(prevVisits => {
                    const existingIds = new Set(prevVisits.map(v => v.id));
                    const filteredNewVisits = newVisits.filter(v => !existingIds.has(v.id));
                    return [...prevVisits, ...filteredNewVisits];
                });

                // 만약 마지막으로 불러온 데이터의 양이 limit보다 적으면 더 이상 데이터가 없음
                if (newVisits.length < limit) {
                    setHasMore(false);
                }
            }
        } catch (err) {
            console.error('방문 내역 로딩 오류:', err);

            const errorMessage = err.message === t('common.offlineError')
                ? t('common.offlineError')
                : t('visitReserve.visitList.loadingError');

            setError(errorMessage);

            // 네트워크 오류 알림 표시 (첫 페이지 로딩 실패 시에만)
            if (page === 1 && visits.length === 0) {
                showNetworkErrorAlert(
                    errorMessage,
                    fetchVisits,
                    t('common.networkError'),
                    { showCancelButton: true, allowOutsideClick: true }
                );
            }
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [API_BASE_URL, isMember, page, visits.length, t]);

    // 방문 신청 상태 변경
    const handleStatusChange = useCallback(async (visitId, newStatus) => {
        if (!isMember) return; // Member만 상태 변경 가능

        // 이미 상태 변경 중인 경우 중복 요청 방지
        if (pendingStatusChanges[visitId]) return;

        // 상태 변경 중임을 표시
        setPendingStatusChanges(prev => ({ ...prev, [visitId]: newStatus }));

        try {
            // 네트워크 연결 확인
            if (!navigator.onLine) {
                throw new Error(t('common.offlineError'));
            }

            const endpoint = `/Visit/VisitReserveStatus`;
            const response = await api.put(endpoint, {
                body: JSON.stringify({ visitId: visitId, status: newStatus })
            });

            const data = await response.json();

            if (!data.isSuccess) {
                throw new Error(data.message || t('visitReserve.visitList.statusChangeError'));
            }

            // 성공적으로 상태가 변경된 경우 UI 업데이트와 카카오 알림톡 발송
            if (newStatus === 'approved'
                && data.data?.ApiKey
                && data.data?.visitants?.length > 0
                && data.data?.visitants[0]?.mobile
            ) {
                const templateVariables = {
                    "방문자이름": data.data.visitants[0].visitantName,
                    "방문일": data.data.visitReserves[0].visitSDate,
                    "승인시간": new Date().toISOString().replace('T', ' ').substring(0, 19)
                };

                await sendTemplateMessage(data.data.ApiKey, 'ApprovedMsg', data.data.visitants[0].mobile, data.data.visitants[0].visitantName, templateVariables)
                    .then(async (response) => {
                        const data = await response.json();
                        if (!data.isSuccess) {
                            Swal.fire({
                                title: t('common.kakaoMessageError'),
                                text: t('visitReserve.visitList.visitantPhoneNotExists'),
                                icon: 'warning',
                                confirmButtonText: t('common.ok'),
                                confirmButtonColor: getColorVariables().warning
                            })
                        }
                    })
                    .catch(error => {
                        console.error('카카오 알림톡 발송 오류:', error);
                        throw error;
                    });
            }

            setVisits(prevVisits =>
                prevVisits.map(visit =>
                    visit.id === visitId ? { ...visit, status: newStatus } : visit
                )
            );
        } catch (err) {
            console.error('상태 변경 오류:', err);

            const errorMessage = err.message === t('common.offlineError')
                ? t('common.offlineError')
                : t('visitReserve.visitList.statusChangeError');

            setError(errorMessage);

            // 네트워크 오류 알림 표시
            showNetworkErrorAlert(
                errorMessage,
                () => handleStatusChange(visitId, newStatus),
                t('common.networkError'),
                { showCancelButton: true, allowOutsideClick: true }
            );

            // 오류 발생 시 기존 상태로 표시
            setVisits(prevVisits => [...prevVisits]);
        } finally {
            // 상태 변경 작업 완료
            setPendingStatusChanges(prev => {
                const newState = { ...prev };
                delete newState[visitId];
                return newState;
            });
        }
    }, [isMember, pendingStatusChanges, t]);

    // 페이지 로드 시 데이터 가져오기
    useEffect(() => {
        if (page === 1) {
            fetchVisits();
        }
    }, [fetchVisits]);

    // 다음 페이지 자동 로드 - useEffect로 page 변경 시 자동 로드
    useEffect(() => {
        if (page > 1) {
            fetchVisits();
        }
    }, [page, fetchVisits]);

    // 추가 데이터 로드
    const loadMoreData = useCallback(() => {
        // 로딩 중이 아닐 때만 다음 페이지 로드
        if (!isLoadingRef.current) {
            setPage(prevPage => prevPage + 1);
        }
    }, []);

    // 데이터 초기화 및 새로고침
    const handleRefresh = useCallback(() => {
        // 로딩 중이 아닐 때만 새로고침
        if (!isLoadingRef.current) {
            setVisits([]);
            setPage(1);
            setHasMore(true);
            setError(null);
            setPendingStatusChanges({});
        }
    }, []);

    // 방문 상태에 따른 스타일 및 아이콘 반환
    const getStatusInfo = useCallback((status) => {
        switch (status) {
            case 'pending':
                return {
                    label: t('visitReserve.visitList.status.pending') || '대기',
                    icon: <Clock size={18} />,
                    className: 'status-pending'
                };
            case 'approved':
                return {
                    label: t('visitReserve.visitList.status.approved') || '승인',
                    icon: <CheckCircle size={18} />,
                    className: 'status-approved'
                };
            case 'visited':
                return {
                    label: t('visitReserve.visitList.status.visited') || '방문',
                    icon: <Clock size={18} />,
                    className: 'status-visited'
                };
            case 'finished':
                return {
                    label: t('visitReserve.visitList.status.finished') || '완료',
                    icon: <CheckCircle size={18} />,
                    className: 'status-finished'
                };
            case 'rejected':
                return {
                    label: t('visitReserve.visitList.status.rejected') || '거절',
                    icon: <X size={18} />,
                    className: 'status-rejected'
                };
            case 'canceled':
                return {
                    label: t('visitReserve.visitList.status.canceled') || '취소',
                    icon: <AlertCircle size={18} />,
                    className: 'status-canceled'
                };
            default:
                return {
                    label: status,
                    icon: <Clock size={18} />,
                    className: 'status-default'
                };
        }
    }, [t]);

    // 로딩 중 상태 정보
    const loadingStatusInfo = {
        label: t('visitReserve.visitList.status.loading'),
        icon: <Loader2 size={18} className="spin" />,
        className: 'status-loading'
    };

    return (
        <div className="visit-list-container">
            <div className="visit-list-header">
                <h2 className="visit-list-title">
                    <Calendar size={24} className="title-icon" />
                    {t('visitReserve.visitList.title')}
                </h2>

                <div className="actions">
                    <button
                        className="btn btn-refresh"
                        onClick={handleRefresh}
                        title={t('visitReserve.visitList.refresh')}
                        disabled={isLoadingRef.current}
                    >
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                        {t('visitReserve.visitList.refresh')}
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <div
                className="visit-list-wrapper"
                id="scrollableDiv"
                style={{
                    height: 'calc(100vh - 200px)',
                    overflow: 'auto'
                }}
            >
                {visits.length === 0 && loading ? (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>{t('visitReserve.visitList.loading')}</p>
                    </div>
                ) : (
                    <InfiniteScroll
                        dataLength={visits.length}
                        useWindow={false}
                        next={loadMoreData}
                        hasMore={hasMore && !isLoadingRef.current}
                        loader={
                            <div className="loading-indicator">
                                <div className="spinner"></div>
                                <p>{t('visitReserve.visitList.loading')}</p>
                            </div>
                        }
                        endMessage={
                            <div className="end-message">
                                <p>{t('visitReserve.visitList.allVisitsLoaded')}</p>
                            </div>
                        }
                        scrollableTarget="scrollableDiv"
                        scrollThreshold={0.9}
                    >
                        {visits.length === 0 && !loading ? (
                            <div className="no-visits">
                                <p>{t('visitReserve.visitList.noVisits')}</p>
                            </div>
                        ) : (
                            <div className="visit-list">
                                {visits.map((visit) => {
                                    // 현재 상태가 변경 중인지 확인
                                    const isPending = pendingStatusChanges[visit.id];
                                    // 표시할 상태 정보 결정
                                    const statusInfo = isPending
                                        ? loadingStatusInfo
                                        : getStatusInfo(visit.status);

                                    return (
                                        <VisitCard
                                            key={visit.id}
                                            visit={visit}
                                            isMember={isMember}
                                            isPending={isPending}
                                            statusInfo={statusInfo}
                                            onStatusChange={handleStatusChange}
                                            showContact={isMember}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </InfiniteScroll>
                )}
            </div>
        </div>
    );
};

export default VisitList; 