import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, X, AlertCircle, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Swal from 'sweetalert2';

import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

// 컴포넌트
import VisitCard from '../../components/cards/VisitCard';

// 스타일
import './visitList.scss';

// 방문 현황 목록 컴포넌트
const VisitList = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const isLoadingRef = useRef(false); // useRef를 사용하여 로딩 상태 추적 (리렌더링 방지)

    const [pendingStatusChanges, setPendingStatusChanges] = useState({});
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    // 사용자 권한 확인 (Member 또는 Guest)
    const isMember = user?.role === 'member';

    // 네트워크 오류 Alert
    const showNetworkErrorAlert = (errorMessage, retryHandler, title = '네트워크 오류', options = {}) => {
        const { showCancelButton = true, allowOutsideClick = true } = options;

        Swal.fire({
            title: title,
            html: typeof errorMessage === 'string'
                ? `<p>${errorMessage}</p><p>다시 시도하시겠습니까?</p>`
                : errorMessage,
            icon: 'error',
            showCancelButton: showCancelButton,
            confirmButtonText: '다시 시도',
            cancelButtonText: '닫기',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#6c757d',
            allowOutsideClick: allowOutsideClick,
            allowEscapeKey: allowOutsideClick
        }).then((result) => {
            if (result.isConfirmed && typeof retryHandler === 'function') {
                retryHandler();
            }
        });
    };

    // 방문 내역 데이터 가져오기
    const fetchVisits = useCallback(async () => {
        if (isLoadingRef.current) return;

        setLoading(true);
        isLoadingRef.current = true;

        try {
            // 네트워크 연결 확인
            if (!navigator.onLine) {
                throw new Error('인터넷 연결이 오프라인 상태입니다.');
            }

            const endpoint = `/Visit/VisitReserveList?page=${page}&limit=10`;
            const response = await api.get(endpoint);
            const data = await response.json();

            if (!data.isSuccess) {
                throw new Error(data.message || '서버에서 데이터를 가져오는데 실패했습니다.');
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
            }
        } catch (err) {
            console.error('방문 내역 로딩 오류:', err);

            const errorMessage = err.message === '인터넷 연결이 오프라인 상태입니다.'
                ? '인터넷 연결이 오프라인 상태입니다.'
                : '방문 내역을 불러오는 중 오류가 발생했습니다.';

            setError(errorMessage);

            // 네트워크 오류 알림 표시 (첫 페이지 로딩 실패 시에만)
            if (page === 1 && visits.length === 0) {
                showNetworkErrorAlert(
                    errorMessage,
                    fetchVisits,
                    '데이터 로딩 오류',
                    { showCancelButton: true, allowOutsideClick: true }
                );
            }
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    }, [API_BASE_URL, isMember, page, visits.length]);

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
                throw new Error('인터넷 연결이 오프라인 상태입니다.');
            }

            const endpoint = `/api/Visit/VisitReserveStatus/${visitId}`;
            const response = await api.put(endpoint, {
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (!data.isSuccess) {
                throw new Error(data.message || '상태 변경에 실패했습니다.');
            }

            // 성공적으로 상태가 변경된 경우 UI 업데이트
            setVisits(prevVisits =>
                prevVisits.map(visit =>
                    visit.id === visitId ? { ...visit, status: newStatus } : visit
                )
            );
        } catch (err) {
            console.error('상태 변경 오류:', err);

            const errorMessage = err.message === '인터넷 연결이 오프라인 상태입니다.'
                ? '인터넷 연결이 오프라인 상태입니다.'
                : '상태 변경 중 오류가 발생했습니다.';

            setError(errorMessage);

            // 네트워크 오류 알림 표시
            showNetworkErrorAlert(
                errorMessage,
                () => handleStatusChange(visitId, newStatus),
                '상태 변경 오류',
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
    }, [isMember, pendingStatusChanges]);

    // 페이지 로드 시 데이터 가져오기
    useEffect(() => {
        if (page === 1) {
            fetchVisits();
        }
    }, [fetchVisits]);

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

    // 다음 페이지 자동 로드 - useEffect로 page 변경 시 자동 로드
    useEffect(() => {
        if (page > 1) {
            fetchVisits();
        }
    }, [page, fetchVisits]);

    // 방문 상태에 따른 스타일 및 아이콘 반환
    const getStatusInfo = useCallback((status) => {
        switch (status) {
            case 'pending':
                return {
                    label: t('reservation.status.pending') || '승인 대기',
                    icon: <Clock size={18} />,
                    className: 'status-pending'
                };
            case 'approved':
                return {
                    label: t('reservation.status.approved') || '승인 완료',
                    icon: <CheckCircle size={18} />,
                    className: 'status-approved'
                };
            case 'rejected':
                return {
                    label: t('reservation.status.rejected') || '거절됨',
                    icon: <X size={18} />,
                    className: 'status-rejected'
                };
            case 'canceled':
                return {
                    label: t('reservation.status.canceled') || '취소됨',
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
        label: '요청 중',
        icon: <Loader2 size={18} className="spin" />,
        className: 'status-loading'
    };

    return (
        <div className="visit-list-container">
            <div className="visit-list-header">
                <h2 className="visit-list-title">
                    <Calendar size={24} className="title-icon" />
                    방문 현황
                </h2>

                <div className="actions">
                    <button
                        className="btn btn-refresh"
                        onClick={handleRefresh}
                        title="새로고침"
                        disabled={isLoadingRef.current}
                    >
                        <RefreshCw size={16} className={loading ? 'spin' : ''} />
                        새로고침
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
                        <p>불러오는 중...</p>
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
                                <p>불러오는 중...</p>
                            </div>
                        }
                        endMessage={
                            <div className="end-message">
                                <p>모든 방문 내역을 불러왔습니다.</p>
                            </div>
                        }
                        scrollableTarget="scrollableDiv"
                        scrollThreshold={0.9}
                    >
                        {visits.length === 0 && !loading ? (
                            <div className="no-visits">
                                <p>방문 내역이 없습니다.</p>
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