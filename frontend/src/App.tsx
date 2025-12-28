import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Transactions from './pages/Transactions';
import Notifications from './pages/Notifications';
import MobileMoney from './pages/MobileMoney';
import Sellers from './pages/Sellers';
import Platform from './pages/Platform';
import Settings from './pages/Settings';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

const Protected = ({ children }: { children: JSX.Element }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

const AdminOnly = ({ children }: { children: JSX.Element }) => {
  const { token, isAdmin } = useAuth();
  return token && isAdmin ? children : <Navigate to="/" replace />;
};

const SuperAdminOnly = ({ children }: { children: JSX.Element }) => {
  const { token, isSuperAdmin } = useAuth();
  return token && isSuperAdmin ? children : <Navigate to="/" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="mobile-money" element={<MobileMoney />} />
          <Route path="settings" element={<Settings />} />
          <Route
            path="sellers"
            element={
              <AdminOnly>
                <Sellers />
              </AdminOnly>
            }
          />
          <Route
            path="platform"
            element={
              <SuperAdminOnly>
                <Platform />
              </SuperAdminOnly>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
