import { CheckCircle } from 'lucide-react';

/**
 * 단일 특징 아이템 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.icon - 특징 아이콘
 * @param {string} props.title - 특징 제목
 * @param {string} props.description - 특징 설명
 * @param {string} props.className - 추가 클래스명
 */
export const FeatureItem = ({
    icon = <CheckCircle size={16} />,
    title,
    description,
    className = ''
}) => {
    return (
        <li className={`feature-item ${className}`}>
            <div className="feature-icon">
                {icon}
            </div>
            <div className="feature-item__content">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </li>
    );
};

/**
 * 특징 목록 컴포넌트
 * @param {Object} props
 * @param {Array} props.features - 특징 정보 배열 [{icon, title, description}]
 * @param {string} props.className - 추가 클래스명
 */
const FeatureList = ({
    features = [],
    className = ''
}) => {
    return (
        <ul className={`feature-list ${className}`}>
            {features.map((feature, index) => (
                <FeatureItem
                    key={index}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                />
            ))}
        </ul>
    );
};

export default FeatureList;