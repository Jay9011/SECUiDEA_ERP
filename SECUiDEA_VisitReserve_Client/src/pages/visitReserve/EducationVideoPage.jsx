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
  const [volume, setVolume] = useState(0.5); // 기본 볼륨값 (0~1)
  const [isMuted, setIsMuted] = useState(false); // 음소거 상태
  const [isFullScreen, setIsFullScreen] = useState(false); // 전체화면 상태
  const [isPlaying, setIsPlaying] = useState(true); // 재생 상태
  const [showControls, setShowControls] = useState(false); // 컨트롤 표시 상태
  const [controlsTimeout, setControlsTimeout] = useState(null); // 컨트롤 숨김 타이머
  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const progressRef = useRef(null);

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
    setIsPlaying(false);
    if (watchingIntervalRef.current) {
      clearInterval(watchingIntervalRef.current);
    }
  };

  // 재생/일시정지 토글
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Seek 이벤트 처리 (사용자가 재생 위치 변경 시도)
  const handleSeek = (seconds) => {
    // 영상 처음이나 끝으로 Seek 하는 것 외에는 제한 (영상을 완료한 후 처음으로 돌아가기 허용)
    if (seconds > 1 && seconds < videoDuration - 1 && !videoEnded) {
      console.log('Seek 시도 감지됨');
      playerRef.current.seekTo(lastPlayedRef.current);
    }
  };

  // 볼륨 변경 핸들러
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);

    // 볼륨이 0이면 음소거 상태로 변경
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  // 음소거 토글 핸들러
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // 전체화면 토글
  const toggleFullScreen = () => {
    if (!document.fullscreenElement && playerContainerRef.current) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`전체화면 모드 전환 오류: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // 전체화면 상태 변경 감지
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // 마우스 움직임 감지하여 컨트롤 표시
  const handleMouseMove = () => {
    setShowControls(true);

    // 기존 타이머 초기화
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    // 3초 후 컨트롤 숨김
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    setControlsTimeout(timeout);
  };

  // 마우스 나갈 때 컨트롤 숨김
  const handleMouseLeave = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    setShowControls(false);
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
          setIsPlaying(false);
        }
      }, 5000);
    }

    return () => {
      if (watchingIntervalRef.current) {
        clearInterval(watchingIntervalRef.current);
      }
    };
  }, [isReady, videoEnded]);

  // 컨트롤 타이머 정리
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

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

  // 모바일 화면 대응 스타일
  const playerContainerStyle = {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%', // 16:9 비율 (모바일 대응)
    backgroundColor: '#000',
    maxHeight: '70vh', // 화면 높이의 최대 70%로 제한
    overflow: 'hidden',
    borderRadius: '4px'
  };

  const playerStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  };

  return (
    <div className="education-video-page">
      <h2>방문자 안전 교육</h2>

      {/* 비디오 플레이어 컨테이너 */}
      <div
        ref={playerContainerRef}
        style={playerContainerStyle}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* 비디오 플레이어 */}
        <div style={playerStyle}>
          <ReactPlayer
            ref={playerRef}
            url={videoUrl}
            width={isFullScreen ? "100vw" : "100%"}
            height={isFullScreen ? "100vh" : "100%"}
            controls={false}
            playing={isPlaying}
            volume={volume}
            muted={false}
            onReady={handleReady}
            onEnded={handleEnded}
            onDuration={handleDuration}
            onProgress={handleProgress}
            onSeek={handleSeek}
            progressInterval={1000}
            playsinline={true}
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                  disablePictureInPicture: true,
                  playsInline: true,
                  autoPlay: true,
                },
              },
            }}
          />
        </div>

        {/* 중앙 재생/일시정지 버튼 */}
        {showControls && (
          <button
            onClick={togglePlay}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60px',
              height: '60px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              borderRadius: '50%',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            {isPlaying ? 'Ⅱ' : '▶'}
          </button>
        )}

        {/* 컨트롤 바 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '10px',
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s ease',
            zIndex: 10
          }}
        >
          {/* 프로그레스 바 - 클릭 비활성화 */}
          <div
            ref={progressRef}
            style={{
              width: '100%',
              height: '5px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2.5px',
              position: 'relative',
              cursor: 'default', // 기본 커서로 변경 (클릭 불가 표시)
              marginBottom: '10px',
              pointerEvents: 'none' // 클릭 이벤트 차단
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${playedFraction * 100}%`,
                backgroundColor: '#4CAF50',
                borderRadius: '2.5px'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* 재생 시간 표시 */}
            <div style={{ color: 'white', fontSize: '12px' }}>
              {formatTime(playedSeconds)} / {formatTime(videoDuration)}
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* 볼륨 컨트롤 */}
              <div style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
                <button
                  onClick={toggleMute}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer',
                    marginRight: '5px',
                    padding: '5px',
                    fontSize: '16px'
                  }}
                >
                  {isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
                </button>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={handleVolumeChange}
                  style={{
                    width: '60px',
                    accentColor: '#4CAF50'
                  }}
                />
              </div>

              {/* 전체화면 버튼 */}
              <button
                onClick={toggleFullScreen}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '5px',
                  fontSize: '16px'
                }}
              >
                {isFullScreen ? '⊙' : '⛶'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p style={{ marginTop: '15px' }}>
        {videoEnded
          ? '교육 영상을 완료했습니다. 아래 버튼을 클릭하여 진행하세요.'
          : '교육 영상을 끝까지 시청해야 완료 버튼이 활성화됩니다.'}
      </p>

      <button
        onClick={handleEducationComplete}
        disabled={!videoEnded}
        style={{
          marginTop: '16px',
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