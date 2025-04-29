import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Clock, CheckCircle, X, AlertCircle, Loader2 } from 'lucide-react';

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
    // 날짜 및 시간 포맷팅 함수
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString();
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
                    <button
                        className="visit-status-button status-pending"
                        onClick={() => onStatusChange(visit.id, 'approved')}
                        title="클릭하여 승인하기"
                    >
                        <Clock size={18} />
                        <span>승인 대기</span>
                    </button>
                ) : (
                    // 그 외의 경우 또는 변경 중일 때 - 일반 상태 표시
                    <div className={`visit-status ${statusInfo.className}`}>
                        {statusInfo.icon}
                        <span>{statusInfo.label}</span>
                    </div>
                )}
            </div>

            <div className="visit-item-details">
                <div className="visit-detail">
                    <span className="label">방문 일자:</span>
                    <span className="value">{formatDate(visit.visitStartDate)}</span>
                </div>
                <div className="visit-detail">
                    <span className="label">방문 시간:</span>
                    <span className="value">{formatTime(visit.visitStartDate)}</span>
                </div>
                <div className="visit-detail">
                    <span className="label">방문 목적:</span>
                    <span className="value">{visit.visitPurpose || visit.visitReason}</span>
                </div>
                {showContact && (
                    <div className="visit-detail">
                        <span className="label">연락처:</span>
                        <span className="value">{visit.visitorContact}</span>
                    </div>
                )}
                {visit.personName && (
                    <div className="visit-detail">
                        <span className="label">담당자:</span>
                        <span className="value">{visit.personName}</span>
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
        prevProps.isMember === nextProps.isMember
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
        status: PropTypes.string.isRequired
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