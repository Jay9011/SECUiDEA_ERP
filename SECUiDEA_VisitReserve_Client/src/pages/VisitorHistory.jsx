import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VisitorHistory = () => {
    const navigate = useNavigate();
    const { authHeader, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [visits, setVisits] = useState([]);
    const [filteredVisits, setFilteredVisits] = useState([]);
    const [selectedVisit, setSelectedVisit] = useState(null);

    // 필터링 상태
    const [filters, setFilters] = useState({
        dateRange: {
            startDate: '',
            endDate: ''
        },
        visitorName: '',
        hostName: '',
        status: 'all' // all, approved, rejected
    });

    // 정렬 상태
    const [sortConfig, setSortConfig] = useState({
        key: 'visitDate',
        direction: 'desc'
    });

    // 페이지네이션 상태
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        totalItems: 0
    });

    // 인증되지 않은 사용자 리디렉션
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate('/login', { state: { from: '/visitor-history' } });
        }
    }, [isAuthenticated, loading, navigate]);

    // 방문 이력 불러오기
    useEffect(() => {
        const fetchVisitHistory = async () => {
            if (!isAuthenticated) return;

            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/visits/history`, {
                    headers: authHeader
                });

                if (!response.ok) {
                    throw new Error('방문 이력을 불러오는데 실패했습니다.');
                }

                const data = await response.json();
                setVisits(data);
                setFilteredVisits(data);
                setPagination(prev => ({
                    ...prev,
                    totalItems: data.length
                }));
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchVisitHistory();
    }, [isAuthenticated, authHeader]);

    // 필터링 적용
    useEffect(() => {
        let result = [...visits];

        // 날짜 범위 필터링
        if (filters.dateRange.startDate) {
            const startDate = new Date(filters.dateRange.startDate);
            result = result.filter(visit => new Date(visit.visitDate) >= startDate);
        }

        if (filters.dateRange.endDate) {
            const endDate = new Date(filters.dateRange.endDate);
            endDate.setDate(endDate.getDate() + 1); // 선택한 날짜 포함
            result = result.filter(visit => new Date(visit.visitDate) < endDate);
        }

        // 방문자 이름 필터링
        if (filters.visitorName) {
            const searchTerm = filters.visitorName.toLowerCase();
            result = result.filter(visit =>
                visit.visitorName.toLowerCase().includes(searchTerm)
            );
        }

        // 담당자 이름 필터링
        if (filters.hostName) {
            const searchTerm = filters.hostName.toLowerCase();
            result = result.filter(visit =>
                visit.hostName.toLowerCase().includes(searchTerm)
            );
        }

        // 상태 필터링
        if (filters.status !== 'all') {
            result = result.filter(visit => visit.status === filters.status);
        }

        // 정렬 적용
        result.sort((a, b) => {
            if (sortConfig.key === 'visitDate') {
                return sortConfig.direction === 'asc'
                    ? new Date(a.visitDate) - new Date(b.visitDate)
                    : new Date(b.visitDate) - new Date(a.visitDate);
            } else if (sortConfig.key === 'visitorName') {
                return sortConfig.direction === 'asc'
                    ? a.visitorName.localeCompare(b.visitorName)
                    : b.visitorName.localeCompare(a.visitorName);
            } else if (sortConfig.key === 'hostName') {
                return sortConfig.direction === 'asc'
                    ? a.hostName.localeCompare(b.hostName)
                    : b.hostName.localeCompare(a.hostName);
            }
            return 0;
        });

        setFilteredVisits(result);
        setPagination(prev => ({
            ...prev,
            totalItems: result.length,
            currentPage: 1 // 필터 변경 시 첫 페이지로 이동
        }));
    }, [filters, sortConfig, visits]);

    // 필터 변경 핸들러
    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        if (name === 'startDate' || name === 'endDate') {
            setFilters({
                ...filters,
                dateRange: {
                    ...filters.dateRange,
                    [name]: value
                }
            });
        } else {
            setFilters({
                ...filters,
                [name]: value
            });
        }
    };

    // 필터 초기화
    const resetFilters = () => {
        setFilters({
            dateRange: {
                startDate: '',
                endDate: ''
            },
            visitorName: '',
            hostName: '',
            status: 'all'
        });
        setSortConfig({
            key: 'visitDate',
            direction: 'desc'
        });
    };

    // 정렬 변경 핸들러
    const handleSort = (key) => {
        setSortConfig({
            key,
            direction:
                sortConfig.key === key
                    ? sortConfig.direction === 'asc' ? 'desc' : 'asc'
                    : 'asc'
        });
    };

    // 페이지 변경 핸들러
    const handlePageChange = (pageNumber) => {
        setPagination({
            ...pagination,
            currentPage: pageNumber
        });
    };

    // 현재 페이지의 데이터 가져오기
    const getCurrentPageData = () => {
        const { currentPage, itemsPerPage } = pagination;
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredVisits.slice(startIndex, startIndex + itemsPerPage);
    };

    // 페이지네이션 컴포넌트
    const renderPagination = () => {
        const { currentPage, itemsPerPage, totalItems } = pagination;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        if (totalPages <= 1) return null;

        // 페이지 버튼 생성 (최대 5개)
        const pageButtons = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4 && startPage > 1) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageButtons.push(
                <button
                    key={i}
                    className={i === currentPage ? 'active' : ''}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="visitor-history_pagination">
                <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                >
                    &laquo;
                </button>

                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    &lt;
                </button>

                {pageButtons}

                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    &gt;
                </button>

                <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                >
                    &raquo;
                </button>
            </div>
        );
    };

    // 방문 상세 정보 표시
    const handleViewDetails = (visit) => {
        setSelectedVisit(visit);
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
            <div className="visitor-history">
                <div className="visitor-history_loading">
                    <p>로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="visitor-history">
            <div className="visitor-history_header">
                <h1>방문 이력 관리</h1>
                <p>방문 이력을 확인하고 검색할 수 있습니다.</p>
            </div>

            {error && (
                <div className="visitor-history_error">
                    <p>{error}</p>
                </div>
            )}

            <div className="visitor-history_filters">
                <div className="visitor-history_filters-header">
                    <h2>검색 필터</h2>
                    <button
                        className="reset-btn"
                        onClick={resetFilters}
                    >
                        필터 초기화
                    </button>
                </div>

                <div className="visitor-history_filters-content">
                    <div className="filter-group">
                        <label htmlFor="startDate">방문 시작일</label>
                        <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={filters.dateRange.startDate}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="endDate">방문 종료일</label>
                        <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={filters.dateRange.endDate}
                            onChange={handleFilterChange}
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="visitorName">방문자 이름</label>
                        <input
                            type="text"
                            id="visitorName"
                            name="visitorName"
                            value={filters.visitorName}
                            onChange={handleFilterChange}
                            placeholder="방문자 이름으로 검색"
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="hostName">담당자 이름</label>
                        <input
                            type="text"
                            id="hostName"
                            name="hostName"
                            value={filters.hostName}
                            onChange={handleFilterChange}
                            placeholder="담당자 이름으로 검색"
                        />
                    </div>

                    <div className="filter-group">
                        <label htmlFor="status">방문 상태</label>
                        <select
                            id="status"
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                        >
                            <option value="all">전체</option>
                            <option value="approved">승인됨</option>
                            <option value="rejected">거절됨</option>
                            <option value="pending">대기중</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="visitor-history_content">
                <div className="visitor-history_table-container">
                    <table className="visitor-history_table">
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('visitDate')} className={sortConfig.key === 'visitDate' ? sortConfig.direction : ''}>
                                    방문 날짜
                                    {sortConfig.key === 'visitDate' && (
                                        <span className="sort-icon">
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </th>
                                <th onClick={() => handleSort('visitorName')} className={sortConfig.key === 'visitorName' ? sortConfig.direction : ''}>
                                    방문자
                                    {sortConfig.key === 'visitorName' && (
                                        <span className="sort-icon">
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </th>
                                <th onClick={() => handleSort('hostName')} className={sortConfig.key === 'hostName' ? sortConfig.direction : ''}>
                                    담당자
                                    {sortConfig.key === 'hostName' && (
                                        <span className="sort-icon">
                                            {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </th>
                                <th>방문 시간</th>
                                <th>상태</th>
                                <th>상세</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getCurrentPageData().length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-table">
                                        검색 결과가 없습니다
                                    </td>
                                </tr>
                            ) : (
                                getCurrentPageData().map(visit => (
                                    <tr key={visit.id}>
                                        <td>{formatDate(visit.visitDate)}</td>
                                        <td>
                                            <div className="visitor-info">
                                                <span className="name">{visit.visitorName}</span>
                                                {visit.visitorCompany && (
                                                    <span className="company">({visit.visitorCompany})</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="host-info">
                                                <span className="name">{visit.hostName}</span>
                                                <span className="department">({visit.hostDepartment})</span>
                                            </div>
                                        </td>
                                        <td>
                                            {formatTime(visit.visitStartTime)} - {formatTime(visit.visitEndTime)}
                                        </td>
                                        <td>
                                            <span className={`status status--${visit.status}`}>
                                                {visit.status === 'pending' ? '대기중' :
                                                    visit.status === 'approved' ? '승인됨' : '거절됨'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="details-btn"
                                                onClick={() => handleViewDetails(visit)}
                                            >
                                                상세보기
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {renderPagination()}
                </div>

                {selectedVisit && (
                    <div className="visitor-history_details-modal">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>방문 상세 정보</h2>
                                <button
                                    className="close-btn"
                                    onClick={() => setSelectedVisit(null)}
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="modal-body">
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
                                        <span className="value">
                                            {selectedVisit.visitorEmail || '정보 없음'}
                                        </span>
                                    </div>

                                    <div className="details-item">
                                        <span className="label">회사/기관:</span>
                                        <span className="value">
                                            {selectedVisit.visitorCompany || '정보 없음'}
                                        </span>
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

                                <h3>처리 상태</h3>
                                <div className="details-group">
                                    <div className="details-item">
                                        <span className="label">상태:</span>
                                        <span className={`value status status--${selectedVisit.status}`}>
                                            {selectedVisit.status === 'pending' ? '대기중' :
                                                selectedVisit.status === 'approved' ? '승인됨' : '거절됨'}
                                        </span>
                                    </div>

                                    {selectedVisit.status !== 'pending' && (
                                        <>
                                            <div className="details-item">
                                                <span className="label">처리 메시지:</span>
                                                <span className="value">
                                                    {selectedVisit.statusMessage || '메시지 없음'}
                                                </span>
                                            </div>

                                            <div className="details-item">
                                                <span className="label">처리 시간:</span>
                                                <span className="value">
                                                    {new Date(selectedVisit.updatedAt).toLocaleString('ko-KR')}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VisitorHistory; 