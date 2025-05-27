/**
 * 비밀번호 유효성 검사 유틸리티
 */

/**
 * 연속된 숫자가 있는지 확인
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
 * 비밀번호의 문자 종류 개수를 계산
 * @param {string} password - 검사할 비밀번호
 * @returns {Object} 각 문자 종류의 포함 여부와 총 종류 수
 */
const getPasswordCharacterTypes = (password) => {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const typeCount = [hasLowercase, hasUppercase, hasNumbers, hasSpecialChars]
        .filter(Boolean).length;

    return {
        hasLowercase,
        hasUppercase,
        hasNumbers,
        hasSpecialChars,
        typeCount
    };
};

/**
 * 비밀번호 유효성 검사
 * @param {string} password - 새 비밀번호
 * @param {string} confirmPassword - 비밀번호 확인
 * @param {Object} options - 추가 옵션
 * @param {string} options.userId - 사용자 ID (선택사항, ID와 동일한지 검사용)
 * @param {Function} options.t - 번역 함수
 * @returns {Object} 검사 결과 { isValid, errorMessage }
 */
export const validatePassword = (password, confirmPassword, options = {}) => {
    const { userId, t } = options;

    // 빈 값 검사
    if (!password || !confirmPassword) {
        return {
            isValid: false,
            errorMessage: t ? t('passwordValidation.error.emptyPassword') : '비밀번호를 입력해주세요.'
        };
    }

    // 비밀번호 일치 검사
    if (password !== confirmPassword) {
        return {
            isValid: false,
            errorMessage: t ? t('passwordValidation.error.passwordMismatch') : '비밀번호가 일치하지 않습니다.'
        };
    }

    // 문자 종류 분석
    const charTypes = getPasswordCharacterTypes(password);

    // 최소 길이 검사 (조합에 따라 다름)
    let minLength;
    if (charTypes.typeCount >= 3) {
        minLength = 8; // 3종류 이상 조합시 8자리
    } else if (charTypes.typeCount >= 2) {
        minLength = 10; // 2종류 이상 조합시 10자리
    } else {
        return {
            isValid: false,
            errorMessage: t ? t('passwordValidation.error.insufficientTypes') : '영문 대/소문자, 숫자, 특수문자 중 최소 2종류 이상 조합해주세요.'
        };
    }

    if (password.length < minLength) {
        return {
            isValid: false,
            errorMessage: t
                ? t('passwordValidation.error.tooShort', { minLength, typeCount: charTypes.typeCount })
                : `${charTypes.typeCount}종류 조합시 최소 ${minLength}자리 이상이어야 합니다.`
        };
    }

    // 연속된 숫자 검사
    if (hasConsecutiveNumbers(password)) {
        return {
            isValid: false,
            errorMessage: t ? t('passwordValidation.error.consecutiveNumbers') : '연속된 숫자 3개 이상 사용할 수 없습니다.'
        };
    }

    // 사용자 ID와 동일한지 검사 (ID가 제공된 경우)
    if (userId && password.toLowerCase() === userId.toLowerCase()) {
        return {
            isValid: false,
            errorMessage: t ? t('passwordValidation.error.sameAsUserId') : '비밀번호는 아이디와 동일할 수 없습니다.'
        };
    }

    return { isValid: true };
};

/**
 * 비밀번호 강도 평가 (선택사항 - UI에서 강도 표시용)
 * @param {string} password - 검사할 비밀번호
 * @returns {Object} 강도 정보 { strength: 'weak'|'medium'|'strong', score: 0-100 }
 */
export const getPasswordStrength = (password) => {
    if (!password) return { strength: 'weak', score: 0 };

    const charTypes = getPasswordCharacterTypes(password);
    let score = 0;

    // 길이 점수 (최대 30점)
    if (password.length >= 12) score += 30;
    else if (password.length >= 10) score += 25;
    else if (password.length >= 8) score += 20;
    else score += password.length * 2;

    // 문자 종류 점수 (최대 40점)
    score += charTypes.typeCount * 10;

    // 복잡성 보너스 (최대 30점)
    if (charTypes.typeCount >= 4) score += 30;
    else if (charTypes.typeCount >= 3) score += 20;
    else if (charTypes.typeCount >= 2) score += 10;

    // 연속된 숫자 패널티
    if (hasConsecutiveNumbers(password)) score -= 20;

    // 점수 정규화 (0-100)
    score = Math.min(100, Math.max(0, score));

    let strength;
    if (score >= 80) strength = 'strong';
    else if (score >= 50) strength = 'medium';
    else strength = 'weak';

    return { strength, score };
}; 