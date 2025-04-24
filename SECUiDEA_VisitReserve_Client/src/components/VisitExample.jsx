import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const VisitExample = () => {
    const { t } = useTranslation('visit');
    const [reservationId] = useState('R2023-0001');
    const [errorMessage] = useState('서버 연결 실패');

    // 예약 성공 메시지 표시 예제
    const showSuccessMessage = () => {
        return t('방문.메시지.성공', { 예약번호: reservationId });
    };

    // 예약 오류 메시지 표시 예제
    const showErrorMessage = () => {
        return t('방문.메시지.오류', { 오류내용: errorMessage });
    };

    return (
        <div className="visit-example">
            <h2>{t('방문.제목')}</h2>

            <div className="example-section">
                <h3>{t('공통.환영')}</h3>

                <div className="form-group">
                    <label>{t('방문.양식.이름')}</label>
                    <input type="text" placeholder={t('방문.양식.이름')} />
                </div>

                <div className="form-group">
                    <label>{t('방문.양식.전화번호')}</label>
                    <input type="tel" placeholder={t('방문.양식.전화번호')} />
                </div>

                <div className="form-group">
                    <label>{t('방문.양식.이메일')}</label>
                    <input type="email" placeholder={t('방문.양식.이메일')} />
                </div>

                <div className="form-group">
                    <label>{t('방문.양식.목적')}</label>
                    <input type="text" placeholder={t('방문.양식.목적')} />
                </div>

                <div className="message success-message">
                    {showSuccessMessage()}
                </div>

                <div className="message error-message">
                    {showErrorMessage()}
                </div>

                <div className="actions">
                    <button className="btn primary">{t('방문.양식.신청')}</button>
                    <button className="btn secondary">{t('공통.취소')}</button>
                </div>
            </div>
        </div>
    );
};

export default VisitExample; 