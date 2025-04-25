import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Suspense } from 'react';
import './i18n';

// 레이아웃
import VideoLayout from './components/layouts/VideoLayout';
import BaseLayout from './components/layouts/BaseLayout';

// 페이지
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import NotFound from './pages/NotFound';

import ProtectedRoute from './components/ProtectedRoute';

// 로딩 컴포넌트
const Loading = () => <div className="loading">로딩 중...</div>;

const App = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Router basename="/visit">
        <AuthProvider>
          <Routes>
            {/* 동영상 배경이 있는 레이아웃 */}
            <Route element={<VideoLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
            </Route>

            {/* 기본 배경의 레이아웃 */}
            <Route element={<BaseLayout className="standard-layout" />}>
              <Route path="/about" element={<About />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </Suspense>
  );
};

export default App;
