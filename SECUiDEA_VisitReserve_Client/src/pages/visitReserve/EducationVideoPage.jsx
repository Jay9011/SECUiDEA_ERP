import React from 'react';
import PropTypes from 'prop-types';

// 방문 신청 완료 후 동영상 교육 페이지
function EducationVideoPage({ videoUrl, onComplete }) {
  return (
    <div className="education-video-page">
      <h2>방문자 안전 교육</h2>
      {/* TODO: 실제 동영상 컴포넌트로 대체 */}
      <video src={videoUrl} controls width="100%" />
      <button onClick={onComplete} style={{ marginTop: 16 }}>교육 완료</button>
    </div>
  );
}

EducationVideoPage.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  onComplete: PropTypes.func,
};

export default EducationVideoPage; 