import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import { Plus, Filter, TrendingUp, TrendingDown, Edit2, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: number;
  type: 'sale' | 'expense';
  amount: number;
  currency: string;
  date: string;
  description?: string;
  category?: string;
  paymentMethod?: string;
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

export default function Transactions() {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState<'sale' | 'expense'>('sale');
  
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => (await api.get('/transactions')).data,
  });
  
  const { data: statsData } = useQuery<Stats>({
    queryKey: ['transaction-stats'],
    queryFn: async () => (await api.get('/stats')).data,
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

  const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
    // Récupérer le client si customerId existe
    const getClientName = () => {
      return transaction.customerId ? `Client ${transaction.customerId}` : 'Aucun client';
    };

    return (
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${transaction.type === 'sale' ? 'bg-green-100' : transaction.type === 'expense' ? 'bg-red-100' : 'bg-gray-100'}`}>
            {transaction.type === 'sale' ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : transaction.type === 'expense' ? (
              <TrendingDown className="w-5 h-5 text-red-600" />
            ) : (
              <TrendingUp className="w-5 h-5 text-gray-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{getClientName()}</p>
            <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-3">
          <div>
            <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(transaction.amount))}
            </p>
            <span className={`text-xs px-2 py-1 rounded-full ${
              transaction.type === 'sale' ? 'bg-green-100 text-green-700' : 
              transaction.type === 'expense' ? 'bg-red-100 text-red-700' : 
              'bg-gray-100 text-gray-700'
            }`}>
              {transaction.type === 'sale' ? 'Vente' : 
               transaction.type === 'expense' ? 'Dépense' : 
               'Inconnu'}
            </span>
          </div>
          <div className="flex gap-1">
            <button className="p-1 hover:bg-gray-200 rounded">
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
            <button className="p-1 hover:bg-red-100 rounded">
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TransactionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowTransactionModal(false)}>
      <div className="bg-white rounded-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {transactionType === 'sale' ? 'Nouvelle Vente' : 'Nouvelle Dépense'}
          </h3>
          <button onClick={() => setShowTransactionModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client / Fournisseur</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nom du client ou fournisseur"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant (FCFA)</label>
            <input 
              type="number" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
            <select 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={transactionType === 'sale' ? 'Vente de produits' : 'Fournitures'}
              onChange={(e) => setTransactionType(transactionType)}
            >
              {transactionType === 'sale' ? (
                <>
                  <option>Vente de produits</option>
                  <option>Services</option>
                  <option>Consulting</option>
                </>
              ) : (
                <>
                  <option>Fournitures</option>
                  <option>Électricité</option>
                  <option>Loyer</option>
                  <option>Salaires</option>
                  <option>Marketing</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnel)</label>
            <textarea 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Détails supplémentaires..."
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setShowTransactionModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button 
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-lg ${
                transactionType === 'sale' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Toutes</button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Ventes</button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Dépenses</button>
        </div>
        <div className="flex gap-3">
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => {
              setTransactionType('sale');
              setShowTransactionModal(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Transaction
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Revenus totaux</p>
              <p className="text-2xl font-bold text-green-600">{statsData ? formatCurrency(statsData.totalSales) : '0'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Dépenses totales</p>
              <p className="text-2xl font-bold text-red-600">{statsData ? formatCurrency(statsData.totalExpenses) : '0'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Solde net</p>
              <p className="text-2xl font-bold text-blue-600">{statsData ? formatCurrency(statsData.balance) : '0'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactionsData ? transactionsData.length : 0}</p>
            </div>
          </div>
        </div>
        <div className="divide-y">
          {transactionsLoading ? (
            <div className="p-6 text-center text-gray-500">Chargement...</div>
          ) : transactionsData && transactionsData.length > 0 ? (
            transactionsData.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">Aucune transaction trouvée</div>
          )}
        </div>
      </div>
      
      {showTransactionModal && <TransactionModal />}
    </div>
  );
}