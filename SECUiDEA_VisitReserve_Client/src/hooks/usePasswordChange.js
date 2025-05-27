import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getTranslatedErrorMessage, getTranslatedSuccessMessage } from '../utils/translation';
import { validatePassword } from '../utils/passwordValidation';

/**
 * 비밀번호 변경을 위한 커스텀 훅
 * @param {Object} options - 옵션 객체
 * @param {Function} options.onSuccess - 성공 시 콜백 함수
 * @param {Function} options.onError - 실패 시 콜백 함수
 * @param {Object} options.apiConfig - API 설정 정보
 * @param {string} options.apiConfig.url - API URL
 * @param {Function} options.apiConfig.buildHeaders - 헤더 생성 함수
 * @param {Function} options.apiConfig.buildBody - 바디 생성 함수
 * @param {Function} options.apiConfig.customFetch - 커스텀 fetch 함수 (선택사항)
 * @returns {Object} 비밀번호 변경 관련 상태와 함수들
 */
export const usePasswordChange = (options = {}) => {
    const { t } = useTranslation('visit');
    const { onSuccess, onError, apiConfig } = options;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * 비밀번호 변경 API 호출
     * @param {Object} params - 비밀번호 변경 파라미터
     * @returns {Promise<Object>} 결과 { success, message }
     */
    const changePassword = async (params) => {
        const { newPassword, confirmPassword, userId } = params;

        try {
            setLoading(true);
            setError('');

            // 비밀번호 유효성 검사
            const validation = validatePassword(newPassword, confirmPassword, { userId, t });
            if (!validation.isValid) {
                const errorMessage = validation.errorMessage;
                setError(errorMessage);
                onError?.({ message: errorMessage });
                return { success: false, message: errorMessage };
            }

            // API 설정이 없으면 에러
            if (!apiConfig || !apiConfig.url) {
                const errorMessage = 'API configuration is required';
                setError(errorMessage);
                onError?.({ message: errorMessage });
                return { success: false, message: errorMessage };
            }

            // API 요청 헤더와 바디 생성
            const headers = apiConfig.buildHeaders ? apiConfig.buildHeaders(params) : {
                'Content-Type': 'application/json'
            };

            const body = apiConfig.buildBody ? apiConfig.buildBody(params) : JSON.stringify(params);

            let response;
            let result;

            // 커스텀 fetch 함수가 있으면 사용, 없으면 기본 fetch 사용
            if (apiConfig.customFetch) {
                result = await apiConfig.customFetch(apiConfig.url, {
                    method: 'POST',
                    headers,
                    body
                });

                if (!result.isSuccess) {
                    const errorMessage = getTranslatedErrorMessage(result, t, 'forgotPassword.error.passwordChangeFailed');
                    setError(errorMessage);
                    onError?.({ message: errorMessage, result });
                    return { success: false, message: errorMessage };
                }
            } else {
                // 기본 fetch 사용
                response = await fetch(apiConfig.url, {
                    method: 'POST',
                    headers,
                    body
                });

                result = await response.json();

                if (!response.ok || !result.isSuccess) {
                    const errorMessage = getTranslatedErrorMessage(result, t, 'forgotPassword.error.passwordChangeFailed');
                    setError(errorMessage);
                    onError?.({ message: errorMessage, result });
                    return { success: false, message: errorMessage };
                }
            }

            // 성공 처리
            const successMessage = getTranslatedSuccessMessage(result, t, 'forgotPassword.passwordChangeSuccess');
            onSuccess?.({ message: successMessage, result });
            return { success: true, message: successMessage };

        } catch (err) {
            const errorMessage = err.message || t('forgotPassword.error.passwordChangeFailed');
            setError(errorMessage);
            onError?.({ message: errorMessage, error: err });
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    /**
     * 에러 상태 초기화
     */
    const clearError = () => {
        setError('');
    };

    return {
        loading,
        error,
        changePassword,
        clearError
    };
};

export default usePasswordChange; 