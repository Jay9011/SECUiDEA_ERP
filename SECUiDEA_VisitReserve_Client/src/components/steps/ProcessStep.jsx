// 스타일
import './ProcessStep.scss';

/**
 * 프로세스 단계 컴포넌트
 * @param {Object} props
 * @param {React.ReactNode} props.icon - 단계 아이콘
 * @param {string} props.title - 단계 제목
 * @param {string} props.description - 단계 설명
 * @param {number} props.step - 단계 번호 (1, 2, 3, ...)
 * @param {boolean} props.isActive - 활성화 여부
 * @param {string} props.className - 추가 클래스명
 */
const ProcessStep = ({
    icon,
    title,
    description,
    step,
    isActive = false,
    className = ''
}) => {
    return (
        <div
            className={`process-card ${isActive ? 'active' : ''} ${className}`}
            data-step={step}
        >
            <div className="process-icon">
                {icon}
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
};

/**
 * 프로세스 단계 목록 컴포넌트
 * @param {Object} props
 * @param {Array} props.steps - 단계 정보 배열 [{icon, title, description, step, isActive}]
 * @param {string} props.className - 추가 클래스명
 */
export const ProcessSteps = ({
    steps = [],
    className = ''
}) => {
    return (
        <div className={`grid grid-3 ${className}`}>
            {steps.map((step, index) => (
                <ProcessStep
                    key={index}
                    icon={step.icon}
                    title={step.title}
                    description={step.description}
                    step={step.step || index + 1}
                    isActive={step.isActive}
                />
            ))}
        </div>
    );
};

export default ProcessStep;