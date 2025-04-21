import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// 레이아웃
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import ErrorLayout from './components/layouts/ErrorLayout';

// 페이지
import Home from './pages/Home';
import Login from './pages/Login';
import About from './pages/About';
import NotFound from './pages/NotFound';

import ProtectedRoute from './components/ProtectedRoute';

// 스타일
import './styles/main.scss';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />

          <Route path="/login"
            element={
              <MainLayout>
                <Login />
              </MainLayout>
            }
          />

          <Route path="/about"
            element={
              <MainLayout>
                <About />
              </MainLayout>
            }
          />

          <Route path="*"
            element={
              <ErrorLayout>
                <NotFound />
              </ErrorLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
