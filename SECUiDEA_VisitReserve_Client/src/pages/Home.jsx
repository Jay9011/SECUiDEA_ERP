import { useState, useEffect } from "react";

const Home = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

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
        <div>
            <h1>Home</h1>

            {loading ? (
                <div>Loading...</div>
            ) : data.length > 0 ? (
                <div>
                    <h1>Visits</h1>
                    <ul>
                        {data.map((visit) => (
                            <li key={visit.id}>{visit.name}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>
                    <h1>No visits found</h1>
                </div>
            )}
        </div>
    );
};

export default Home;
