import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Sales from './pages/Sales.jsx';
import Expenses from './pages/Expenses.jsx';
import Invoices from './pages/Invoices.jsx';
import Login from './pages/Login.jsx';
import Layout from './components/Layout.jsx';
import { setAuthToken } from './api/client.js';

const Protected = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  const [user, setUser] = useState(null);

  const handleAuth = ({ token, user: profile }) => {
    setAuthToken(token);
    setUser(profile);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
  };

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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </Protected>
        }
      />
    </Routes>
  );
}
