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
                {showContact && (
                    <div className="visit-detail">
                        <span className="label">연락처:</span>
                        <span className="value">{visit.visitorContact}</span>
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
    /** 방문 데이터 객체 */
    visit: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        visitorName: PropTypes.string.isRequired,
        visitorCompany: PropTypes.string,
        visitorContact: PropTypes.string,
        visitDate: PropTypes.string.isRequired,
        visitTime: PropTypes.string.isRequired,
        visitPurpose: PropTypes.string,
        status: PropTypes.string.isRequired
    }).isRequired,
    /** 사용자가 Member인지 여부 */
    isMember: PropTypes.bool.isRequired,
    /** 상태 변경 중인지 여부 */
    isPending: PropTypes.bool.isRequired,
    /** 상태 정보 (아이콘, 레이블, 클래스명) */
    statusInfo: PropTypes.shape({
        label: PropTypes.string.isRequired,
        icon: PropTypes.node.isRequired,
        className: PropTypes.string.isRequired
    }).isRequired,
    /** 상태 변경 핸들러 함수 */
    onStatusChange: PropTypes.func.isRequired,
    /** 연락처 표시 여부 */
    showContact: PropTypes.bool
};

export default VisitCard; 