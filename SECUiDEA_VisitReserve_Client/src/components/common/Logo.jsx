import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Logo.scss';

/**
 * 로고 컴포넌트
 * @param {Object} props
 * @param {string} props.className - 추가 클래스명
 * @param {Function} props.onClick - 클릭 이벤트 핸들러
 * @param {string} props.textComponent - 텍스트 요소 태그 (span, p, h1, 등)
 * @param {string} props.textContent - 텍스트 내용
 * @param {string} props.hoverColor - 호버 시 텍스트 색상 (secondary, accent, success, warning, info)
 * @param {string} props.rotation - 이미지 회전 효과 (Z축 회전: rotate-hover, rotate-15, rotate-30, rotate-45, rotate-90, rotate-180, rotate-continuous, rotate-pulse)
 * @param {string} props.rotation3d - 이미지 3D 회전 효과 (Y축 회전: rotate3d-y-hover, rotate3d-y-15, rotate3d-y-30, rotate3d-y-45, rotate3d-y-90, rotate3d-y-180, rotate3d-y-continuous, rotate3d-y-swing) 
 * (X축 회전: rotate3d-x-hover, rotate3d-x-30, rotate3d-x-45, rotate3d-x-continuous) 
 * (복합 회전: rotate3d-complex, rotate3d-complex-pause, rotate3d-tilt)
 * @param {string} props.logoColor - 로고 SVG 색상 (CSS 색상값)
 * @param {string} props.hoverLogoColor - 호버 시 로고 SVG 색상 (CSS 색상값)
 * @param {string} props.logo - 외부 로고 이미지 URL (제공되면 이미지 사용, 없으면 SVG 사용)
 * @returns {JSX.Element}
 */
const LogoComponent = ({
    className = '',
    onClick,
    textComponent = 'span',
    textContent = '로고',
    hoverColor = '',
    rotation = '',
    rotation3d = '',
    logoColor = '#ffffff',
    hoverLogoColor = '',
    logo = null
}) => {
    const [currentLogoColor, setCurrentLogoColor] = useState(logoColor);
    const [isHovering, setIsHovering] = useState(false);

    // 호버 상태에 따라 로고 색상 변경
    useEffect(() => {
        if (isHovering && hoverLogoColor) {
            setCurrentLogoColor(hoverLogoColor);
        } else {
            setCurrentLogoColor(logoColor);
        }
    }, [isHovering, logoColor, hoverLogoColor]);

    const TextComponent = textComponent;
    const hoverClass = hoverColor ? `hover-${hoverColor}` : '';
    const rotationClass = rotation || '';
    const rotation3dClass = rotation3d || '';
    const combinedClassName = `logo ${className} ${hoverClass} ${rotationClass} ${rotation3dClass}`.trim();

    // 마우스 호버 이벤트 핸들러
    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    return (
        <div className={combinedClassName}>
            <Link
                to="/"
                onClick={onClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="logo-svg-container">
                    {logo ? (
                        <img src={logo} className="logo-svg" alt="logo" />
                    ) : (
                        <svg
                            version="1.0"
                            xmlns="http://www.w3.org/2000/svg"
                            width="35.4pt"
                            height="35.4pt"
                            viewBox="0 0 354.000000 354.000000"
                            preserveAspectRatio="xMidYMid meet"
                            className="logo-svg"
                        >
                            <g
                                transform="translate(0.000000,354.000000) scale(0.100000,-0.100000)"
                                fill={currentLogoColor}
                                stroke="none"
                            >
                                <path d="M1595 3513 c-159 -85 -1264 -729 -1277 -745 -10 -11 -18 -24 -18 -28
0 -13 30 -40 44 -40 7 0 307 170 667 378 683 394 685 395 644 436 -20 19 -22
19 -60 -1z"/>
                                <path d="M1878 3519 c-21 -12 -24 -52 -5 -67 18 -14 1241 -719 1282 -739 28
-14 37 -14 50 -3 9 8 15 24 13 39 -3 23 -78 69 -657 404 -360 207 -657 377
-660 377 -3 0 -14 -5 -23 -11z"/>
                                <path d="M1728 3193 c-8 -10 -142 -238 -297 -508 -155 -269 -285 -493 -289
-497 -4 -4 -160 81 -346 188 -306 177 -341 195 -363 185 -19 -9 -24 -18 -21
-38 3 -24 40 -48 338 -220 184 -106 336 -197 338 -201 1 -4 -128 -234 -288
-510 -159 -276 -290 -513 -290 -525 0 -13 5 -28 12 -35 9 -9 157 -12 605 -12
l593 0 0 -393 c0 -292 3 -396 12 -405 18 -18 56 -14 68 7 6 13 10 159 10 405
l0 386 593 0 c448 0 596 3 605 12 7 7 12 22 12 33 0 12 -131 248 -290 525
-160 276 -289 507 -288 512 2 5 154 96 338 202 295 170 335 196 338 219 3 20
-3 30 -21 38 -23 10 -55 -6 -364 -184 -258 -150 -341 -193 -349 -184 -6 7
-134 226 -284 487 -150 261 -282 487 -292 503 -22 31 -57 36 -80 10z m-15
-1404 c-12 -11 -1035 -600 -1038 -597 -1 2 445 777 493 855 5 7 57 -18 161
-78 86 -50 163 -89 174 -87 29 4 45 33 31 56 -6 9 -78 56 -160 104 -82 48
-149 91 -149 96 0 5 110 201 245 435 l245 425 3 -601 c1 -330 -1 -604 -5 -608z
m353 772 c132 -228 240 -418 242 -422 2 -4 -70 -48 -158 -99 -157 -91 -161
-94 -158 -124 5 -54 37 -46 208 53 l154 89 16 -27 c83 -137 481 -833 479 -835
-2 -2 -236 130 -519 294 l-515 298 -3 603 c-1 343 2 599 7 594 4 -6 116 -196
247 -424z m204 -1136 c256 -148 483 -279 505 -292 l40 -23 -502 0 -503 0 0
176 c0 102 -4 183 -10 195 -12 21 -50 25 -68 7 -8 -8 -12 -66 -12 -195 l0
-183 -502 0 c-303 0 -497 4 -488 10 8 5 245 141 525 303 455 263 512 294 530
283 11 -7 229 -134 485 -281z"/>
                                <path d="M181 2536 c-8 -9 -10 -221 -9 -777 l3 -764 35 0 35 0 3 764 c1 556
-1 768 -9 777 -6 8 -19 14 -29 14 -10 0 -23 -6 -29 -14z"/>
                                <path d="M3291 2536 c-8 -9 -10 -221 -9 -777 l3 -764 35 0 35 0 3 764 c1 556
-1 768 -9 777 -6 8 -19 14 -29 14 -10 0 -23 -6 -29 -14z"/>
                                <path d="M311 812 c-6 -11 -8 -27 -5 -36 7 -18 1299 -766 1323 -766 39 0 54
46 24 72 -36 32 -1279 742 -1305 746 -19 3 -29 -2 -37 -16z"/>
                                <path d="M2512 457 c-492 -285 -643 -377 -648 -395 -8 -29 14 -55 42 -49 12 2
313 172 668 377 l647 373 -3 31 c-6 66 -19 60 -706 -337z"/>
                            </g>
                        </svg>
                    )}
                </div>
                <TextComponent>{textContent}</TextComponent>
            </Link>
        </div>
    )
};

export default LogoComponent;
