import { useState } from 'react';
import { Settings, Key } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import PasswordChangeModal from './PasswordChangeModal';

/**
 * 사용자 설정 페이지 예시 컴포넌트
 * PasswordChangeModal 사용법을 보여줍니다.
 */
const UserSettingsExample = () => {
    const { t } = useTranslation('visit');
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // 실제 사용 시에는 로그인한 사용자 정보를 가져와야 합니다.
    const currentUser = {
        userId: 'testuser', // 실제로는 context나 store에서 가져와야 함
        authType: 'USER'     // 실제로는 context나 store에서 가져와야 함
    };

    const handlePasswordChangeClick = () => {
        setIsPasswordModalOpen(true);
    };

    const handlePasswordModalClose = () => {
        setIsPasswordModalOpen(false);
    };

    return (
        <div className="user-settings-page">
            <div className="settings-container">
                <div className="settings-header">
                    <h1>
                        <Settings size={24} />
                        사용자 설정
                    </h1>
                </div>

                <div className="settings-content">
                    <div className="settings-section">
                        <h2>계정 보안</h2>
                        <div className="settings-item">
                            <div className="setting-info">
                                <div className="setting-icon">
                                    <Key size={20} />
                                </div>
                                <div className="setting-details">
                                    <h3>{t('userSettings.passwordChange.title')}</h3>
                                    <p>보안을 위해 정기적으로 비밀번호를 변경하세요.</p>
                                </div>
                            </div>
                            <button
                                className="setting-action-btn"
                                onClick={handlePasswordChangeClick}
                            >
                                {t('forgotPassword.changePasswordButton')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 비밀번호 변경 모달 */}
            <PasswordChangeModal
                isOpen={isPasswordModalOpen}
                onClose={handlePasswordModalClose}
                userId={currentUser.userId}
                authType={currentUser.authType}
            />
        </div>
    );
};

export default UserSettingsExample; 