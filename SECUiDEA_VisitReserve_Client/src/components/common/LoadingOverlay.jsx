import React from 'react';
import './LoadingOverlay.scss';

const LoadingOverlay = () => {
    return (
        <div className="loading-overlay">
            <div className="loading-dots">
                <div className="dot dot1"></div>
                <div className="dot dot2"></div>
                <div className="dot dot3"></div>
            </div>
        </div>
    );
};

export default LoadingOverlay;