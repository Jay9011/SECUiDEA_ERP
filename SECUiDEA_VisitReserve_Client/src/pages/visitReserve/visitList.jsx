import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Clock, CheckCircle, X, AlertCircle, Calendar } from 'lucide-react';
import axios from 'axios';

// 스타일
import './VisitList.scss';

// 방문 현황 목록 컴포넌트
const VisitList = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [visits, setVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const API_BASE_URL = import.meta.env.VITE_API_URL || '';

    // 사용자 권한 확인 (Member 또는 Guest)
    const isMember = user?.role === 'member';

    // 마지막 요소 참조 - 무한 스크롤 구현을 위한 IntersectionObserver 설정
    const lastVisitElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // 방문 내역 데이터 가져오기
    const fetchVisits = useCallback(async () => {
        setLoading(true);
        try {
            // 사용자 권한에 따라 다른 API 엔드포인트 호출
            const endpoint = isMember 
                ? `${API_BASE_URL}/api/visit-reservations/member` 
                : `${API_BASE_URL}/api/visit-reservations/guest`;
            
            const response = await axios.get(endpoint, {
                params: { page, limit: 10 },
                withCredentials: true
            });
            
            const newVisits = response.data.data;
            
            if (newVisits.length === 0) {
                setHasMore(false);
            } else {
                setVisits(prev => [...prev, ...newVisits]);
            }
        } catch (err) {
            setError('방문 내역을 불러오는 중 오류가 발생했습니다.');
            console.error('방문 내역 로딩 오류:', err);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL, isMember, page]);

    // 방문 신청 상태 변경
    const handleStatusChange = async (visitId, newStatus) => {
        if (!isMember) return; // Member만 상태 변경 가능
        
        try {
            await axios.put(`${API_BASE_URL}/api/visit-reservations/${visitId}/status`, 
                { status: newStatus },
                { withCredentials: true }
            );
            
            // 상태 변경 후 목록 업데이트
            setVisits(prevVisits => 
                prevVisits.map(visit => 
                    visit.id === visitId ? { ...visit, status: newStatus } : visit
                )
            );
        } catch (err) {
            setError('상태 변경 중 오류가 발생했습니다.');
            console.error('상태 변경 오류:', err);
        }
    };

    // 페이지 로드 및 페이지 번호 변경 시 데이터 가져오기
    useEffect(() => {
        fetchVisits();
    }, [fetchVisits]);

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

    return (
        <div className="visit-list-container">
            <h2 className="visit-list-title">
                <Calendar size={24} className="title-icon" />
                방문 현황
            </h2>
            
            {error && (
                <div className="error-message">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
            
            <div className="visit-list">
                {visits.length === 0 && !loading ? (
                    <div className="no-visits">
                        <p>방문 내역이 없습니다.</p>
                    </div>
                ) : (
                    visits.map((visit, index) => {
                        const isLastElement = index === visits.length - 1;
                        const statusInfo = getStatusInfo(visit.status);
                        
                        return (
                            <div 
                                key={visit.id} 
                                ref={isLastElement ? lastVisitElementRef : null}
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
                    })
                )}
                
                {loading && (
                    <div className="loading-indicator">
                        <div className="spinner"></div>
                        <p>불러오는 중...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitList; 