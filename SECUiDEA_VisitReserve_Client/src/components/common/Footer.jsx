import React from 'react';
import { Link } from 'react-router-dom';

const Footer = React.memo(() => {
    return (
        <footer className="footer">
            <div className="footer_container">
                <div className="footer_content">
                    <div className="footer_info">
                        <h3>방문 예약 시스템</h3>
                        <p>외부인 방문 신청 및 승인을 위한 통합 관리 시스템입니다.</p>
                        <div className="footer_info-contact">
                            <div className="contact-item">
                                <i>📱</i> 고객지원: 02-123-4567
                            </div>
                            <div className="contact-item">
                                <i>✉️</i> 이메일: support@asmk.com
                            </div>
                        </div>
                    </div>

                    <div className="footer_links">
                        <h4>바로가기</h4>
                        <ul>
                            <li><Link to="/">홈</Link></li>
                            <li><Link to="/visit-reservation">방문 신청</Link></li>
                        </ul>
                    </div>

                    <div className="footer_links">
                        <h4>리소스</h4>
                        <ul>
                            <li><Link to="/privacy">개인정보처리방침</Link></li>
                            <li><Link to="/about">About</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="footer_bottom">
                    <div className="footer_bottom-copyright">
                        &copy; {new Date().getFullYear()} SECUiDEA. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
});

export default React.memo(Footer);
