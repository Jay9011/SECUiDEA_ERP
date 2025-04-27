import React from 'react';
import PropTypes from 'prop-types';

// 방문 신청 결과 페이지
function ReserveResult({ result, visitorName, visitorContact, visitDate, visitTime, educationWatched }) {
  return (
    <div className="reserve-result">
      <h2>방문 신청 결과</h2>
      {/* TODO: 결과에 따라 다른 메시지/화면 표시 */}
      <p>{result ? '신청이 완료되었습니다.' : '신청에 실패하였습니다.'}</p>
      {result && (
        <div className="result-info">
          <div><strong>방문자 이름:</strong> {visitorName}</div>
          <div><strong>연락처:</strong> {visitorContact}</div>
          <div><strong>방문 날짜:</strong> {visitDate}</div>
          <div><strong>방문 시간:</strong> {visitTime}</div>
          <div><strong>동영상 교육 시청 여부:</strong> {educationWatched ? '예' : '아니오'}</div>
        </div>
      )}
      {/* 추가 안내, 버튼 등 */}
    </div>
  );
}

ReserveResult.propTypes = {
  result: PropTypes.bool,
  visitorName: PropTypes.string,
  visitorContact: PropTypes.string,
  visitDate: PropTypes.string,
  visitTime: PropTypes.string,
  educationWatched: PropTypes.bool,
};

export default ReserveResult; 