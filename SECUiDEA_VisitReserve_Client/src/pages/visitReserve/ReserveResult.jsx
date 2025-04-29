import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, User, Briefcase, Phone, Car, FileText } from 'lucide-react';
import './ReserveResult.scss';

// 방문 신청 결과 페이지
function ReserveResult() {
  const location = useLocation();
  const state = location.state || {};

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

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.error('비디오 자동 재생 실패:', error);
      });
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
          <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
            홈으로
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