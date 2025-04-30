import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './BackgroundVideo.scss';

const BackgroundVideo = ({ className = '' }) => {
    const [videoError, setVideoError] = useState(false);
    const { t } = useTranslation('visit');

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
                    <source src="/visit/videos/background.mp4" type="video/mp4" />
                    {t('components.backgroundVideo.browserNotSupported')}
                </video>
            )}
            <div className="video-overlay"></div>
        </div>
    );
};

export default BackgroundVideo; 