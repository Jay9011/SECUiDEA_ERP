import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import Swal from 'sweetalert2';

function EducationVideoPage() {
  const navigate = useNavigate();

  const videoUrl = '/visit/videos/visitorSafetyVideo.mp4';

  const [videoEnded, setVideoEnded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [playedFraction, setPlayedFraction] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const playerRef = useRef(null);

  // 마지막으로 기록된 재생 시간을 추적하여 건너뛰기 감지
  const lastPlayedRef = useRef(0);
  const watchingIntervalRef = useRef(null);

  // 플레이어가 준비되었을 때 호출
  const handleReady = () => {
    setIsReady(true);
  };

  // 동영상 진행 상황 추적
  const handleProgress = (state) => {
    setPlayedSeconds(state.playedSeconds);
    setPlayedFraction(state.played);

    // 건너뛰기 감지 (5초 이상 건너뛰면 처음 또는 마지막 위치로 되돌림)
    if (state.playedSeconds - lastPlayedRef.current > 5) {
      console.log('건너뛰기 감지됨');
      playerRef.current.seekTo(lastPlayedRef.current);
    } else {
      lastPlayedRef.current = state.playedSeconds;
    }
  };

  // 동영상 길이 설정
  const handleDuration = (duration) => {
    setVideoDuration(duration);
  };

  // 동영상 재생 완료
  const handleEnded = () => {
    setVideoEnded(true);
    if (watchingIntervalRef.current) {
      clearInterval(watchingIntervalRef.current);
    }
  };

  // 시크 이벤트 처리 (사용자가 재생 위치 변경 시도)
  const handleSeek = (seconds) => {
    // 영상 처음이나 끝으로 시크하는 것 외에는 제한 (영상을 완료한 후 처음으로 돌아가기 허용)
    if (seconds > 1 && seconds < videoDuration - 1 && !videoEnded) {
      console.log('시크 시도 감지됨');
      playerRef.current.seekTo(lastPlayedRef.current);
    }
  };

  // 플레이어 활성화 시 사용자 활동 감시
  useEffect(() => {
    if (isReady && !videoEnded) {
      // 5초마다 사용자가 페이지에 있는지 확인
      watchingIntervalRef.current = setInterval(() => {
        // 페이지가 활성화 상태인지 확인
        if (document.hidden) {
          // 페이지가 포커스를 잃은 경우 일시 정지
          playerRef.current.getInternalPlayer().pause();
        }
      }, 5000);
    }

    return () => {
      if (watchingIntervalRef.current) {
        clearInterval(watchingIntervalRef.current);
      }
    };
  }, [isReady, videoEnded]);

  // 교육 완료 처리 함수
  const handleEducationComplete = async () => {
    try {
      // 교육 완료 처리 API 호출 - JWT를 사용하여 인증된 사용자 정보를 기반으로 처리
      // 예시: const result = await saveEducationCompletion();
      console.log('교육 완료 처리 - JWT 기반 인증 사용');

      // 성공 시 처리
      Swal.fire({
        title: '교육 완료',
        text: '안전 교육이 완료되었습니다. 방문 신청이 접수되었습니다.',
        icon: 'success',
        confirmButtonText: '확인'
      }).then(() => {
        // 완료 후 홈으로 이동
        navigate('/');
      });
    } catch (error) {
      console.error('교육 완료 처리 오류:', error);
      Swal.fire({
        title: '오류',
        text: '교육 완료 처리 중 오류가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '다시 시도',
        showCancelButton: true,
        cancelButtonText: '취소'
      }).then((result) => {
        if (result.isConfirmed) {
          handleEducationComplete();
        }
      });
    }
  };

  return (
    <div className="education-video-page">
      <h2>방문자 안전 교육</h2>
      <div style={{ position: 'relative', width: '100%' }}>
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          width="100%"
          height="auto"
          controls={false}
          playing={true}
          onReady={handleReady}
          onEnded={handleEnded}
          onDuration={handleDuration}
          onProgress={handleProgress}
          onSeek={handleSeek}
          progressInterval={1000}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                disablePictureInPicture: true,
              },
            },
          }}
        />
      </div>
      <div style={{ marginTop: 10 }}>
        <progress
          value={playedFraction}
          max={1}
          style={{ width: '100%' }}
        ></progress>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
          <span>{formatTime(playedSeconds)}</span>
          <span>{formatTime(videoDuration)}</span>
        </div>
      </div>
      <p>
        {videoEnded
          ? '교육 영상을 완료했습니다. 아래 버튼을 클릭하여 진행하세요.'
          : '교육 영상을 끝까지 시청해야 완료 버튼이 활성화됩니다.'}
      </p>
      <button
        onClick={handleEducationComplete}
        disabled={!videoEnded}
        style={{
          marginTop: 16,
          opacity: videoEnded ? 1 : 0.5,
          cursor: videoEnded ? 'pointer' : 'not-allowed',
          padding: '10px 20px',
          backgroundColor: videoEnded ? '#4CAF50' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }}
      >
        교육 완료
      </button>
    </div>
  );
}

// 시간 형식 변환 (초 -> MM:SS)
function formatTime(seconds) {
  if (isNaN(seconds)) return '00:00';

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default EducationVideoPage; 