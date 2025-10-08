import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppRoutes from './routes/index.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';

export default function App() {
  const location = useLocation();
  const hideChrome = location.pathname === '/login';

  return (
    <div className="app-shell">
      {!hideChrome && <Navbar />}
      <div className="app-content">
        <main className="app-main">
          <Routes>
            {AppRoutes}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      {!hideChrome && <Footer />}
    </div>
  );
}


