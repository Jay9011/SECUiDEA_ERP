import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle, X, AlertCircle, Calendar, RefreshCw } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useAuth } from '../../context/AuthContext';

// 스타일
import './visitList.scss';

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
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    // 사용자 권한 확인 (Member 또는 Guest)
    const isMember = user?.role === 'member';

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
                    
                    const newVisits = paginateMockData(mockData, page);
                    
                    if (newVisits.length === 0) {
                        setHasMore(false);
                    } else {
                        setVisits(prevVisits => [...prevVisits, ...newVisits]);
                    }
                    setLoading(false);
                } else {
                    const newVisits = paginateMockData(mockDataCache, page);
                    
                    if (newVisits.length === 0) {
                        setHasMore(false);
                    } else {
                        setVisits(prevVisits => [...prevVisits, ...newVisits]);
                    }
                    setLoading(false);
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
                    setVisits(prevVisits => [...prevVisits, ...newVisits]);
                }
                setLoading(false);
            }
        } catch (err) {
            setError('방문 내역을 불러오는 중 오류가 발생했습니다.');
            console.error('방문 내역 로딩 오류:', err);
            setLoading(false);
        }
    }, [API_BASE_URL, isMember, page, loading, useMockData, mockDataCache]);

    // 방문 신청 상태 변경
    const handleStatusChange = async (visitId, newStatus) => {
        if (!isMember) return; // Member만 상태 변경 가능
        
        try {
            if (useMockData) {
                // Mock 데이터 업데이트
                setVisits(prevVisits => 
                    prevVisits.map(visit => 
                        visit.id === visitId ? { ...visit, status: newStatus } : visit
                    )
                );
                
                // Mock 데이터 캐시도 업데이트
                if (mockDataCache) {
                    setMockDataCache(prevCache => 
                        prevCache.map(visit => 
                            visit.id === visitId ? { ...visit, status: newStatus } : visit
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
                
                // 상태 변경 후 목록 업데이트
                setVisits(prevVisits => 
                    prevVisits.map(visit => 
                        visit.id === visitId ? { ...visit, status: newStatus } : visit
                    )
                );
            }
        } catch (err) {
            setError('상태 변경 중 오류가 발생했습니다.');
            console.error('상태 변경 오류:', err);
        }
    };

    // 페이지 로드 시 데이터 가져오기
    useEffect(() => {
        if (page === 1) {
            fetchVisits();
        }
    }, [fetchVisits]);

    // 추가 데이터 로드
    const loadMoreData = () => {
        setPage(prevPage => prevPage + 1);
    };

    // 데이터 초기화 및 새로고침
    const handleRefresh = () => {
        setVisits([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        
        // Mock 데이터 재생성
        if (useMockData) {
            setMockDataCache(generateMockVisitData(50, isMember));
        }
    };

    // 데이터 타입 전환
    const toggleDataSource = () => {
        setUseMockData(prev => !prev);
        handleRefresh();
    };

    // 방문 상태에 따른 스타일 및 아이콘 반환
    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return { 
                    label: t('reservation.status.pending'), 
                    icon: <Clock size={18} />,
                    className: 'status-pending'
                };
            case 'approved':
                return { 
                    label: t('reservation.status.approved'), 
                    icon: <CheckCircle size={18} />,
                    className: 'status-approved'
                };
            case 'rejected':
                return { 
                    label: t('reservation.status.rejected'), 
                    icon: <X size={18} />,
                    className: 'status-rejected'
                };
            case 'canceled':
                return { 
                    label: t('reservation.status.canceled'), 
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
                                const statusInfo = getStatusInfo(visit.status);
                                
                                return (
                                    <div 
                                        key={visit.id} 
                                        className="visit-item"
                                    >
                                        <div className="visit-item-header">
                                            <div className="visitor-info">
                                                <span className="visitor-name">{visit.visitorName}</span>
                                                <span className="visitor-company">{visit.visitorCompany}</span>
                                            </div>
                                            <div className={`visit-status ${statusInfo.className}`}>
                                                {statusInfo.icon}
                                                <span>{statusInfo.label}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="visit-item-details">
                                            <div className="visit-detail">
                                                <span className="label">방문 일자:</span>
                                                <span className="value">{visit.visitDate}</span>
                                            </div>
                                            <div className="visit-detail">
                                                <span className="label">방문 시간:</span>
                                                <span className="value">{visit.visitTime}</span>
                                            </div>
                                            <div className="visit-detail">
                                                <span className="label">방문 목적:</span>
                                                <span className="value">{visit.visitPurpose}</span>
                                            </div>
                                            {isMember && (
                                                <div className="visit-detail">
                                                    <span className="label">연락처:</span>
                                                    <span className="value">{visit.visitorContact}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Member이고 상태가 대기중일 때만 승인/거절 버튼 표시 */}
                                        {isMember && visit.status === 'pending' && (
                                            <div className="visit-actions">
                                                <button 
                                                    className="btn btn-approve"
                                                    onClick={() => handleStatusChange(visit.id, 'approved')}
                                                >
                                                    <CheckCircle size={16} />
                                                    승인
                                                </button>
                                                <button 
                                                    className="btn btn-reject"
                                                    onClick={() => handleStatusChange(visit.id, 'rejected')}
                                                >
                                                    <X size={16} />
                                                    거절
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </InfiniteScroll>
            </div>
        </div>
    );
};

export default VisitList; 