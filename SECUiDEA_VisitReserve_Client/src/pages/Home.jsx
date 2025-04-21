import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Home = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetch(import.meta.env.VITE_TEST_API_URL + `/data`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then((data) => setData(data))
            .catch((error) => console.error("Error fetching data:", error))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="home">
            {/* 특징 섹션 */}
            <section className="home_features">
                <div className="layout_container">
                    <div className="home_features-title">
                        <h2>주요 기능</h2>
                        <p>방문 예약 시스템의 편리한 기능들을 활용해보세요</p>
                    </div>
                    <div className="home_features-grid">
                        <div className="home_features-item">
                            <div className="icon">📅</div>
                            <h3>간편한 방문 신청</h3>
                            <p>몇 번의 클릭만으로 방문 일정을 신청하고 관리할 수 있습니다.</p>
                        </div>
                        <div className="home_features-item">
                            <div className="icon">✓</div>
                            <h3>실시간 승인 처리</h3>
                            <p>담당자는 실시간으로 방문 신청을 확인하고 승인할 수 있습니다.</p>
                        </div>
                        <div className="home_features-item">
                            <div className="icon">📊</div>
                            <h3>방문 이력 관리</h3>
                            <p>모든 방문 기록을 체계적으로 관리하고 필요시 조회할 수 있습니다.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 통계 섹션 */}
            <section className="home_stats">
                <div className="layout_container">
                    <div className="home_stats-container">
                        <div className="home_stats-item">
                            <div className="number">5,000+</div>
                            <div className="label">월 방문 건수</div>
                        </div>
                        <div className="home_stats-item">
                            <div className="number">98%</div>
                            <div className="label">사용자 만족도</div>
                        </div>
                        <div className="home_stats-item">
                            <div className="number">3분</div>
                            <div className="label">평균 처리 시간</div>
                        </div>
                        <div className="home_stats-item">
                            <div className="number">24/7</div>
                            <div className="label">시스템 가용성</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA 섹션 */}
            <section className="layout_container">
                <div className="home_cta">
                    <h2>지금 바로 시작하세요</h2>
                    <p>
                        방문 예약 시스템으로 효율적인 방문자 관리와 보안 강화를 경험해보세요.
                        간편한 절차로 빠르게 방문을 신청하고 승인할 수 있습니다.
                    </p>
                    <div className="buttons">
                        <Link to="/visit-reservation" className="btn-primary">
                            방문 신청하기
                        </Link>
                        <Link to="/help" className="btn-outline">
                            자세히 알아보기
                        </Link>
                    </div>
                </div>
            </section>

            {/* 방문자 데이터 섹션 */}
            {user && (
                <section className="layout_container">
                    <div className="home_data-container">
                        <h2>테스트 데이터</h2>
                        {loading ? (
                            <div>Loading...</div>
                        ) : data.length > 0 ? (
                            <div>
                                <h3>방문자 목록</h3>
                                <ul>
                                    {data.map((visit) => (
                                        <li key={visit.id}>{visit.name}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div>
                                <h3>방문자가 없습니다.</h3>
                            </div>
                        )}
                    </div>
                </section>
            )}
        </div>
    );
};

export default Home;