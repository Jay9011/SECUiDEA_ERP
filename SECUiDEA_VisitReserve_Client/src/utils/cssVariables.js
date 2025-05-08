/**
 * CSS 변수를 JavaScript에서 사용하기 위한 유틸리티 함수
 */

/**
 * CSS 변수 값을 가져오는 함수
 * @param {string} variableName - 변수 이름 (--로 시작하는 CSS 변수명)
 * @param {HTMLElement} element - 변수를 가져올 요소 (기본값: document.documentElement)
 * @returns {string} CSS 변수 값
 */
export const getCssVariable = (variableName, element = document.documentElement) => {
    // CSS 변수명에 -- 접두사가 없으면 추가
    const cssVarName = variableName.startsWith('--') ? variableName : `--${variableName}`;
    return getComputedStyle(element).getPropertyValue(cssVarName).trim();
};

/**
 * 색상 관련 CSS 변수들을 객체로 반환
 * 필요할 때마다 최신 값을 가져옵니다.
 */
export const getColorVariables = () => {
    return {
        primary: getCssVariable('--primary-color'),
        secondary: getCssVariable('--secondary-color'),
        danger: getCssVariable('--danger-color'),
        accent: getCssVariable('--accent-color'),
        background: getCssVariable('--background-color'),
        lightGray: getCssVariable('--light-gray'),
        textColor: getCssVariable('--text-color'),
        textColorLight: getCssVariable('--text-color-light'),
        textColorDark: getCssVariable('--text-color-dark'),
        lightText: getCssVariable('--light-text'),
        textPrimary: getCssVariable('--text-primary'),
        textSecondary: getCssVariable('--text-secondary'),
        textPlaceholder: getCssVariable('--text-placeholder'),
        primaryColorText: getCssVariable('--primary-color-text'),
        borderColor: getCssVariable('--border-color'),
        success: getCssVariable('--success-color'),
        warning: getCssVariable('--warning-color'),
        error: getCssVariable('--error-color')
    };
};

export default getColorVariables; 