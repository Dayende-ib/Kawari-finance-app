import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import { Plus, Filter, TrendingUp, TrendingDown, Edit2, Trash2, Mic, FileText } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { notify } from '../components/Toast';

interface Transaction {
  id?: string;
  _id?: string;
  type: 'sale' | 'expense';
  amount: number;
  currency: string;
  date: string;
  description?: string;
  category?: string;
  paymentMethod?: string;
  customerName?: string;
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'sale' | 'expense'>('all');
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: '',
    category: '',
  });
  const queryClient = useQueryClient();
  const location = useLocation();
  const nav = useNavigate();

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => await api.get('/transactions'),
  });

  const { data: statsData } = useQuery<Stats>({
    queryKey: ['transaction-stats'],
    queryFn: async () => await api.get('/stats'),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => await api.post('/transactions', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      notify('Transaction enregistrée');
      handleCloseModal();
    },
    onError: (err: any) => notify(err?.data?.message || 'Erreur lors de la creation', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: any }) => await api.put(`/transactions/${payload.id}`, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      notify('Transaction mise à jour');
      handleCloseModal();
    },
    onError: (err: any) => notify(err?.data?.message || 'Erreur lors de la mise à jour', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      notify('Transaction supprimée');
    },
    onError: (err: any) => notify(err?.data?.message || 'Erreur lors de la suppression', 'error'),
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (payload: any) => await api.post('/invoices', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      notify('Facture créée');
    },
    onError: (err: any) => notify(err?.data?.message || 'Erreur lors de la création de facture', 'error'),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredTransactions = useMemo(() => {
    if (!transactionsData) return [];
    const base = activeFilter === 'all'
      ? transactionsData
      : transactionsData.filter((tx) => tx.type === activeFilter);
    return [...base].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactionsData, activeFilter]);

  const handleOpenModal = (type: 'sale' | 'expense', transaction?: Transaction) => {
    setTransactionType(type);
    setEditing(transaction || null);
    setFormData({
      customerName: transaction?.customerName || '',
      amount: transaction ? String(transaction.amount) : '',
      date: transaction?.date
        ? new Date(transaction.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      description: transaction?.description || '',
      paymentMethod: transaction?.paymentMethod || '',
      category: transaction?.category || '',
    });
    setShowTransactionModal(true);
  };

  const handleCloseModal = () => {
    setShowTransactionModal(false);
    setEditing(null);
    setFormData({
      customerName: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMethod: '',
      category: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountValue = Number(formData.amount);
    if (!Number.isFinite(amountValue)) {
      notify('Montant invalide', 'error');
      return;
    }

    const payload: any = {
      type: transactionType,
      amount: amountValue,
      date: formData.date,
      description: formData.description || undefined,
      paymentMethod: formData.paymentMethod || undefined,
      category: formData.category || undefined,
    };

    if (formData.customerName.trim()) {
      payload.customerName = formData.customerName.trim();
    }

    if (editing) {
      const id = editing._id || editing.id;
      if (!id) {
        notify('ID transaction introuvable', 'error');
        return;
      }
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  useEffect(() => {
    const openModal = (location.state as { openModal?: 'sale' | 'expense' } | null)?.openModal;
    if (openModal === 'sale' || openModal === 'expense') {
      handleOpenModal(openModal);
      nav('/transactions', { replace: true, state: {} });
    }
  }, [location.state, nav]);

  const TransactionItem = ({ transaction, displayName }: { transaction: Transaction; displayName: string }) => {
    const handleCreateInvoice = () => {
      if (transaction.type !== 'sale') return;
      const amount = Math.abs(transaction.amount);
      const customerName = transaction.customerName?.trim() || 'Client vente';
      createInvoiceMutation.mutate({
        customerName,
        total: amount,
        issuedAt: transaction.date,
        status: 'PENDING',
        items: [
          {
            label: transaction.description || 'Vente',
            quantity: 1,
            unitPrice: amount,
          },
        ],
      });
    };

    return (
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
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
            <p className="font-medium text-gray-900">{displayName}</p>
            <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
          </div>
        </div>
        <div className="text-left sm:text-right flex items-center gap-3">
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
               transaction.type === 'expense' ? 'Depense' :
               'Inconnu'}
            </span>
          </div>
          <div className="flex gap-1">
            {transaction.type === 'sale' && (
              <button
                className="p-1 hover:bg-blue-100 rounded"
                onClick={handleCreateInvoice}
                title="Créer une facture"
                disabled={createInvoiceMutation.isPending}
              >
                <FileText className="w-4 h-4 text-blue-600" />
              </button>
            )}
            <button
              className="p-1 hover:bg-gray-200 rounded"
              onClick={() => handleOpenModal(transaction.type, transaction)}
              title="Modifier"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
            <button
              className="p-1 hover:bg-red-100 rounded"
              onClick={() => {
                const id = transaction._id || transaction.id;
                if (!id) return;
                deleteMutation.mutate(id);
              }}
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-medium w-full sm:w-auto ${
              activeFilter === 'all' ? 'bg-green-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveFilter('all')}
          >
            Toutes
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium w-full sm:w-auto ${
              activeFilter === 'sale' ? 'bg-green-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveFilter('sale')}
          >
            Ventes
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium w-full sm:w-auto ${
              activeFilter === 'expense' ? 'bg-green-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveFilter('expense')}
          >
            Dépenses
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto" onClick={() => notify('Filtres avancés à venir')}>
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => handleOpenModal('sale')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Vente
          </button>
          <button
            onClick={() => handleOpenModal('expense')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Nouvelle Dépense
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Revenus totaux</p>
              <p className="text-2xl font-bold text-green-600">{statsData ? formatCurrency(statsData.totalSales) : '0'}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Depenses totales</p>
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
          ) : filteredTransactions && filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction._id || transaction.id}
                transaction={transaction}
                displayName={`${transaction.type === 'expense' ? 'dépense' : 'vente'} ${String(transaction._id || transaction.id || '').trim() || 'N/A'}`}
              />
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">Aucune transaction trouvée</div>
          )}
        </div>
      </div>

      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <Card className="w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editing ? 'Modifier la transaction' : transactionType === 'sale' ? 'Nouvelle Vente' : 'Nouvelle Dépense'}
                </h3>
                <p className="text-xs text-gray-500">Ajout vocal: non fonctionnel pour le moment.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  title="Ajout vocal non fonctionnel"
                  className="p-2 rounded-lg border border-gray-300 text-gray-400 cursor-not-allowed"
                >
                  <Mic className="w-5 h-5" />
                </button>
                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                label="Nom du client (optionnel)"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Ex: Kouadio Mensah"
              />
              <Input
                label="Montant (FCFA)"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Sélectionner</option>
                  {transactionType === 'sale' ? (
                    <>
                      <option>Vente de produits</option>
                      <option>Services</option>
                      <option>Consulting</option>
                      <option>Autres</option>
                    </>
                  ) : (
                    <>
                      <option>Fournitures</option>
                      <option>Électricité</option>
                      <option>Loyer</option>
                      <option>Salaires</option>
                      <option>Marketing</option>
                      <option>Autres</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Moyen de paiement (optionnel)</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="">Sélectionner</option>
                  <option value="Espèces">Espèces</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Carte bancaire">Carte bancaire</option>
                  <option value="Virement">Virement</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnel)</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Détails supplémentaires..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={handleCloseModal} className="flex-1">
                  Annuler
                </Button>
                <Button type="submit" loading={createMutation.isPending || updateMutation.isPending} className="flex-1">
                  {editing ? 'Mettre à jour' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
