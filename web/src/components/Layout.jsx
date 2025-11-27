import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, TrendingDown, FileText, LogOut } from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label }) => (
  <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to={to}>
    <Icon size={18} />
    <span>{label}</span>
  </NavLink>
);

const Layout = ({ onLogout, children, user }) => {
  const navigate = useNavigate();
  const logout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="logo">Kawari</div>
        <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" />
        <SidebarLink to="/sales" icon={TrendingUp} label="Ventes" />
        <SidebarLink to="/expenses" icon={TrendingDown} label="Dépenses" />
        <SidebarLink to="/invoices" icon={FileText} label="Factures" />
        <button className="nav-link" style={{ border: 'none', background: 'transparent' }} onClick={logout}>
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </aside>
      <main className="content">
        <div className="topbar">
          <div>
            <div className="badge">
              <span>Assistant financier</span>
            </div>
          </div>
          <div className="muted">{user?.email}</div>
        </div>
        {children}
      </main>
    </div>
  );
};

export default Layout;
