import React from "react";
import { Link } from "react-router-dom";

import './About.scss';

const About = () => {
    return (
        <div className="about-page">
            <div className="about-page_header">
                <h1>About</h1>
                <p>
                    방문 예약 시스템에 대한 정보와 저작권 고지
                </p>
            </div>

            <section className="about-page_section">
                <h2>방문 예약 시스템 소개</h2>
                <p>
                    방문 예약 시스템은 외부인 방문 신청 및 승인을 위한 통합 관리 시스템입니다.
                </p>
            </section>

            <section className="about-page_section licenses">
                <h2>방문 예약 시스템 저작권 고지</h2>

                <div className="license-item">
                    <h3>Lucide License</h3>
                    <div className="license-text">
                        <p>
                            ISC License
                        </p>
                        <p>
                            Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather (MIT). All other copyright (c) for Lucide are held by Lucide Contributors 2022.
                        </p>
                        <p>
                            Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.
                        </p>
                        <p>
                            THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
                        </p>
                    </div>
                </div>

                <div className="license-item">
                    <h3>Noto Sans KR License</h3>
                    <div className="license-text">
                        <p>
                            SIL Open Font License 1.1
                        </p>
                        <p>
                            Copyright 2014-2021 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source'
                        </p>
                    </div>
                </div>

                <div className="license-item">
                    <h3>Nanum Font</h3>
                    <div className="license-text">
                        <p>
                            SIL Open Font License 1.1
                        </p>
                        <p>
                            Copyright (c) 2010, NAVER Corporation (https://www.navercorp.com/) with Reserved Font Name Nanum, Naver Nanum, NanumGothic, Naver NanumGothic, NanumMyeongjo, Naver NanumMyeongjo, NanumBrush, Naver NanumBrush, NanumPen, Naver NanumPen, Naver NanumGothicEco, NanumGothicEco, Naver NanumMyeongjoEco, NanumMyeongjoEco, Naver NanumGothicLight, NanumGothicLight, NanumBarunGothic, Naver NanumBarunGothic, NanumSquareRound, NanumBarunPen, MaruBuri, NanumSquareNeo
                        </p>
                    </div>
                </div>
            </section>

            <div className="about-page_actions">
                <Link to="/" className="btn btn-primary">홈으로</Link>
            </div>
        </div>
    );
}

export default About;
