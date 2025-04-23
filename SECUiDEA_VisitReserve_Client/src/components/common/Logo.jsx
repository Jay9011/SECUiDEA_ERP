import React from 'react';
import { Link } from 'react-router-dom';

// 리소스
import Logo from '../../assets/images/Logo.svg';

const LogoComponent = React.memo(({
    className = '',
    onClick,
    textComponent = 'span',
    textContent = '로고'
}) => {
    const TextComponent = textComponent;

    return (
        <div className={`logo ${className}`}>
            <Link to="/" onClick={onClick}>
                <img src={Logo} alt="Logo" />
                <TextComponent>{textContent}</TextComponent>
            </Link>
        </div>
    )
});

export default LogoComponent;
