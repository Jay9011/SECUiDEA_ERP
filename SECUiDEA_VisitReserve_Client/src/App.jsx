import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// 레이아웃
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import ErrorLayout from './components/layouts/ErrorLayout';

// 페이지
import Home from './pages/Home';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// 스타일
import './styles/main.scss';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 메인 레이아웃을 사용하는 페이지 */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />

          {/* 인증 레이아웃을 사용하는 페이지 */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />

          {/* 에러 레이아웃을 사용하는 페이지 */}
          <Route
            path="/not-found"
            element={
              <ErrorLayout>
                <NotFound />
              </ErrorLayout>
            }
          />

          {/* 존재하지 않는 경로는 NotFound 페이지로 리디렉션 */}
          <Route path="*" element={<Navigate to="/not-found" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
