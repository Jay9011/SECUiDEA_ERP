import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldHalf, Lock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { getColorVariables } from '../utils/cssVariables';
import { api } from '../utils/api';
import { usePasswordChange } from '../hooks/usePasswordChange';
import PasswordStrengthIndicator from '../components/features/PasswordStrengthIndicator';
import Swal from 'sweetalert2';

import './ChangePassword.scss';

/**
 * 로그인한 사용자의 비밀번호 변경 페이지
 */
const ChangePassword = () => {
    const { t } = useTranslation('visit');
    const navigate = useNavigate();
    const { user } = useAuth();
    const colors = getColorVariables();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showRequirements, setShowRequirements] = useState(true);

    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트 (useEffect 사용)
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    // 로그인한 사용자용 비밀번호 변경 API 설정 - JWT 인증 사용
    const passwordChangeApiConfig = {
        url: '/S1Account/UpdatePassword',
        buildHeaders: () => ({}), // api.js에서 자동으로 Authorization 헤더 추가
        buildBody: (params) => JSON.stringify({
            Password: params.newPassword,
            CurrentPassword: params.currentPassword
        }),
        customFetch: async (url, options) => {
            const result = await api.post(url, {
                body: options.body,
                headers: options.headers
            }, true);

            return result;
        }
    };

    // 비밀번호 변경 훅 사용 (JWT 인증)
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
                iconColor: colors.success,
                text: message,
                confirmButtonText: t('common.ok'),
                confirmButtonColor: colors.primary
            }).then(() => {
                navigate('/'); // 홈으로 이동
            });
        },
        onError: ({ message }) => {
            console.log(message);
        }
    });

    // 폼 제출 처리
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!currentPassword) {
            Swal.fire({
                icon: 'warning',
                iconColor: colors.warning,
                text: t('userSettings.passwordChange.error.emptyCurrentPassword'),
                confirmButtonText: t('common.ok'),
                confirmButtonColor: colors.primary
            });
            return;
        }

        // 에러 상태 초기화
        clearError();

        const result = await changePassword({
            userId: user?.id,
            newPassword,
            confirmPassword,
            authType: user?.role,
            currentPassword
        });

        return result;
    };

    // 로그인하지 않은 경우 로딩 표시 또는 null 반환
    if (!user) {
        return null;
    }

    return (
        <div className="change-password-page">
            <div className="change-password-container">
                <div className="change-password-box">
                    <div className="change-password-logo">
                        <ShieldHalf size={40} />
                    </div>
                    <h2>{t('userSettings.passwordChange.title')}</h2>
                    <p className="change-password-subtitle">
                        {t('userSettings.passwordChange.description')}
                    </p>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        {/* 현재 비밀번호 섹션 */}
                        <div className="password-section current-password-section">
                            <div className="form-group">
                                <label className="form-label">
                                    {t('userSettings.passwordChange.currentPassword')}
                                </label>
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
                                        className="password-input"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        disabled={loading}
                                        tabIndex="-1"
                                    >
                                        {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 새 비밀번호 섹션 */}
                        <div className="password-section new-password-section">
                            <div className="form-group">
                                <label className="form-label">
                                    {t('forgotPassword.newPassword')}
                                </label>
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
                                        className="password-input"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        disabled={loading}
                                        tabIndex="-1"
                                    >
                                        {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            {/* 비밀번호 강도 표시기 */}
                            <PasswordStrengthIndicator
                                password={newPassword}
                                show={newPassword.length > 0}
                                showRequirements={showRequirements}
                            />

                            <div className="form-group">
                                <label className="form-label">
                                    {t('forgotPassword.confirmPassword')}
                                </label>
                                <div className="input-wrapper">
                                    <div className="input-icon">
                                        <Lock size={20} />
                                    </div>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onFocus={() => setShowRequirements(false)}
                                        onBlur={() => setShowRequirements(true)}
                                        placeholder={t('userSettings.passwordChange.confirmPasswordPlaceholder')}
                                        disabled={loading}
                                        className="password-input"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        disabled={loading}
                                        tabIndex="-1"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => navigate(-1)}
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

export default ChangePassword; 