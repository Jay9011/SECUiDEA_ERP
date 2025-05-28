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
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import About from './pages/About';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import PrivacyAgreementInput from './pages/visitReserve/PrivacyAgreementInput';
import ReserveResult from './pages/visitReserve/ReserveResult';
import VisitList from './pages/visitReserve/visitList';
import EducationVideoPage from './pages/visitReserve/EducationVideoPage';

import ProtectedRoute from './components/ProtectedRoute';

// 로딩 컴포넌트
import LoadingOverlay from './components/common/LoadingOverlay';

const App = () => {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <Router basename="/visit">
        <AuthProvider>
          <Routes>
            {/* 동영상 배경이 있는 레이아웃 */}
            <Route element={<VideoLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/change-password" element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              } />
            </Route>

            {/* 기본 배경의 레이아웃 */}
            <Route element={<BaseLayout className="standard-layout" />}>
              <Route path="/visitReserve/privacyAgreement" element={<PrivacyAgreementInput />} />
              <Route path="/visitReserve/ReserveResult" element={<ReserveResult />} />
              <Route path="/education" element={
                <ProtectedRoute>
                  <EducationVideoPage />
                </ProtectedRoute>
              } />
              <Route path="/visitReserve/visitList" element={
                <ProtectedRoute>
                  <VisitList />
                </ProtectedRoute>
              } />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </Suspense>
  );
};

export default App;
