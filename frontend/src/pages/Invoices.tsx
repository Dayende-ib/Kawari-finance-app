import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import { Plus, CheckCircle, XCircle, Clock, Eye, Download, Send } from 'lucide-react';

interface Invoice {
  id: number;
  number: string;
  total: number;
  issuedAt: string;
  status: string;
  customerId: number;
}

interface Stats {
  totalSales: number;
  totalExpenses: number;
  balance: number;
  unreadNotifications: number;
  totalInvoices: number;
  unpaidInvoices: number;
}

export default function Invoices() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery<any>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const response = await api.get('/invoices');
      // S'assurer que les données sont un tableau
      return Array.isArray(response.data) ? response.data : [];
    },
  });
  
  const { data: statsData } = useQuery<Stats>({
    queryKey: ['invoice-stats'],
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

  // Fonction pour déterminer le statut réel de la facture
  const getInvoiceStatus = (invoice: Invoice) => {
    if (invoice.status === 'paid') return 'paid';
    if (invoice.status === 'pending') return 'pending';
    // Supposons que tout autre statut est 'overdue' si la date est dépassée
    const dueDate = new Date(invoice.issuedAt);
    const now = new Date();
    return dueDate < now ? 'overdue' : 'pending';
  };

  // Filtrer les factures selon le statut sélectionné
  const filteredInvoices = Array.isArray(invoicesData) ? invoicesData.filter(invoice => {
    if (activeFilter === 'all') return true;
    const status = getInvoiceStatus(invoice);
    return status === activeFilter;
  }) : [];

  // Calculer les statistiques basées sur les factures
  const paidInvoices = Array.isArray(invoicesData) ? invoicesData.filter(inv => getInvoiceStatus(inv) === 'paid') : [];
  const pendingInvoices = Array.isArray(invoicesData) ? invoicesData.filter(inv => getInvoiceStatus(inv) === 'pending') : [];
  const overdueInvoices = Array.isArray(invoicesData) ? invoicesData.filter(inv => getInvoiceStatus(inv) === 'overdue') : [];

  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button 
            className={`px-4 py-2 rounded-lg font-medium ${
              activeFilter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveFilter('all')}
          >
            Toutes
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium ${
              activeFilter === 'paid' 
                ? 'bg-blue-600 text-white' 
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveFilter('paid')}
          >
            Payées
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium ${
              activeFilter === 'pending' 
                ? 'bg-blue-600 text-white' 
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveFilter('pending')}
          >
            En attente
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-medium ${
              activeFilter === 'overdue' 
                ? 'bg-blue-600 text-white' 
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveFilter('overdue')}
          >
            En retard
          </button>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nouvelle Facture
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Factures payées</p>
              <p className="text-2xl font-bold text-gray-900">{paidInvoices.length}</p>
            </div>
          </div>
          <p className="text-sm text-green-600 font-medium">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{pendingInvoices.length}</p>
            </div>
          </div>
          <p className="text-sm text-yellow-600 font-medium">{formatCurrency(totalPending)}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-sm text-gray-600">En retard</p>
              <p className="text-2xl font-bold text-gray-900">{overdueInvoices.length}</p>
            </div>
          </div>
          <p className="text-sm text-red-600 font-medium">{formatCurrency(totalOverdue)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">N° Facture</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Client</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Échéance</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Montant</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Statut</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoicesLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Chargement...</td>
              </tr>
            ) : filteredInvoices && filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr key={invoice?.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{invoice?.number || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-700">Client {invoice?.customerId || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{invoice?.issuedAt ? formatDate(invoice.issuedAt) : 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{invoice?.issuedAt ? formatDate(invoice.issuedAt) : 'N/A'}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{invoice?.total ? formatCurrency(invoice.total) : 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getInvoiceStatus(invoice) === 'paid' ? 'bg-green-100 text-green-700' :
                      getInvoiceStatus(invoice) === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {getInvoiceStatus(invoice) === 'paid' ? 'Payée' : getInvoiceStatus(invoice) === 'pending' ? 'En attente' : 'En retard'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-1.5 hover:bg-gray-200 rounded" title="Voir">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-200 rounded" title="Télécharger">
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 hover:bg-blue-100 rounded" title="Envoyer">
                        <Send className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Aucune facture trouvée</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}