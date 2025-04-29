import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, User, Briefcase, Phone, Car, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { AuthProvider } from '../../utils/authProviders';

// API
import { checkEducationVideo } from '../../services/visitReserveApis';

// 스타일
import './ReserveResult.scss';

function ReserveResult() {
  const { loginWithProvider } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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

  const showNetworkErrorAlert = (errorMessage, retryHandler, title = '네트워크 오류', options = {}) => {
    const { showCancelButton = true, allowOutsideClick = true } = options;

    Swal.fire({
      title: title,
      html: typeof errorMessage === 'string'
        ? `<p>${errorMessage}</p><p>다시 시도하시겠습니까?</p>`
        : errorMessage,
      icon: 'error',
      showCancelButton: showCancelButton,
      confirmButtonText: '다시 시도',
      cancelButtonText: '닫기',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
      allowOutsideClick: allowOutsideClick,
      allowEscapeKey: allowOutsideClick
    }).then((result) => {
      if (result.isConfirmed && typeof retryHandler === 'function') {
        retryHandler();
      }
    });
  };

  const checkEducationVideoStatus = async () => {
    if (!visitorName || !visitorContact) return;

    try {
      setLoading(true);

      if (!navigator.onLine) {
        throw new Error('인터넷 연결이 오프라인 상태입니다.');
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
              <p>마지막 교육 시청 이력이 오래되어 안전 교육 영상 시청이 필요합니다.</p>
              <p>교육 영상 시청 이력: ${educationDateText}</p>
              `
            );
          }
        }
      } else {
        console.error('교육 영상 확인 실패:', result.message);
      }
    } catch (error) {
      console.error('교육 영상 확인 오류:', error);

      const errorMessage = error.message === '인터넷 연결이 오프라인 상태입니다.'
        ? '인터넷 연결이 오프라인 상태입니다.'
        : '교육 영상 확인 중 오류가 발생했습니다.';

      showNetworkErrorAlert(
        errorMessage,
        checkEducationVideoStatus,
        '교육 영상 확인 오류',
        { showCancelButton: false, allowOutsideClick: false }
      );
    } finally {
      setLoading(false);
    }
  };

  // 교육 영상 시청 알림 표시
  const showEducationAlert = (html) => {
    Swal.fire({
      title: '안전 교육 영상 시청 필요',
      html: html || `
        <p>방문 전 안전 교육 영상 시청이 필요합니다.</p>
        <p>지금 시청하시겠습니까?</p>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: '시청하러 가기',
      cancelButtonText: '다음에 하기',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
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
        throw new Error('인터넷 연결이 오프라인 상태입니다.');
      }

      // 로그인 API 호출
      const contactLastEight = visitorContact.slice(-8); // 연락처의 마지막 8자리만 추출
      await loginWithProvider(AuthProvider.S1_GUEST, visitorName, contactLastEight);

      // 로그인 성공 시 교육 페이지로 이동
      navigate('/education');
    } catch (error) {
      console.error('로그인 오류:', error);

      const errorMessage = error.message === '인터넷 연결이 오프라인 상태입니다.'
        ? '인터넷 연결이 오프라인 상태입니다.'
        : '로그인 중 오류가 발생했습니다.';

      showNetworkErrorAlert(
        errorMessage,
        handleLoginForEducation,
        '로그인 오류',
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
        <h1>방문 신청 완료</h1>
        <p className="page-subtitle">방문 신청이 성공적으로 처리되었습니다.</p>
      </div>

      <div className="video-section">
        <div className="video-wrapper">
          <video
            ref={videoRef}
            className="outro-video"
            src="/visit/videos/outro_16_9.mp4"
            muted
            playsInline
          />
        </div>
      </div>

      <div className="result-card">
        <div className="card-header">
          <CheckCircle size={32} className="success-icon" />
          <h2>방문 신청 상세 정보</h2>
        </div>

        <div className="card-content">
          <div className="info-section">
            <h3>방문 대상</h3>

            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <User size={18} />
                  <span>직원 이름</span>
                </div>
                <div className="info-value">{employeeName || '-'}</div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>방문자 정보</h3>

            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <User size={18} />
                  <span>방문자 이름</span>
                </div>
                <div className="info-value">{visitorName || '-'}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Briefcase size={18} />
                  <span>회사명</span>
                </div>
                <div className="info-value">{visitorCompany || '-'}</div>
              </div>
            </div>

            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <Phone size={18} />
                  <span>연락처</span>
                </div>
                <div className="info-value">{visitorContact || '-'}</div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Car size={18} />
                  <span>차량 번호</span>
                </div>
                <div className="info-value">{visitorCarNumber || '-'}</div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>방문 일정</h3>

            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <Calendar size={18} />
                  <span>방문 날짜</span>
                </div>
                <div className="info-value">
                  {visitDate ? `${visitDate} ${visitTime || ''}` : '-'}
                </div>
              </div>

              <div className="info-item">
                <div className="info-label">
                  <Calendar size={18} />
                  <span>종료 날짜</span>
                </div>
                <div className="info-value">
                  {visitEndDate ? `${visitEndDate} ${visitEndTime || ''}` : '-'}
                </div>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>방문 목적</h3>

            <div className="info-row">
              <div className="info-item">
                <div className="info-label">
                  <FileText size={18} />
                  <span>방문 유형</span>
                </div>
                <div className="info-value">{visitReason || '-'}</div>
              </div>
            </div>

            <div className="info-row full-width">
              <div className="info-item">
                <div className="info-label">
                  <FileText size={18} />
                  <span>방문 세부 목적</span>
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
            {loading ? '처리 중...' : '홈으로'}
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