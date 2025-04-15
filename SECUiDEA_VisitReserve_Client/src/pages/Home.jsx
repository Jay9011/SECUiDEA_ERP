import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Home = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();

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

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="home-container">
            <div className="user-info">
                <h2>환영합니다, {user.userName}님!</h2>
                <p>역할: {user.userRole}</p>
                <div className="permissions">
                    <h3>권한 목록:</h3>
                    <ul>
                        {user.permissions.map((permission, index) => (
                            <li key={index}>
                                {permission.feature}: {permission.level}
                            </li>
                        ))}
                    </ul>
                </div>
                <button onClick={handleLogout} className="logout-button">
                    로그아웃
                </button>
            </div>

            <div className="data-container">
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
        </div>
    );
};

export default Home;
