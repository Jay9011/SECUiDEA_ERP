import { Link } from 'react-router-dom';

const ErrorLayout = ({ children }) => {
    return (
        <div className="error-layout">
            <div className="error-layout_container">
                {children}
            </div>
        </div>
    );
};

export default ErrorLayout; 