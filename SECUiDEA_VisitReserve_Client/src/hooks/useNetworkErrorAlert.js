import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Swal from 'sweetalert2';
import { getColorVariables } from '../utils/cssVariables';

/**
 * 네트워크 오류 알림을 표시하는 커스텀 훅
 * @returns {Function} showNetworkErrorAlert - 네트워크 오류 알림을 표시하는 함수
 */
const useNetworkErrorAlert = () => {
    const { t } = useTranslation('visit');

    /**
     * 네트워크 오류 알림 표시
     * @param {string|React.ReactNode} errorMessage - 표시할 에러 메시지
     * @param {Function} retryHandler - 재시도 버튼 클릭 시 실행할 함수
     * @param {string} title - 알림 제목 (기본값: '네트워크 오류')
     * @param {Object} options - 추가 옵션
     * @param {boolean} options.showCancelButton - 취소 버튼 표시 여부 (기본값: true)
     * @param {boolean} options.allowOutsideClick - 외부 클릭 허용 여부 (기본값: true)
     */
    const showNetworkErrorAlert = useCallback((
        errorMessage,
        retryHandler,
        title = t('common.networkError'),
        options = {}
    ) => {
        const { showCancelButton = true, allowOutsideClick = true } = options;
        // 실시간으로 CSS 변수 값을 가져옴
        const colors = getColorVariables();

        Swal.fire({
            title: title,
            html: typeof errorMessage === 'string'
                ? `<p>${errorMessage}</p><p>${t('common.retryQuestion')}</p>`
                : errorMessage,
            icon: 'error',
            showCancelButton: showCancelButton,
            confirmButtonText: t('common.retry'),
            cancelButtonText: t('common.close'),
            confirmButtonColor: colors.primary,
            cancelButtonColor: colors.textSecondary,
            allowOutsideClick: allowOutsideClick,
            allowEscapeKey: allowOutsideClick
        }).then((result) => {
            if (result.isConfirmed && typeof retryHandler === 'function') {
                retryHandler();
            }
        });
    }, [t]);

    return { showNetworkErrorAlert };
};

export default useNetworkErrorAlert; 