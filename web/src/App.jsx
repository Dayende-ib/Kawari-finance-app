import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Sales from './pages/Sales.jsx';
import Expenses from './pages/Expenses.jsx';
import Invoices from './pages/Invoices.jsx';
import Settings from './pages/Settings.jsx';
import AiAdvisor from './pages/AiAdvisor.jsx';
import Login from './pages/Login.jsx';
import Layout from './components/Layout.jsx';
import { setAuthToken, me } from './api/client.js';

const TOKEN_KEY = 'kawari_token';

const Protected = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const handleAuth = ({ token, user: profile }) => {
    setAuthToken(token);
    setUser(profile);
    localStorage.setItem(TOKEN_KEY, token);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (!saved) {
      setBooting(false);
      return;
    }
    (async () => {
      try {
        setAuthToken(saved);
        const { data } = await me();
        setUser(data.user);
      } catch (err) {
        localStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  if (booting) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>
        Chargement...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login onAuth={handleAuth} />} />
      <Route
        path="/*"
        element={
          <Protected user={user}>
            <Layout onLogout={handleLogout} user={user}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/invoices" element={<Invoices user={user} />} />
                <Route path="/settings" element={<Settings user={user} onProfileUpdate={setUser} />} />
                <Route path="/ai" element={<AiAdvisor />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Protected>
        }
      />
    </Routes>
  );
}
