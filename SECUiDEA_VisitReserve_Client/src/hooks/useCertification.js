import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sendTemplateMessage } from '../services/aligoService';

const apiBaseUrl = import.meta.env.VITE_BASE_API_URL;

/**
 * 인증번호 발급 및 전송을 위한 커스텀 훅
 * @param {Object} options - 옵션 객체
 * @param {Function} options.onSuccess - 성공 시 콜백 함수
 * @param {Function} options.onError - 실패 시 콜백 함수
 * @returns {Object} 인증번호 발급 관련 상태와 함수들
 */
export const useCertification = (options = {}) => {
    const { t, i18n } = useTranslation('visit');
    const { onSuccess, onError } = options;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * 인증번호 발급 및 전송
     * @param {Object} params - 인증번호 발급 파라미터
     * @param {string} params.phoneNumber - 휴대폰번호
     * @param {string} params.userId - 사용자 ID (알림톡 전송용)
     * @returns {Promise<Object>} 결과 { success, apiKey, certData, message }
     */
    const createAndSendCertification = async (params) => {
        const { phoneNumber, userId } = params;

        try {
            setLoading(true);
            setError('');

            // 1. 인증번호 발급 API 호출
            const certResponse = await fetch(`${apiBaseUrl}/Account/CreatePasswordCertification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Mobile: phoneNumber
                })
            });

            const certResult = await certResponse.json();

            if (!certResponse.ok || !certResult.isSuccess) {
                throw new Error(certResult.message || t('forgotPassword.error.failed'));
            }

            const apiKey = certResult.data.ApiKey;
            const certData = certResult.data.data.certificateData;

            // 2. 알림톡 발송
            const currentLang = i18n.language || 'ko';
            const templateName = currentLang === 'ko' ? 'CERT' : `CERT_${currentLang}`;

            const templateVariables = {
                "인증번호": certData
            };

            const aligoResponse = await sendTemplateMessage(
                apiKey,
                templateName,
                phoneNumber,
                userId,
                templateVariables
            );

            if (!aligoResponse.ok) {
                throw new Error(t('common.kakaoMessageError'));
            }

            // 성공 처리
            const result = {
                success: true,
                apiKey,
                certData,
                message: t('forgotPassword.certSent')
            };

            onSuccess?.(result);
            return result;

        } catch (err) {
            const errorMessage = err.message || t('forgotPassword.error.failed');
            setError(errorMessage);

            const errorResult = {
                success: false,
                message: errorMessage,
                error: err
            };

            onError?.(errorResult);
            return errorResult;
        } finally {
            setLoading(false);
        }
    };

    /**
     * 인증번호 확인
     * @param {Object} params - 인증번호 확인 파라미터
     * @param {string} params.userId - 사용자 ID
     * @param {string} params.phoneNumber - 휴대폰번호
     * @param {string} params.certNumber - 인증번호
     * @returns {Promise<Object>} 결과 { success, apiKey, message }
     */
    const verifyCertification = async (params) => {
        const { userId, phoneNumber, certNumber } = params;

        try {
            setLoading(true);
            setError('');

            // 인증번호 확인 API 호출
            const certCheckResponse = await fetch(`${apiBaseUrl}/Account/CheckPasswordCertification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    Id: userId,
                    Mobile: phoneNumber,
                    CertificateData: certNumber
                })
            });

            const certCheckResult = await certCheckResponse.json();

            if (!certCheckResponse.ok || !certCheckResult.isSuccess) {
                throw new Error(certCheckResult.message || t('forgotPassword.error.certFailed'));
            }

            // 성공 처리
            const result = {
                success: true,
                apiKey: certCheckResult.data.ApiKey,
                message: t('forgotPassword.success')
            };

            onSuccess?.(result);
            return result;

        } catch (err) {
            const errorMessage = err.message || t('forgotPassword.error.certFailed');
            setError(errorMessage);

            const errorResult = {
                success: false,
                message: errorMessage,
                error: err
            };

            onError?.(errorResult);
            return errorResult;
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
        createAndSendCertification,
        verifyCertification,
        clearError
    };
};

export default useCertification; 