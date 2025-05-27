import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getPasswordStrength } from '../../utils/passwordValidation';
import './PasswordStrengthIndicator.scss';

/**
 * 연속된 숫자가 있는지 확인 (내부 헬퍼 함수)
 * @param {string} password - 검사할 비밀번호
 * @returns {boolean} 연속된 숫자가 있으면 true
 */
const hasConsecutiveNumbers = (password) => {
    // 3자리 이상 연속된 숫자 패턴 검사
    for (let i = 0; i <= password.length - 3; i++) {
        const char1 = password.charAt(i);
        const char2 = password.charAt(i + 1);
        const char3 = password.charAt(i + 2);

        // 숫자인지 확인
        if (/\d/.test(char1) && /\d/.test(char2) && /\d/.test(char3)) {
            const num1 = parseInt(char1);
            const num2 = parseInt(char2);
            const num3 = parseInt(char3);

            // 연속된 숫자인지 확인 (증가 또는 감소)
            if ((num2 === num1 + 1 && num3 === num2 + 1) ||
                (num2 === num1 - 1 && num3 === num2 - 1)) {
                return true;
            }
        }
    }
    return false;
};

/**
 * 비밀번호 강도 표시 컴포넌트
 * @param {Object} props
 * @param {string} props.password - 검사할 비밀번호
 * @param {boolean} props.show - 표시 여부 (기본값: true)
 * @param {boolean} props.showRequirements - 요구사항 체크리스트 표시 여부 (기본값: true)
 * @param {string} props.className - 추가 CSS 클래스
 */
const PasswordStrengthIndicator = ({ password, show = true, showRequirements = true, className = '' }) => {
    const { t } = useTranslation('visit');

    // 비밀번호 강도 계산 (메모이제이션)
    const strengthInfo = useMemo(() => {
        if (!password) return { strength: 'weak', score: 0 };
        return getPasswordStrength(password);
    }, [password]);

    // 강도별 색상 및 텍스트 정의
    const strengthConfig = {
        weak: {
            color: '#e74c3c',
            bgColor: 'rgba(231, 76, 60, 0.1)',
            text: t('passwordStrength.weak'),
            width: '33%'
        },
        medium: {
            color: '#f39c12',
            bgColor: 'rgba(243, 156, 18, 0.1)',
            text: t('passwordStrength.medium'),
            width: '66%'
        },
        strong: {
            color: '#27ae60',
            bgColor: 'rgba(39, 174, 96, 0.1)',
            text: t('passwordStrength.strong'),
            width: '100%'
        }
    };

    // 강도별 요구사항 체크
    const requirements = useMemo(() => {
        if (!password) return [];

        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const hasConsecutive = hasConsecutiveNumbers(password);

        const typeCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars].filter(Boolean).length;

        // 문자 종류에 따른 최소 길이 계산
        let requiredLength;
        if (typeCount >= 3) {
            requiredLength = 8; // 3종류 이상 조합시 8자리
        } else if (typeCount >= 2) {
            requiredLength = 10; // 2종류 조합시 10자리
        } else {
            requiredLength = 10; // 1종류 이하일 때도 10자리 (실제로는 2종류 이상 필요)
        }

        const isLengthSatisfied = password.length >= requiredLength;

        return [
            {
                key: 'length',
                text: isLengthSatisfied
                    ? t('passwordStrength.requirements.minLength.satisfied', { minLength: requiredLength })
                    : t('passwordStrength.requirements.minLength.unsatisfied', { minLength: requiredLength }),
                satisfied: isLengthSatisfied
            },
            {
                key: 'types',
                text: t('passwordStrength.requirements.characterTypes', {
                    count: typeCount
                }),
                satisfied: typeCount >= 2
            },
            {
                key: 'consecutive',
                text: t('passwordStrength.requirements.noConsecutive'),
                satisfied: !hasConsecutive
            }
        ];
    }, [password, t]);

    if (!show || !password) return null;

    const config = strengthConfig[strengthInfo.strength];

    return (
        <div className={`password-strength-indicator ${className}`}>
            {/* 강도 바 */}
            <div className="strength-bar-container">
                <div className="strength-bar-background">
                    <div
                        className="strength-bar-fill"
                        style={{
                            width: config.width,
                            backgroundColor: config.color
                        }}
                    />
                </div>
                <div className="strength-info">
                    <span
                        className="strength-text"
                        style={{ color: config.color }}
                    >
                        {config.text}
                    </span>
                </div>
            </div>

            {/* 요구사항 체크리스트 */}
            {showRequirements && (
                <div className="requirements-list">
                    {requirements.map((req) => (
                        <div
                            key={req.key}
                            className={`requirement-item ${req.satisfied ? 'satisfied' : 'unsatisfied'}`}
                        >
                            <span className="requirement-icon">
                                {req.satisfied ? '✓' : '✗'}
                            </span>
                            <span className="requirement-text">
                                {req.text}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthIndicator; 