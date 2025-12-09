import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/customers', label: 'Clients' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/invoices', label: 'Factures' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/mobile-money', label: 'Mobile Money' },
];

export default function Layout() {
  const { logout } = useAuth();
  const nav = useNavigate();
  const { data } = useQuery<{ unreadCount: number }>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => (await api.get('/notifications/unread/count')).data,
    refetchInterval: 15000,
  });
  return (
    <div className="min-h-screen flex bg-bg text-slate-50">
      <aside className="w-60 hidden md:flex flex-col gap-2 bg-panel border-r border-slate-800 p-4">
        <div className="text-xl font-semibold mb-4">Kawari</div>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm ${isActive ? 'bg-primary text-white' : 'text-muted hover:bg-slate-800'}`
            }
          >
            {l.label}
          </NavLink>
        ))}
        <button
          className="mt-auto px-3 py-2 rounded-md bg-danger/80 hover:bg-danger text-sm"
          onClick={() => {
            logout();
            nav('/login');
          }}
        >
          Déconnexion
        </button>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-panel/70 backdrop-blur">
          <div className="text-sm text-muted">Kawari Finance</div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <div className="relative">
              <span>Notifications</span>
              {data?.unreadCount ? (
                <span className="absolute -top-2 -right-3 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                  {data.unreadCount}
                </span>
              ) : null}
            </div>
            <button
              className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700"
              onClick={() => {
                logout();
                nav('/login');
              }}
            >
              Déconnexion
            </button>
          </div>
        </header>
        <main className="p-4 md:p-6 space-y-4">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}
