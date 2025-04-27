import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, X, AlertCircle, Calendar, RefreshCw, Loader2 } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useAuth } from '../../context/AuthContext';

// 스타일
import './visitList.scss';

// 컴포넌트
import VisitCard from '../../components/cards/VisitCard';

// Mock 데이터
import { generateMockVisitData, paginateMockData } from './mockData';

// 방문 현황 목록 컴포넌트
const VisitList = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [useMockData, setUseMockData] = useState(true); // 테스트 목적으로 기본값을 true로 설정
    const [mockDataCache, setMockDataCache] = useState([]); // 빈 배열로 초기화
    // 진행 중인 상태 변경을 추적하는 상태
    const [pendingStatusChanges, setPendingStatusChanges] = useState({});
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    // 사용자 권한 확인 (Member 또는 Guest)
    // const isMember = user?.role === 'member';
    const isMember = true;

    // Mock 데이터 초기화
    useEffect(() => {
        if (useMockData && mockDataCache.length === 0) {
            const mockData = generateMockVisitData(50, isMember);
            setMockDataCache(mockData);
        }
    }, [useMockData, isMember, mockDataCache.length]);

    // 방문 내역 데이터 가져오기
    const fetchVisits = useCallback(async () => {
        if (loading) return;
        
        setLoading(true);
        try {
            if (useMockData) {
                // Mock 데이터 사용
                // 데이터가 아직 없으면 생성
                if (mockDataCache.length === 0) {
                    const mockData = generateMockVisitData(50, isMember);
                    setMockDataCache(mockData);
                    
                    setTimeout(() => {
                        const newVisits = paginateMockData(mockData, page);
                        
                        if (newVisits.length === 0) {
                            setHasMore(false);
                        } else {
                            // 중복 제거 로직 추가
                            setVisits(prevVisits => {
                                const existingIds = new Set(prevVisits.map(v => v.id));
                                const filteredNewVisits = newVisits.filter(v => !existingIds.has(v.id));
                                return [...prevVisits, ...filteredNewVisits];
                            });
                        }
                        setLoading(false);
                    }, 800);
                } else {
                    setTimeout(() => {
                        const newVisits = paginateMockData(mockDataCache, page);
                        
                        if (newVisits.length === 0) {
                            setHasMore(false);
                        } else {
                            // 중복 제거 로직 추가
                            setVisits(prevVisits => {
                                const existingIds = new Set(prevVisits.map(v => v.id));
                                const filteredNewVisits = newVisits.filter(v => !existingIds.has(v.id));
                                return [...prevVisits, ...filteredNewVisits];
                            });
                        }
                        setLoading(false);
                    }, 800); // 로딩 시뮬레이션을 위한 지연
                }
            } else {
                // 실제 API 호출
                const endpoint = isMember 
                    ? `${API_BASE_URL}/api/visit-reservations/member` 
                    : `${API_BASE_URL}/api/visit-reservations/guest`;
                
                const response = await fetch(`${endpoint}?page=${page}&limit=10`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error('서버에서 데이터를 가져오는데 실패했습니다.');
                }
                
                const data = await response.json();
                const newVisits = data.data;
                
                if (newVisits.length === 0) {
                    setHasMore(false);
                } else {
                    // 중복 제거 로직 추가
                    setVisits(prevVisits => {
                        const existingIds = new Set(prevVisits.map(v => v.id));
                        const filteredNewVisits = newVisits.filter(v => !existingIds.has(v.id));
                        return [...prevVisits, ...filteredNewVisits];
                    });
                }
                setLoading(false);
            }
        } catch (err) {
            setError('방문 내역을 불러오는 중 오류가 발생했습니다.');
            console.error('방문 내역 로딩 오류:', err);
            setLoading(false);
        }
    }, [API_BASE_URL, isMember, page, loading, useMockData, mockDataCache]);

    // 방문 신청 상태 변경 - useCallback으로 메모이제이션
    const handleStatusChange = useCallback(async (visitId, newStatus) => {
        if (!isMember) return; // Member만 상태 변경 가능
        
        // 이미 상태 변경 중인 경우 중복 요청 방지
        if (pendingStatusChanges[visitId]) return;
        
        // 상태 변경 중임을 표시
        setPendingStatusChanges(prev => ({ ...prev, [visitId]: newStatus }));
        
        try {
            if (useMockData) {
                // Mock 데이터에서는 일정 확률로 성공/실패/취소 시뮬레이션
                await new Promise(resolve => setTimeout(resolve, 1500)); // 로딩 표시를 위한 지연
                
                // 80%는 성공, 10%는 실패(승인 대기 유지), 10%는 취소됨으로 상태 변경
                const random = Math.random();
                let finalStatus;
                
                if (random < 0.8) {
                    // 성공: 요청한 상태로 변경
                    finalStatus = newStatus;
                } else if (random < 0.9) {
                    // 실패: 기존 상태 유지(pending)
                    finalStatus = 'pending';
                } else {
                    // 취소됨으로 변경
                    finalStatus = 'canceled';
                }
                
                // 상태 업데이트
                setVisits(prevVisits => 
                    prevVisits.map(visit => 
                        visit.id === visitId ? { ...visit, status: finalStatus } : visit
                    )
                );
                
                // Mock 데이터 캐시도 업데이트
                if (mockDataCache) {
                    setMockDataCache(prevCache => 
                        prevCache.map(visit => 
                            visit.id === visitId ? { ...visit, status: finalStatus } : visit
                        )
                    );
                }
            } else {
                // 실제 API 호출
                const response = await fetch(`${API_BASE_URL}/api/visit-reservations/${visitId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: newStatus }),
                    credentials: 'include'
                });
                
                if (!response.ok) {
                    throw new Error('상태 변경에 실패했습니다.');
                }
                
                const data = await response.json();
                const finalStatus = data.isSuccess ? newStatus : 'pending';
                
                // 응답에 따라 상태 업데이트
                setVisits(prevVisits => 
                    prevVisits.map(visit => 
                        visit.id === visitId ? { ...visit, status: finalStatus } : visit
                    )
                );
            }
        } catch (err) {
            setError('상태 변경 중 오류가 발생했습니다.');
            console.error('상태 변경 오류:', err);
            
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
    }, [isMember, pendingStatusChanges, useMockData, mockDataCache, API_BASE_URL]);

    // 페이지 로드 시 데이터 가져오기
    useEffect(() => {
        if (page === 1) {
            fetchVisits();
        }
    }, [fetchVisits]);

    // 추가 데이터 로드
    const loadMoreData = useCallback(() => {
        setPage(prevPage => prevPage + 1);
    }, []);

    // 데이터 초기화 및 새로고침
    const handleRefresh = useCallback(() => {
        setVisits([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        setPendingStatusChanges({});
        
        // Mock 데이터 재생성
        if (useMockData) {
            setMockDataCache(generateMockVisitData(50, isMember));
        }
    }, [useMockData, isMember]);

    // 데이터 타입 전환
    const toggleDataSource = useCallback(() => {
        setUseMockData(prev => !prev);
        handleRefresh();
    }, [handleRefresh]);

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

    // 다음 페이지 자동 로드 - useEffect로 page 변경 시 자동 로드
    useEffect(() => {
        if (page > 1) {
            fetchVisits();
        }
    }, [page, fetchVisits]);

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
                    >
                        <RefreshCw size={16} />
                        새로고침
                    </button>
                    
                    <button 
                        className={`btn ${useMockData ? 'btn-mock' : 'btn-api'}`}
                        onClick={toggleDataSource}
                        title={useMockData ? "실제 API 사용" : "목업 데이터 사용"}
                    >
                        {useMockData ? "목업 데이터" : "실제 API"}
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
                        hasMore={hasMore}
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