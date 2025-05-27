/**
 * API 메시지 번역 유틸리티
 */

/**
 * API 메시지를 번역된 메시지로 변환
 * @param {string} message - API에서 받은 메시지
 * @param {Function} t - react-i18next의 번역 함수
 * @param {string} type - 'success' 또는 'error'
 * @returns {string} 번역된 메시지
 */
export const translateApiMessage = (message, t, type = 'errors') => {
    // API 키 형식인지 확인 (공백이나 특수문자가 없는 camelCase)
    if (message && /^[a-zA-Z][a-zA-Z0-9]*$/.test(message)) {
        const translationKey = `api.${type}.${message}`;
        const translatedMessage = t(translationKey);

        // 번역이 존재하면 번역된 메시지, 없으면 원본 메시지 반환
        return translatedMessage !== translationKey ? translatedMessage : message;
    }

    // 키 형식이 아니면 원본 메시지 반환
    return message;
};

/**
 * API 응답에서 에러 메시지를 추출하고 번역
 * @param {Object} result - API 응답 객체
 * @param {Function} t - react-i18next의 번역 함수
 * @param {string} fallbackKey - 기본 fallback 번역 키
 * @returns {string} 번역된 에러 메시지
 */
export const getTranslatedErrorMessage = (result, t, fallbackKey = 'common.errors') => {
    const rawMessage = result?.message || t(fallbackKey);
    return translateApiMessage(rawMessage, t, 'errors');
};

/**
 * API 응답에서 성공 메시지를 추출하고 번역
 * @param {Object} result - API 응답 객체
 * @param {Function} t - react-i18next의 번역 함수
 * @param {string} fallbackKey - 기본 fallback 번역 키
 * @returns {string} 번역된 성공 메시지
 */
export const getTranslatedSuccessMessage = (result, t, fallbackKey = 'common.success') => {
    const rawMessage = result?.message || t(fallbackKey);
    return translateApiMessage(rawMessage, t, 'success');
}; 