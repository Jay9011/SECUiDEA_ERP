import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="error-layout_content">
            <div className="error-layout_code">404</div>
            <h1 className="error-layout_title">페이지를 찾을 수 없습니다</h1>
            <p className="error-layout_text">
                요청하신 페이지가 존재하지 않거나, 이동되었거나, 일시적으로 사용할 수 없습니다.
            </p>
            <div className="error-layout_actions">
                <Link to="/" className="btn-primary">
                    홈으로 돌아가기
                </Link>
                <Link to="/help" className="btn-outline">
                    도움말
                </Link>
            </div>
        </div>
    );
};

export default NotFound; 