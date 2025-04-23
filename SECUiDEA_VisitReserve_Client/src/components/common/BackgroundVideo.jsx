import { useState } from 'react';
import './BackgroundVideo.scss';

const BackgroundVideo = ({ className = '' }) => {
    const [videoError, setVideoError] = useState(false);

    const handleVideoError = () => {
        setVideoError(true);
    };

    return (
        <div className={`video-background ${videoError ? 'video-error' : ''} ${className}`}>
            {!videoError && (
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    onError={handleVideoError}
                >
                    <source src="/videos/background.mp4" type="video/mp4" />
                    브라우저가 비디오 태그를 지원하지 않습니다.
                </video>
            )}
            <div className="video-overlay"></div>
        </div>
    );
};

export default BackgroundVideo; 