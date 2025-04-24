import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";

// 스타일
import './VisitCard.scss';

/**
 * 방문 아이템 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.icon - 방문 아이템 아이콘 (선택사항)
 * @param {string} props.title - 방문 아이템 제목 (방문자 이름이나 시간 등)
 * @param {string} props.subtitle - 방문 아이템 부제목 (방문 장소나 목적 등)
 * @param {string} props.status - 방문 상태 텍스트
 * @param {'pending' | 'approved' | 'rejected'} props.statusType - 방문 상태 타입 (기본값: 'pending')
 * @returns {JSX.Element} 방문 아이템 컴포넌트
 */
export const VisitItem = ({ icon, title, subtitle, status, statusType = 'pending' }) => (
    <div className="visit-item">
        {icon || <Clock size={20} className="visit-item_icon" />}
        <div className="visit-item_details">
            <p className="visit-item_title">{title}</p>
            <p className="visit-item_subtitle">{subtitle}</p>
        </div>
        <div className={`visit-item_status visit-item_status--${statusType}`}>
            {status}
        </div>
    </div>
);

/**
 * 방문 카드 컴포넌트
 * @param {Object} props
 * @param {string} props.title - 카드 제목
 * @param {Array} props.items - 방문 아이템 배열
 * @param {string} props.moreLink - 더보기 링크 경로
 * @param {Function} props.onViewMore - 더보기 클릭 핸들러
 * @param {string} props.moreLinkText - 더보기 링크 텍스트
 */
const VisitCard = ({
    title = '방문 예약',
    items = [],
    moreLink,
    onViewMore,
    moreLinkText = '모든 방문 일정 보기'
}) => {
    return (
        <div className="visit-card">
            <div className="visit-card_header">
                <h3>{title}</h3>
            </div>

            <div className="visit-card_body">
                {
                    items.length > 0 ? (
                        <>
                            {items.map((item, index) => (
                                <VisitItem key={index}
                                    title={item.title}
                                    subtitle={item.subtitle}
                                    status={item.status}
                                    statusType={item.statusType}
                                    icon={item.icon}
                                />
                            ))}

                            {moreLink && (
                                <div className="visit-card_more">
                                    <Link to={moreLink}
                                        className="visit-card_more"
                                        onClick={onViewMore}
                                    >
                                        {moreLinkText}
                                        <ArrowRight size={16} />
                                    </Link>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-lg">
                            <p>방문 일정이 없습니다.</p>
                        </div>
                    )
                }
            </div>
        </div>

    );
}

export default VisitCard;