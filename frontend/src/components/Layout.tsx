import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Toast from './Toast';
import Chatbot from './Chatbot';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import { BarChart3, Receipt, Users, Wallet, Bell, Menu, X, Home, FileText, Settings, LogOut, Search, UserPlus } from 'lucide-react';

const baseLinks = [
  { to: '/', label: 'Tableau de bord', icon: Home },
  { to: '/transactions', label: 'Transactions', icon: Receipt },
  { to: '/invoices', label: 'Factures', icon: FileText },
  { to: '/customers', label: 'Clients', icon: Users },
  { to: '/mobile-money', label: 'Mobile Money', icon: Wallet },
];

const adminLinks = [
  { to: '/sellers', label: 'Vendeurs', icon: UserPlus },
];

export default function Layout() {
  const { logout, user, isAdmin } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const { data } = useQuery<{ unreadCount: number }>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => await api.get('/notifications/unread/count'),
    refetchInterval: 15000,
  });
  
  const links = isAdmin ? [...baseLinks, ...adminLinks] : baseLinks;
  
  // Déterminer la vue active pour la sidebar
  const getActiveView = () => {
    const pathname = location.pathname;
    if (pathname === '/') return 'dashboard';
    if (pathname.includes('transactions')) return 'transactions';
    if (pathname.includes('invoices')) return 'invoices';
    if (pathname.includes('customers')) return 'customers';
    if (pathname.includes('mobile-money')) return 'mobile-money';
    if (pathname.includes('sellers')) return 'sellers';
    return '';
  };

  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`fixed left-0 top-0 h-full bg-gray-900 text-white transition-all duration-300 z-40 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            {sidebarOpen && <h1 className="text-2xl font-bold">Kawari</h1>}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          <nav className="space-y-2">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive ? 'bg-green-600' : 'hover:bg-gray-800'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="absolute bottom-6 left-6 right-6 space-y-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
              <Settings className="w-5 h-5" />
              {sidebarOpen && <span>Paramètres</span>}
            </button>
            <button 
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-900 transition-colors text-red-400"
              onClick={() => {
                logout();
                nav('/login');
              }}
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span>Déconnexion</span>}
            </button>
          </div>
        </div>
      </div>
      
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {location.pathname === '/' && 'Tableau de bord'}
                  {location.pathname === '/transactions' && 'Transactions'}
                  {location.pathname === '/invoices' && 'Factures'}
                  {location.pathname === '/customers' && 'Clients'}
                  {location.pathname === '/mobile-money' && 'Mobile Money'}
                  {location.pathname === '/sellers' && 'Gestion des vendeurs'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {location.pathname === '/' && 'Bonjour! Voici vos statistiques du jour'}
                  {location.pathname === '/transactions' && 'Gérez toutes vos transactions'}
                  {location.pathname === '/invoices' && 'Gérez vos factures et paiements'}
                  {location.pathname === '/customers' && 'Gérez votre base de clients'}
                  {location.pathname === '/mobile-money' && 'Gérez vos comptes Mobile Money'}
                  {location.pathname === '/sellers' && 'Créez et gérez vos vendeurs'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-6 h-6 text-gray-600" />
                  {data?.unreadCount && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {data.unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
      <Toast />
      <Chatbot />
    </div>
  );
}