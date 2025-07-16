import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, User, Briefcase, Phone, Car, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { AuthProvider } from '../../utils/authProviders';
import { useTranslation } from 'react-i18next';
import { getColorVariables } from '../../utils/cssVariables';

// API
import { checkEducationVideo } from '../../services/visitReserveApis';

// 커스텀 훅
import useNetworkErrorAlert from '../../hooks/useNetworkErrorAlert';

// 스타일
import './ReserveResult.scss';

function ReserveResult() {
  const { t } = useTranslation('visit');
  const { loginWithProvider } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { showNetworkErrorAlert } = useNetworkErrorAlert();
  const state = location.state || {};
  const [loading, setLoading] = useState(false);

  const {
    employeeName,
    visitorName,
    visitorCompany,
    visitorContact,
    visitDate,
    visitTime,
    visitEndDate,
    visitEndTime,
    visitReason,
    visitPurpose,
    visitorCarNumber
  } = state;

  const videoRef = useRef(null);

  // 페이지 이동 시 모달과 알림 정리
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 실행
      Swal.close();
    };
  }, []);

  // 라우트 변경 감지하여 알림창 닫기
  useEffect(() => {
    Swal.close();
  }, [location]);

  const checkEducationVideoStatus = async () => {
    if (!visitorName || !visitorContact) return;

    try {
      setLoading(true);

      if (!navigator.onLine) {
        throw new Error(t('common.offlineError'));
      }

      // 교육 영상 시청 여부 확인 API 호출
      const result = await checkEducationVideo({
        visitorName,
        visitorContact
      });

      if (result.isSuccess) {
        const data = result.data;
        // 교육 영상 시청이 필요한 경우
        if (data.required) {
          // 교육 영상 시청 이력이 존재하는 경우 (시청 이력이 없다면 2000년 이전으로 저장되어 있음)
          const educationData = data.educationData?.[0];
          const educationDate = new Date(educationData.educationDate);
          const educationDateText = educationDate.toISOString().replace('T', ' ').substring(0, 19);
          const standardDate = new Date('2000-01-01');

          if (educationDate < standardDate) {
            showEducationAlert();
          } else {
            showEducationAlert(
              `
              <p>${t('visitReserve.reserveResult.education.expired')}</p>
              <p>${t('visitReserve.reserveResult.education.history')} ${educationDateText}</p>
              `
            );
          }
        }
      } else {
        console.error('교육 영상 확인 실패:', result.message);
      }
    } catch (error) {
      console.error('교육 영상 확인 오류:', error);

      const errorMessage = error.message === t('common.offlineError')
        ? t('common.offlineError')
        : t('visitReserve.reserveResult.education.error');

      showNetworkErrorAlert(
        errorMessage,
        checkEducationVideoStatus,
        t('common.networkError'),
        { showCancelButton: false, allowOutsideClick: false }
      );
    } finally {
      setLoading(false);
    }
  };

  // 교육 영상 시청 알림 표시
  const showEducationAlert = (html) => {
    const colors = getColorVariables();

    Swal.fire({
      title: t('visitReserve.reserveResult.education.title'),
      html: html || `
        <p>${t('visitReserve.reserveResult.education.message')}</p>
        <p>${t('visitReserve.reserveResult.education.question')}</p>
      `,
      icon: 'info',
      iconColor: colors.info,
      showCancelButton: true,
      confirmButtonText: t('visitReserve.reserveResult.education.watch'),
      cancelButtonText: t('visitReserve.reserveResult.education.later'),
      confirmButtonColor: colors.primary,
      cancelButtonColor: colors.secondary,
    }).then((result) => {
      if (result.isConfirmed) {
        handleLoginForEducation();
      }
    });
  };

  // 교육 영상 시청을 위한 로그인 처리 후 교육 페이지로 이동
  const handleLoginForEducation = async () => {
    try {
      setLoading(true);

      if (!navigator.onLine) {
        throw new Error(t('common.offlineError'));
      }

      // 로그인 API 호출
      const contactLastEight = visitorContact.slice(-8); // 연락처의 마지막 8자리만 추출
      await loginWithProvider(AuthProvider.S1_GUEST, visitorName, contactLastEight);

      // 로그인 성공 시 교육 페이지로 이동
      navigate('/education');
    } catch (error) {
      console.error('로그인 오류:', error);

      const errorMessage = error.message === t('common.offlineError')
        ? t('common.offlineError')
        : t('visitReserve.reserveResult.education.error');

      showNetworkErrorAlert(
        errorMessage,
        handleLoginForEducation,
        t('common.networkError'),
        { showCancelButton: false, allowOutsideClick: false }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('비디오 자동 재생 실패:', error);
      });
    }

    if (visitorName && visitorContact) {
      checkEducationVideoStatus();
    }
  }, [state]);

  return (
    <div className="reserve-result-page">
      <div className="page-header">
        <h1>{t('visitReserve.reserveResult.title')}</h1>
        <p className="page-subtitle">{t('visitReserve.reserveResult.subtitle')}</p>
      </div>

      <div className="video-section">
        <div className="video-wrapper">
          <video
            ref={videoRef}
            className="outro-video"
            src="/visit/videos/VO_Intro.mp4"
            muted
            playsInline
          />
        </div>
      </div>

      <div className="result-card">
        <div className="card-header">
          <CheckCircle size={32} className="success-icon" />
          <h2>{t('visitReserve.reserveResult.detailTitle')}</h2>
        </div>

        <div className="card-content">
          <div className="info-section">
            <h3>{t('visitReserve.reserveResult.targetSection.title')}</h3>

            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <User size={18} />
                  <span>{t('visitReserve.reserveResult.targetSection.employeeName')}</span>
                </div>
                <div className="info-value">{employeeName || '-'}</div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>{t('visitReserve.reserveResult.visitorSection.title')}</h3>

            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <User size={18} />
                  <span>{t('visitReserve.reserveResult.visitorSection.name')}</span>
                </div>
                <div className="info-value">{visitorName || '-'}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Briefcase size={18} />
                  <span>{t('visitReserve.reserveResult.visitorSection.company')}</span>
                </div>
                <div className="info-value">{visitorCompany || '-'}</div>
              </div>
            </div>

            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <Phone size={18} />
                  <span>{t('visitReserve.reserveResult.visitorSection.contact')}</span>
                </div>
                <div className="info-value">{visitorContact || '-'}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Car size={18} />
                  <span>{t('visitReserve.reserveResult.visitorSection.carNumber')}</span>
                </div>
                <div className="info-value">{visitorCarNumber || '-'}</div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>{t('visitReserve.reserveResult.scheduleSection.title')}</h3>

            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <Calendar size={18} />
                  <span>{t('visitReserve.reserveResult.scheduleSection.visitDate')}</span>
                </div>
                <div className="info-value">
                  {visitDate ? `${visitDate} ${visitTime || ''}` : '-'}
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Calendar size={18} />
                  <span>{t('visitReserve.reserveResult.scheduleSection.endDate')}</span>
                </div>
                <div className="info-value">
                  {visitEndDate ? `${visitEndDate} ${visitEndTime || ''}` : '-'}
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>{t('visitReserve.reserveResult.purposeSection.title')}</h3>

            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <FileText size={18} />
                  <span>{t('visitReserve.reserveResult.purposeSection.type')}</span>
                </div>
                <div className="info-value">{visitReason || '-'}</div>
              </div>
            </div>

            <div className="info-row full-width">
              <div className="info-item">
                <div className="info-label">
                  <FileText size={18} />
                  <span>{t('visitReserve.reserveResult.purposeSection.details')}</span>
                </div>
                <div className="info-value">{visitPurpose || '-'}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer">
          <button
            className="btn btn-primary"
            onClick={() => window.location.href = '/'}
            disabled={loading}
          >
            {loading ? t('common.processingRequest') : t('visitReserve.reserveResult.actions.home')}
          </button>
        </div>
      </div>
    </div>
  );
}

ReserveResult.propTypes = {
  employeeName: PropTypes.string,
  visitorName: PropTypes.string,
  visitorCompany: PropTypes.string,
  visitorContact: PropTypes.string,
  visitDate: PropTypes.string,
  visitTime: PropTypes.string,
  visitEndDate: PropTypes.string,
  visitEndTime: PropTypes.string,
  visitReason: PropTypes.string,
  visitPurpose: PropTypes.string,
  visitorCarNumber: PropTypes.string,
};

export default ReserveResult; 