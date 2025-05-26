import { useState } from 'react';
import { Eye, EyeOff, Lock, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePasswordChange } from '../hooks/usePasswordChange';
import Swal from 'sweetalert2';
import PropTypes from 'prop-types';

import './PasswordChangeModal.scss';

const apiBaseUrl = import.meta.env.VITE_BASE_API_URL;

/**
 * 비밀번호 변경 모달 컴포넌트
 * @param {Object} props 
 * @param {boolean} props.isOpen - 모달 열림 상태
 * @param {Function} props.onClose - 모달 닫기 함수
 * @param {string} props.userId - 사용자 ID
 * @param {string} props.authType - 인증 유형 (Role)
 */
const PasswordChangeModal = ({ isOpen, onClose, userId, authType }) => {
    const { t } = useTranslation('visit');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 로그인한 사용자용 비밀번호 변경 API 설정
    const passwordChangeApiConfig = {
        url: `${apiBaseUrl}/S1Account/SetPassword`,
        buildHeaders: () => ({
            'Content-Type': 'application/json'
            // 로그인한 사용자의 경우 API Key 대신 세션/토큰 인증 사용
        }),
        buildBody: (params) => JSON.stringify({
            Role: params.authType,
            ID: params.userId,
            Password: params.newPassword,
            CurrentPassword: params.currentPassword
        })
    };

    // 비밀번호 변경 훅 사용 (API Key 사용하지 않음)
    const {
        loading,
        error,
        changePassword,
        clearError
    } = usePasswordChange({
        apiConfig: passwordChangeApiConfig,
        onSuccess: ({ message }) => {
            Swal.fire({
                icon: 'success',
                title: t('common.confirm'),
                text: message,
                confirmButtonText: t('common.ok')
            }).then(() => {
                handleClose();
            });
        },
        onError: ({ message }) => {
            Swal.fire({
                icon: 'error',
                title: t('common.warning'),
                text: message,
                confirmButtonText: t('common.ok')
            });
        }
    });

    // 모달 닫기 처리
    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        clearError();
        onClose();
    };

    // 폼 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentPassword) {
            Swal.fire({
                icon: 'warning',
                title: t('common.warning'),
                text: t('userSettings.passwordChange.error.emptyCurrentPassword'),
                confirmButtonText: t('common.ok')
            });
            return;
        }

        const result = await changePassword({
            userId,
            newPassword,
            confirmPassword,
            authType,
            currentPassword
        });

        return result;
    };

    if (!isOpen) return null;

    return (
        <div className="password-change-modal-overlay" onClick={handleClose}>
            <div className="password-change-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{t('userSettings.passwordChange.title')}</h3>
                    <button className="close-btn" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* 현재 비밀번호 */}
                        <div className="form-group password-group">
                            <label>{t('userSettings.passwordChange.currentPassword')}</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder={t('userSettings.passwordChange.currentPasswordPlaceholder')}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* 새 비밀번호 */}
                        <div className="form-group password-group">
                            <label>{t('forgotPassword.newPassword')}</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder={t('userSettings.passwordChange.newPasswordPlaceholder')}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* 비밀번호 확인 */}
                        <div className="form-group password-group">
                            <label>{t('forgotPassword.confirmPassword')}</label>
                            <div className="input-wrapper">
                                <div className="input-icon">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder={t('userSettings.passwordChange.confirmPasswordPlaceholder')}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? t('common.loading') : t('forgotPassword.changePasswordButton')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

PasswordChangeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    authType: PropTypes.string.isRequired
};

export default PasswordChangeModal; 