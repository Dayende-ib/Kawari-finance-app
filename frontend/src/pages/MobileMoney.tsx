import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import { notify } from '../components/Toast';
import { CreditCard, ArrowUpRight, Send, Wallet, FileText } from 'lucide-react';

interface MobileMoneyTransaction {
  id: number;
  amount: number;
  currency: string;
  date: string;
  description?: string;
  paymentMethod?: string;
  category?: string;
  customerId?: number;
  createdAt: string;
}

interface Stats {
  totalSales: number;
  totalExpenses: number;
  balance: number;
  unreadNotifications: number;
  totalInvoices: number;
  unpaidInvoices: number;
}

export default function MobileMoney() {
  const historyRef = useRef<HTMLDivElement | null>(null);
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<MobileMoneyTransaction[]>({
    queryKey: ['mobile-money-transactions'],
    queryFn: async () => {
      const data = await api.get('/mobile-money/history');
      return Array.isArray(data) ? data.filter(tx => tx) : [];
    },
  });
  
  const { data: statsData } = useQuery<Stats>({
    queryKey: ['mobile-money-stats'],
    queryFn: async () => await api.get('/stats'),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <CreditCard className="w-8 h-8 mb-3 opacity-80" />
          <h4 className="text-sm font-medium mb-1 opacity-90">Orange Money</h4>
          <p className="text-3xl font-bold">{statsData ? formatCurrency(statsData.totalSales) : '0'}</p>
          <p className="text-sm mt-2 opacity-90">Solde disponible</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
          <CreditCard className="w-8 h-8 mb-3 opacity-80" />
          <h4 className="text-sm font-medium mb-1 opacity-90">Moov Money</h4>
          <p className="text-3xl font-bold">{statsData ? formatCurrency(statsData.totalExpenses) : '0'}</p>
          <p className="text-sm mt-2 opacity-90">Solde disponible</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <CreditCard className="w-8 h-8 mb-3 opacity-80" />
          <h4 className="text-sm font-medium mb-1 opacity-90">Wave</h4>
          <p className="text-3xl font-bold">{statsData ? formatCurrency(statsData.balance) : '0'}</p>
          <p className="text-sm mt-2 opacity-90">Solde disponible</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left" onClick={() => notify('Fonctionnalit? en cours de d?ploiement')}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <ArrowUpRight className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Recevoir un paiement</p>
                <p className="text-sm text-gray-600">Enregistrer un paiement Mobile Money</p>
              </div>
            </div>
          </button>
          <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left" onClick={() => notify('Fonctionnalit? en cours de d?ploiement')}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Envoyer de l'argent</p>
                <p className="text-sm text-gray-600">Effectuer un paiement à un fournisseur</p>
              </div>
            </div>
          </button>
          <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left" onClick={() => notify('Fonctionnalit? en cours de d?ploiement')}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Recharger compte</p>
                <p className="text-sm text-gray-600">Ajouter des fonds à votre compte</p>
              </div>
            </div>
          </button>
          <button className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left" onClick={() => historyRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Historique</p>
                <p className="text-sm text-gray-600">Voir toutes les transactions</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100" ref={historyRef}>
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Transactions récentes Mobile Money</h3>
        </div>
        <div className="divide-y">
          {transactionsLoading ? (
            <div className="p-6 text-center text-gray-500">Chargement...</div>
          ) : transactionsData && transactionsData.length > 0 ? (
            transactionsData.map((tx) => (
              <div key={tx.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {tx.amount > 0 ? <ArrowUpRight className="w-5 h-5 text-green-600" /> : <Send className="w-5 h-5 text-red-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Transaction #{tx.id}</p>
                    <p className="text-sm text-gray-500">{formatDate(tx.date)} • {tx.description || 'Paiement Mobile Money'}</p>
                  </div>
                </div>
                <p className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                </p>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">Aucune transaction trouvée</div>
          )}
        </div>
      </div>
    </div>
  );
}