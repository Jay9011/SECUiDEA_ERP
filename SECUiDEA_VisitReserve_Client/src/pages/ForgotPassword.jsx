import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldHalf, Lock, User, Phone, Clock, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePasswordChange } from '../hooks/usePasswordChange';
import { useCertification } from '../hooks/useCertification';
import { getTranslatedErrorMessage } from '../utils/translation';
import Swal from 'sweetalert2';
import { getColorVariables } from '../utils/cssVariables';
import './ForgotPassword.scss';

const apiBaseUrl = import.meta.env.VITE_BASE_API_URL;

const ForgotPassword = () => {
    const { t } = useTranslation('visit');
    const navigate = useNavigate();
    const colors = getColorVariables();

    // 단계 (1: 아이디/휴대폰 입력, 2: 인증번호 입력, 3: 비밀번호 변경)
    const [step, setStep] = useState(1);

    // 폼 데이터
    const [userId, setUserId] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [certNumber, setCertNumber] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // 상태 관리
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5분 = 300초
    const [timerActive, setTimerActive] = useState(false);
    const [certVerified, setCertVerified] = useState(false); // 인증번호 확인 완료 상태
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 인증 관련 상태
    const [authType, setAuthType] = useState(''); // 인증 유형
    const [passwordApiKey, setPasswordApiKey] = useState(''); // 비밀번호 변경용 API 키

    // 인증번호 발급/확인 훅
    const {
        loading: certLoading,
        createAndSendCertification,
        verifyCertification
    } = useCertification();

    // 비밀번호 변경 훅 - API 설정을 동적으로 생성
    const passwordChangeApiConfig = {
        url: `${apiBaseUrl}/S1Account/SetPassword`,
        buildHeaders: (params) => ({
            'Content-Type': 'application/json',
            'X-API-KEY': params.apiKey
        }),
        buildBody: (params) => JSON.stringify({
            Role: params.authType,
            ID: params.userId,
            Password: params.newPassword
        })
    };

    const {
        loading: passwordChangeLoading,
        changePassword
    } = usePasswordChange({
        apiConfig: passwordChangeApiConfig,
        onSuccess: ({ message }) => {
            Swal.fire({
                icon: 'success',
                iconColor: colors.success,
                title: t('common.confirm'),
                text: message,
                confirmButtonText: t('common.ok'),
                confirmButtonColor: colors.primary
            }).then(() => {
                navigate('/login');
            });
        },
        onError: ({ message }) => {
            Swal.fire({
                icon: 'error',
                iconColor: colors.error,
                title: t('common.warning'),
                text: message,
                confirmButtonText: t('common.ok'),
                confirmButtonColor: colors.primary
            });
        }
    });

    // 타이머 관리
    useEffect(() => {
        let timer;
        if (timerActive && timeLeft > 0 && !certVerified) {
            timer = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
        } else if (timeLeft === 0 && !certVerified) {
            setTimerActive(false);
            setError(t('forgotPassword.certExpired'));
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [timerActive, timeLeft, certVerified, t]);

    // 첫 단계 폼 제출 처리 - 계정 확인 및 인증번호 발송
    const handleSubmitStep1 = async (e) => {
        e.preventDefault();

        if (!userId || !phoneNumber) {
            setError(t('forgotPassword.error.emptyFields'));
            return;
        }

        try {
            setLoading(true);
            setError('');

            // 1. 계정 확인 API 호출
            const accountCheckResponse = await fetch(`${apiBaseUrl}/S1Account/FindUserByIdAndMobile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ID: userId,
                    Mobile: phoneNumber
                })
            });

            const accountCheckResult = await accountCheckResponse.json();

            if (!accountCheckResponse.ok || !accountCheckResult.isSuccess) {
                const errorMessage = getTranslatedErrorMessage(accountCheckResult, t, 'forgotPassword.error.failed');
                throw new Error(errorMessage);
            }

            // 계정 확인 성공 시 AuthType 저장
            setAuthType(accountCheckResult.data.AuthType);

            // 2. 인증번호 발급 및 전송
            const certResult = await createAndSendCertification({
                phoneNumber,
                userId
            });

            if (certResult.success) {
                // 성공 시 다음 단계로 이동
                setStep(2);
                setTimeLeft(300); // 5분 타이머 설정
                setTimerActive(true);
            } else {
                setError(certResult.message);
            }

        } catch (err) {
            setError(err.message || t('forgotPassword.error.failed'));
        } finally {
            setLoading(false);
        }
    };

    // 두번째 단계 폼 제출 처리 - 인증번호 확인
    const handleSubmitStep2 = async (e) => {
        e.preventDefault();

        if (!certNumber) {
            setError(t('forgotPassword.error.emptyCert'));
            return;
        }

        const certResult = await verifyCertification({
            userId,
            phoneNumber,
            certNumber
        });

        if (certResult.success) {
            // 인증 성공 시 처리
            setCertVerified(true);
            setTimerActive(false);
            setPasswordApiKey(certResult.apiKey); // 비밀번호 변경용 API 키 저장
            setError(''); // 에러 메시지 클리어
        } else {
            setError(certResult.message);
        }
    };

    // 세번째 단계 폼 제출 처리 - 비밀번호 변경
    const handleSubmitStep3 = async (e) => {
        e.preventDefault();

        const result = await changePassword({
            userId,
            newPassword,
            confirmPassword,
            authType,
            apiKey: passwordApiKey
        });

        return result;
    };

    // 인증번호 재요청
    const handleResendCert = async () => {
        if (!userId || !phoneNumber) {
            setError(t('forgotPassword.error.emptyFields'));
            return;
        }

        const certResult = await createAndSendCertification({
            phoneNumber,
            userId
        });

        if (certResult.success) {
            // 타이머 재설정
            setTimeLeft(300);
            setTimerActive(true);
            setError(''); // 에러 메시지 클리어
        } else {
            setError(certResult.message);
        }
    };

    // 타이머 포맷팅 (mm:ss)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-container">
                <div className="forgot-password-box">
                    <div className="forgot-password-logo">
                        <ShieldHalf size={40} />
                    </div>
                    <h2>{t('forgotPassword.title')}</h2>
                    <p className="forgot-password-subtitle">
                        {step === 1
                            ? t('forgotPassword.subtitle.step1')
                            : certVerified
                                ? t('forgotPassword.subtitle.step3')
                                : t('forgotPassword.subtitle.step2')}
                    </p>

                    {error && <div className="error-message">{error}</div>}

                    {step === 1 ? (
                        <form onSubmit={handleSubmitStep1}>
                            <div className="form-group">
                                <div className="input-icon">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={userId}
                                    onChange={(e) => setUserId(e.target.value)}
                                    placeholder={t('forgotPassword.userId')}
                                    disabled={loading || certLoading}
                                />
                            </div>

                            <div className="form-group">
                                <div className="input-icon">
                                    <Phone size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder={t('forgotPassword.phoneNumber')}
                                    disabled={loading || certLoading}
                                />
                            </div>

                            <button
                                type="submit"
                                className="submit-btn"
                                disabled={loading || certLoading}
                            >
                                {(loading || certLoading) ? t('common.loading') : t('forgotPassword.nextButton')}
                            </button>

                            <div className="form-options">
                                <a href="#" onClick={() => navigate('/login')} className="back-to-login">
                                    {t('forgotPassword.backToLogin')}
                                </a>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={certVerified ? handleSubmitStep3 : handleSubmitStep2}>
                            <div className="form-group cert-group">
                                <div className="input-icon">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="text"
                                    value={certNumber}
                                    onChange={(e) => setCertNumber(e.target.value)}
                                    placeholder={t('forgotPassword.certNumber')}
                                    disabled={loading || certLoading || certVerified}
                                    className={certVerified ? 'verified' : ''}
                                />
                                {!certVerified && (
                                    <div className="timer">
                                        <Clock size={16} />
                                        <span className={timeLeft < 60 ? 'time-warning' : ''}>
                                            {formatTime(timeLeft)}
                                        </span>
                                    </div>
                                )}
                                {certVerified && (
                                    <div className="verified-badge">
                                        ✓ {t('forgotPassword.verified')}
                                    </div>
                                )}
                            </div>

                            {!certVerified && (
                                <button
                                    type="submit"
                                    className="submit-btn"
                                    disabled={loading || certLoading || !timerActive}
                                >
                                    {(loading || certLoading) ? t('common.loading') : t('forgotPassword.verifyButton')}
                                </button>
                            )}

                            {certVerified && (
                                <>
                                    <div className="form-group password-group">
                                        <div className="input-icon">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder={t('forgotPassword.newPassword')}
                                            disabled={loading || passwordChangeLoading}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            tabIndex="-1"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    <div className="form-group password-group">
                                        <div className="input-icon">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder={t('forgotPassword.confirmPassword')}
                                            disabled={loading || passwordChangeLoading}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            tabIndex="-1"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>

                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={loading || passwordChangeLoading}
                                    >
                                        {(loading || passwordChangeLoading) ? t('common.loading') : t('forgotPassword.changePasswordButton')}
                                    </button>
                                </>
                            )}

                            <div className="form-options">
                                {!certVerified && (
                                    <button
                                        type="button"
                                        onClick={handleResendCert}
                                        className="resend-btn"
                                        disabled={loading || certLoading || (timerActive && timeLeft > 240)} // 1분 이상 남았을 때는 재전송 비활성화
                                    >
                                        {t('forgotPassword.resendCert')}
                                    </button>
                                )}
                                <a href="#" onClick={() => setStep(1)} className="back-btn">
                                    {t('forgotPassword.backButton')}
                                </a>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword; 