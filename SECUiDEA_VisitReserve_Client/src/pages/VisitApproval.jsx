import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VisitApproval = () => {
    const navigate = useNavigate();
    const { authHeader, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visits, setVisits] = useState([]);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    // 인증되지 않은 사용자 리디렉션
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', { state: { from: '/visit-approval' } });
        }
    }, [isAuthenticated, loading, navigate]);

    // 방문 신청 목록 불러오기
    useEffect(() => {
        const fetchVisits = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/visits?status=${filter}`, {
                    headers: authHeader
                });

                if (!response.ok) {
                    throw new Error('방문 신청 목록을 불러오는데 실패했습니다.');
                }

                const data = await response.json();
                setVisits(data);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVisits();
    }, [filter, isAuthenticated, authHeader]);

    // 검색 필터링
    const filteredVisits = visits.filter(visit => {
        if (!searchTerm) return true;

        const searchLower = searchTerm.toLowerCase();
        return (
            visit.visitorName.toLowerCase().includes(searchLower) ||
            visit.visitorCompany?.toLowerCase().includes(searchLower) ||
            visit.hostName.toLowerCase().includes(searchLower) ||
            visit.hostDepartment.toLowerCase().includes(searchLower)
        );
    });

    // 방문 신청 상세 정보 표시
    const handleViewDetails = (visit) => {
        setSelectedVisit(visit);
    };

    // 방문 승인 처리
    const handleApprove = async (visitId) => {
        await processVisit(visitId, 'approved', '방문이 승인되었습니다.');
    };

    // 방문 거절 처리
    const handleReject = async (visitId, reason) => {
        await processVisit(visitId, 'rejected', reason || '방문이 거절되었습니다.');
    };

    // 방문 처리 공통 함수
    const processVisit = async (visitId, status, message) => {
        setProcessingId(visitId);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/visits/${visitId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeader
                },
                body: JSON.stringify({
                    status,
                    message
                })
            });

            if (!response.ok) {
                throw new Error('처리 중 오류가 발생했습니다.');
            }

            // 성공 시 목록 업데이트
            setVisits(prevVisits =>
                filter === status
                    ? prevVisits.map(v => v.id === visitId ? { ...v, status, statusMessage: message } : v)
                    : prevVisits.filter(v => v.id !== visitId)
            );

            // 상세보기 중이었다면 닫기
            if (selectedVisit?.id === visitId) {
                setSelectedVisit(null);
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setProcessingId(null);
        }
    };

    // 날짜 형식 변환
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // 시간 형식 변환
    const formatTime = (timeString) => {
        return timeString.substring(0, 5); // 00:00 형식으로 변환
    };

    if (loading && !visits.length) {
        return (
            <div className="visit-approval">
                <div className="visit-approval_loading">
                    <p>로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="visit-approval">
            <div className="visit-approval_header">
                <h1>방문 승인 관리</h1>
                <p>방문 신청 내역을 확인하고 승인 또는 거절할 수 있습니다.</p>
            </div>

            {error && (
                <div className="visit-approval_error">
                    <p>{error}</p>
                </div>
            )}

            <div className="visit-approval_filters">
                <div className="visit-approval_tabs">
                    <button
                        className={filter === 'pending' ? 'active' : ''}
                        onClick={() => setFilter('pending')}
                    >
                        승인 대기중
                    </button>
                    <button
                        className={filter === 'approved' ? 'active' : ''}
                        onClick={() => setFilter('approved')}
                    >
                        승인됨
                    </button>
                    <button
                        className={filter === 'rejected' ? 'active' : ''}
                        onClick={() => setFilter('rejected')}
                    >
                        거절됨
                    </button>
                </div>

                <div className="visit-approval_search">
                    <input
                        type="text"
                        placeholder="이름, 회사, 담당자, 부서로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button
                            className="clear-search"
                            onClick={() => setSearchTerm('')}
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            <div className="visit-approval_content">
                <div className="visit-approval_list">
                    {filteredVisits.length === 0 ? (
                        <div className="visit-approval_empty">
                            <p>{filter === 'pending' ? '승인 대기 중인 방문 신청이 없습니다.' :
                                filter === 'approved' ? '승인된 방문 신청이 없습니다.' :
                                    '거절된 방문 신청이 없습니다.'}</p>
                        </div>
                    ) : (
                        filteredVisits.map(visit => (
                            <div
                                key={visit.id}
                                className={`visit-approval_item ${selectedVisit?.id === visit.id ? 'active' : ''}`}
                                onClick={() => handleViewDetails(visit)}
                            >
                                <div className="visit-approval_item-header">
                                    <h3>{visit.visitorName}</h3>
                                    <span className={`status status--${visit.status}`}>
                                        {visit.status === 'pending' ? '대기중' :
                                            visit.status === 'approved' ? '승인됨' : '거절됨'}
                                    </span>
                                </div>

                                <div className="visit-approval_item-info">
                                    <div className="info-group">
                                        <span className="label">방문 날짜:</span>
                                        <span className="value">{formatDate(visit.visitDate)}</span>
                                    </div>

                                    <div className="info-group">
                                        <span className="label">방문 시간:</span>
                                        <span className="value">
                                            {formatTime(visit.visitStartTime)} - {formatTime(visit.visitEndTime)}
                                        </span>
                                    </div>

                                    <div className="info-group">
                                        <span className="label">회사/기관:</span>
                                        <span className="value">{visit.visitorCompany || '정보 없음'}</span>
                                    </div>

                                    <div className="info-group">
                                        <span className="label">담당자:</span>
                                        <span className="value">{visit.hostName} ({visit.hostDepartment})</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {selectedVisit && (
                    <div className="visit-approval_details">
                        <div className="visit-approval_details-header">
                            <h2>방문 신청 상세 정보</h2>
                            <button
                                className="close-btn"
                                onClick={() => setSelectedVisit(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="visit-approval_details-content">
                            <h3>방문자 정보</h3>
                            <div className="details-group">
                                <div className="details-item">
                                    <span className="label">이름:</span>
                                    <span className="value">{selectedVisit.visitorName}</span>
                                </div>

                                <div className="details-item">
                                    <span className="label">연락처:</span>
                                    <span className="value">{selectedVisit.visitorPhone}</span>
                                </div>

                                <div className="details-item">
                                    <span className="label">이메일:</span>
                                    <span className="value">{selectedVisit.visitorEmail || '정보 없음'}</span>
                                </div>

                                <div className="details-item">
                                    <span className="label">회사/기관:</span>
                                    <span className="value">{selectedVisit.visitorCompany || '정보 없음'}</span>
                                </div>

                                <div className="details-item">
                                    <span className="label">방문 인원:</span>
                                    <span className="value">{selectedVisit.numberOfVisitors}명</span>
                                </div>
                            </div>

                            <h3>방문 일정</h3>
                            <div className="details-group">
                                <div className="details-item">
                                    <span className="label">방문 날짜:</span>
                                    <span className="value">{formatDate(selectedVisit.visitDate)}</span>
                                </div>

                                <div className="details-item">
                                    <span className="label">방문 시간:</span>
                                    <span className="value">
                                        {formatTime(selectedVisit.visitStartTime)} - {formatTime(selectedVisit.visitEndTime)}
                                    </span>
                                </div>
                            </div>

                            <h3>방문 정보</h3>
                            <div className="details-group">
                                <div className="details-item">
                                    <span className="label">방문 목적:</span>
                                    <span className="value">{selectedVisit.visitPurpose}</span>
                                </div>

                                <div className="details-item">
                                    <span className="label">담당자:</span>
                                    <span className="value">{selectedVisit.hostName}</span>
                                </div>

                                <div className="details-item">
                                    <span className="label">담당 부서:</span>
                                    <span className="value">{selectedVisit.hostDepartment}</span>
                                </div>
                            </div>

                            {selectedVisit.carInfo?.hasVehicle && (
                                <>
                                    <h3>차량 정보</h3>
                                    <div className="details-group">
                                        <div className="details-item">
                                            <span className="label">차량 번호:</span>
                                            <span className="value">{selectedVisit.carInfo.carNumber}</span>
                                        </div>

                                        {selectedVisit.carInfo.carModel && (
                                            <div className="details-item">
                                                <span className="label">차종:</span>
                                                <span className="value">{selectedVisit.carInfo.carModel}</span>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {selectedVisit.status === 'pending' && (
                                <div className="visit-approval_actions">
                                    <button
                                        className="approve-btn"
                                        onClick={() => handleApprove(selectedVisit.id)}
                                        disabled={processingId === selectedVisit.id}
                                    >
                                        {processingId === selectedVisit.id ? '처리중...' : '승인하기'}
                                    </button>

                                    <button
                                        className="reject-btn"
                                        onClick={() => {
                                            const reason = prompt('거절 사유를 입력해주세요 (선택사항):');
                                            handleReject(selectedVisit.id, reason);
                                        }}
                                        disabled={processingId === selectedVisit.id}
                                    >
                                        {processingId === selectedVisit.id ? '처리중...' : '거절하기'}
                                    </button>
                                </div>
                            )}

                            {selectedVisit.status !== 'pending' && (
                                <div className="visit-approval_status-message">
                                    <h3>처리 결과</h3>
                                    <p>{selectedVisit.statusMessage ||
                                        (selectedVisit.status === 'approved' ? '승인되었습니다.' : '거절되었습니다.')}</p>
                                    <p className="processed-at">
                                        처리 시간: {new Date(selectedVisit.updatedAt).toLocaleString('ko-KR')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitApproval; 