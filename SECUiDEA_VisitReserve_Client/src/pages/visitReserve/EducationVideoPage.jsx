import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import Swal from 'sweetalert2';
import { useTranslation } from 'react-i18next';
import { getColorVariables } from '../../utils/cssVariables';

import { useAuth } from "../../context/AuthContext";
import { saveEducationCompletion } from '../../services/visitReserveApis';

import './EducationVideoPage.scss';

function EducationVideoPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation('visit');

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
      handleEducationComplete();
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
    const colors = getColorVariables();
    try {
      const result = await saveEducationCompletion();

      if (result.isSuccess) {
        Swal.fire({
          title: t('visitReserve.education.successTitle'),
          text: t('visitReserve.education.successMessage'),
          icon: 'success',
          iconColor: colors.success,
          confirmButtonText: t('visitReserve.education.confirm'),
          confirmButtonColor: colors.success
        }).then(() => {
          logout();
          navigate('/');
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('교육 완료 처리 오류:', error);
      Swal.fire({
        title: t('visitReserve.education.errorTitle'),
        text: t('visitReserve.education.errorMessage'),
        icon: 'error',
        iconColor: colors.error,
        confirmButtonText: t('visitReserve.education.retryButton'),
        confirmButtonColor: colors.primary,
        showCancelButton: true,
        cancelButtonText: t('visitReserve.education.cancelButton'),
        cancelButtonColor: colors.textSecondary
      }).then((result) => {
        if (result.isConfirmed) {
          handleEducationComplete();
        }
      });
    }
  };

  return (
    <div className="education-video-page">
      <h2>{t('visitReserve.education.title')}</h2>

      {/* 비디오 플레이어 컨테이너 */}
      <div
        ref={playerContainerRef}
        className="player-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* 비디오 플레이어 */}
        <div className="player-wrapper">
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
            className="play-pause-button"
          >
            {isPlaying ? 'Ⅱ' : '▶'}
          </button>
        )}

        {/* 컨트롤 바 */}
        <div
          className={`controls-bar ${showControls ? 'visible' : ''}`}
        >
          {/* 프로그레스 바 - 클릭 비활성화 */}
          <div
            ref={progressRef}
            className="progress-bar"
          >
            <div
              className="progress-fill"
              style={{ width: `${playedFraction * 100}%` }}
            />
          </div>

          <div className="controls-row">
            {/* 재생 시간 표시 */}
            <div className="time-display">
              {formatTime(playedSeconds)} / {formatTime(videoDuration)}
            </div>

            <div className="controls-right">
              {/* 볼륨 컨트롤 */}
              <div className="volume-control">
                <button
                  onClick={toggleMute}
                  className="volume-button"
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
                  className="volume-slider"
                />
              </div>

              {/* 전체화면 버튼 */}
              <button
                onClick={toggleFullScreen}
                className="fullscreen-button"
              >
                {isFullScreen ? '⊙' : '⛶'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="education-message">
        {videoEnded
          ? t('visitReserve.education.completed')
          : t('visitReserve.education.inProgress')}
      </p>

      <button
        onClick={handleEducationComplete}
        disabled={!videoEnded}
        className={`education-complete-button ${videoEnded ? 'active' : ''}`}
      >
        {t('visitReserve.education.completeButton')}
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