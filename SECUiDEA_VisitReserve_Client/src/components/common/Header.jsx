import { Link } from "react-router-dom";

import './Header.scss';

import Logo from '../../assets/images/Logo.svg';

const Header = ({ onToggleNav }) => {
    return (
        <header className="header">
            <div className="header_container">
                <div className="header_left">
                    <button className="header_menu-toggle" onClick={onToggleNav}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>

                <div className="header_center">
                    <div className="header_logo">
                        <Link to="/">
                            <img src={Logo} alt="Logo" />
                            <h1>방문 예약 시스템</h1>
                        </Link>
                    </div>
                </div>

                <div className="header_right">

                </div>
            </div>
        </header>
    );
};

export default Header;
