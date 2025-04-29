import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { Clock, CheckCircle, X, AlertCircle, Loader2, BookOpen, AlertTriangle } from 'lucide-react';

// 스타일
import './VisitCard.scss';

const VisitCard = memo(({
    visit,
    isMember,
    isPending,
    statusInfo,
    onStatusChange,
    showContact = false
}) => {
    // 방문 목적 확장 상태
    const [isPurposeExpanded, setIsPurposeExpanded] = useState(false);

    // 날짜 및 시간 포맷팅 함수
    const formatDateTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    // 방문 목적 표시 함수 - VisitReason과 VisitPurpose 합치기
    const getVisitPurposeText = () => {
        const reason = visit.visitReason || '';
        const purpose = visit.visitPurpose || '';

        if (reason && purpose) {
            return `${reason} - ${purpose}`;
        }

        return reason || purpose || '없음';
    };

    // 방문 목적 토글 함수
    const togglePurposeExpand = () => {
        setIsPurposeExpanded(!isPurposeExpanded);
    };

    // 교육 이수 상태 배지 렌더링 함수
    const renderEducationBadge = () => {
        // education 속성이 undefined인 경우 배지를 표시하지 않음
        if (visit.education === undefined) return null;

        if (visit.education) {
            return (
                <div className="education-badge education-completed">
                    <BookOpen size={14} />
                    <span>교육 이수</span>
                </div>
            );
        } else {
            return (
                <div className="education-badge education-incomplete">
                    <AlertTriangle size={14} />
                    <span>교육 미이수</span>
                </div>
            );
        }
    };

    return (
        <div className={`visit-item ${isPending ? 'item-pending' : ''}`}>
            <div className="visit-item-header">
                <div className="visitor-info">
                    <span className="visitor-name">{visit.visitorName}</span>
                    <span className="visitor-company">{visit.visitorCompany}</span>
                </div>

                {isMember && visit.status === 'pending' && !isPending ? (
                    // Member이고 대기중인 상태일 때 - 클릭 가능한 버튼으로 표시 (변경 중이 아닐 때)
                    <div className="status-container">
                        {renderEducationBadge()}
                        <button
                            className="visit-status-button status-pending"
                            onClick={() => onStatusChange(visit.id, 'approved')}
                            title="클릭하여 승인하기"
                        >
                            <Clock size={18} />
                            <span>승인 대기</span>
                        </button>
                    </div>
                ) : (
                    // 그 외의 경우 또는 변경 중일 때 - 일반 상태 표시
                    <div className="status-container">
                        {renderEducationBadge()}
                        <div className={`visit-status ${statusInfo.className}`}>
                            {statusInfo.icon}
                            <span>{statusInfo.label}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="visit-item-details">
                <div className="visit-detail">
                    <span className="label">방문 시작:</span>
                    <span className="value">{formatDateTime(visit.visitStartDate)}</span>
                </div>
                {visit.visitEndDate && (
                    <div className="visit-detail">
                        <span className="label">방문 종료:</span>
                        <span className="value">{formatDateTime(visit.visitEndDate)}</span>
                    </div>
                )}
                <div className="visit-detail visit-purpose-detail">
                    <span className="label">방문 목적:</span>
                    <span
                        className={`value purpose-text ${isPurposeExpanded ? 'expanded' : ''}`}
                        onClick={togglePurposeExpand}
                        title={getVisitPurposeText()}
                    >
                        {getVisitPurposeText()}
                    </span>
                </div>
                {showContact && (
                    <div className="visit-detail">
                        <span className="label">연락처:</span>
                        <span className="value">{visit.visitorContact}</span>
                    </div>
                )}
                {visit.personName && (
                    <div className="visit-detail">
                        <span className="label">방문 대상자:</span>
                        <span className="value">{visit.personName}</span>
                    </div>
                )}
                {visit.education && visit.educationDate && (
                    <div className="visit-detail">
                        <span className="label">교육 이수일:</span>
                        <span className="value">{formatDateTime(visit.educationDate)}</span>
                    </div>
                )}
            </div>

        </div>
    );
}, (prevProps, nextProps) => {
    // 최적화를 위한 비교 함수 (이전 props와 다음 props 비교)
    return (
        prevProps.visit.id === nextProps.visit.id &&
        prevProps.visit.status === nextProps.visit.status &&
        prevProps.isPending === nextProps.isPending &&
        prevProps.isMember === nextProps.isMember &&
        prevProps.visit.education === nextProps.visit.education
    );
});

VisitCard.propTypes = {
    visit: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        visitorName: PropTypes.string.isRequired,
        visitorCompany: PropTypes.string,
        visitorContact: PropTypes.string,
        visitStartDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]).isRequired,
        visitEndDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
        visitPurpose: PropTypes.string,
        visitReason: PropTypes.string,
        personName: PropTypes.string,
        status: PropTypes.string.isRequired,
        education: PropTypes.bool,
        educationDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    }).isRequired,
    isMember: PropTypes.bool.isRequired,
    isPending: PropTypes.bool.isRequired,
    statusInfo: PropTypes.shape({
        label: PropTypes.string.isRequired,
        icon: PropTypes.node.isRequired,
        className: PropTypes.string.isRequired
    }).isRequired,
    onStatusChange: PropTypes.func.isRequired,
    showContact: PropTypes.bool
};

export default VisitCard; 