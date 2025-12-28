import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import { Plus, CheckCircle, XCircle, Clock, Eye, Download, Send, FileText, History } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { notify } from '../components/Toast';

interface CustomerRef {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
}

interface Invoice {
  id?: string;
  _id?: string;
  number?: string;
  total: number;
  issuedAt: string;
  dueAt?: string;
  status: string;
  templateName?: string;
  version?: number;
  customerId?: CustomerRef | string;
  customerName?: string;
}

interface InvoiceVersion {
  version: number;
  createdAt: string;
  snapshot: {
    customerName?: string | null;
    number?: string | null;
    total?: number;
    issuedAt?: string | null;
    dueAt?: string | null;
    status?: string;
    templateName?: string;
    items?: Array<{ label: string; quantity: number; unitPrice: number }>;
  };
}


interface Stats {
  totalSales: number;
  totalExpenses: number;
  balance: number;
  unreadNotifications: number;
  totalInvoices: number;
  unpaidInvoices: number;
}

const TEMPLATE_OPTIONS = [
  { value: 'default', label: 'Classique' },
  { value: 'modern', label: 'Moderne' },
];

export default function Invoices() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [preview, setPreview] = useState<Invoice | null>(null);
  const [versionsInvoice, setVersionsInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    number: '',
    customerId: '',
    customerName: '',
    total: '',
    issuedAt: new Date().toISOString().split('T')[0],
    dueAt: '',
    status: 'PENDING',
    templateName: 'default',
  });
  const queryClient = useQueryClient();

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const data = await api.get('/invoices');
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: statsData } = useQuery<Stats>({
    queryKey: ['invoice-stats'],
    queryFn: async () => await api.get('/stats'),
  });

  const { data: customersData = [] } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => {
      const data = await api.get('/customers');
      return Array.isArray(data) ? data : [];
    },
  });

  const versionsId = versionsInvoice?._id || versionsInvoice?.id;
  const { data: versionsData, isLoading: versionsLoading } = useQuery<{ version: number; versions: InvoiceVersion[] }>({
    queryKey: ['invoice-versions', versionsId],
    queryFn: async () => await api.get(`/invoices/${versionsId}/versions`),
    enabled: Boolean(versionsId),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => await api.post('/invoices', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      notify('Facture créée');
      handleCloseModal();
    },
    onError: (err: any) => notify(err?.data?.message || 'Erreur lors de la création', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: any }) => await api.put(`/invoices/${payload.id}`, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      notify('Facture mise à jour');
      handleCloseModal();
    },
    onError: (err: any) => notify(err?.data?.message || 'Erreur lors de la mise à jour', 'error'),
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

  const getInvoiceStatus = (invoice: Invoice) => {
    if (invoice.status === 'paid' || invoice.status === 'PAID') return 'paid';
    if (invoice.status === 'pending' || invoice.status === 'PENDING') return 'pending';
    const dueDate = new Date(invoice.issuedAt);
    const now = new Date();
    return dueDate < now ? 'overdue' : 'pending';
  };

  const filteredInvoices = useMemo(() => {
    if (!Array.isArray(invoicesData)) return [];
    return invoicesData.filter((invoice) => {
      if (activeFilter === 'all') return true;
      const status = getInvoiceStatus(invoice);
      return status === activeFilter;
    });
  }, [invoicesData, activeFilter]);

  const paidInvoices = useMemo(
    () => (Array.isArray(invoicesData) ? invoicesData.filter((inv) => getInvoiceStatus(inv) === 'paid') : []),
    [invoicesData]
  );
  const pendingInvoices = useMemo(
    () => (Array.isArray(invoicesData) ? invoicesData.filter((inv) => getInvoiceStatus(inv) === 'pending') : []),
    [invoicesData]
  );
  const overdueInvoices = useMemo(
    () => (Array.isArray(invoicesData) ? invoicesData.filter((inv) => getInvoiceStatus(inv) === 'overdue') : []),
    [invoicesData]
  );

  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const handleCloseModal = () => {
    setShowModal(false);
    setEditing(null);
    setFormData({
      number: '',
      customerId: '',
      total: '',
      issuedAt: new Date().toISOString().split('T')[0],
      dueAt: '',
      status: 'PENDING',
      templateName: 'default',
    });
  };

  const handleOpenModal = (invoice?: Invoice) => {
    if (invoice) {
      const customerId = typeof invoice.customerId === 'string'
        ? invoice.customerId
        : invoice.customerId?._id || invoice.customerId?.id || '';
      setEditing(invoice);
      setFormData({
        number: invoice.number || '',
        customerId,
        customerName: invoice.customerName || '',
        total: String(invoice.total ?? ''),
        issuedAt: invoice.issuedAt ? new Date(invoice.issuedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueAt: invoice.dueAt ? new Date(invoice.dueAt).toISOString().split('T')[0] : '',
        status: invoice.status || 'PENDING',
        templateName: invoice.templateName || 'default',
      });
    } else {
      setEditing(null);
      setFormData({
        number: '',
        customerId: '',
        customerName: '',
        total: '',
        issuedAt: new Date().toISOString().split('T')[0],
        dueAt: '',
        status: 'PENDING',
        templateName: 'default',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalValue = Number(formData.total);
    if (!Number.isFinite(totalValue)) {
      notify('Montant invalide', 'error');
      return;
    }

    const selectedCustomerId = formData.customerId.trim();
    const manualCustomerName = formData.customerName.trim();
    const selectedCustomer = customersData.find((customer) => (customer._id || customer.id) === selectedCustomerId);
    const resolvedCustomerName = selectedCustomer?.name || manualCustomerName;

    if (!resolvedCustomerName) {
      notify('Nom du client requis', 'error');
      return;
    }

    const payload = {
      number: formData.number || undefined,
      customerId: selectedCustomerId || undefined,
      customerName: resolvedCustomerName,
      total: totalValue,
      issuedAt: formData.issuedAt,
      dueAt: formData.dueAt || undefined,
      status: formData.status,
      templateName: formData.templateName,
    };

    if (editing) {
      const id = editing._id || editing.id;
      if (!id) {
        notify('ID facture introuvable', 'error');
        return;
      }
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDownload = async (invoice: Invoice) => {
    const id = invoice._id || invoice.id;
    if (!id) return;
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/invoices/${id}/download`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    if (!res.ok) {
      notify('Téléchargement impossible', 'error');
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = invoice.number ? `facture-${invoice.number}.pdf` : `facture-${id}.pdf`;
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleShare = async (invoice: Invoice) => {
    const id = invoice._id || invoice.id;
    const number = invoice.number || id;
    const amount = formatCurrency(invoice.total || 0);
    const text = `Facture ${number} - Montant ${amount}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: `Facture ${number}`, text });
      } else {
        await navigator.clipboard.writeText(text);
        notify('Résumé copié dans le presse-papier');
      }
    } catch (err) {
      notify('Partage impossible', 'error');
    }
  };

  const getCustomerLabel = (invoice: Invoice) => {
    if (invoice.customerName) return invoice.customerName;
    if (!invoice.customerId) return 'Client inconnu';
    if (typeof invoice.customerId === 'string') return `Client ${invoice.customerId}`;
    return invoice.customerId.name || `Client ${invoice.customerId._id || invoice.customerId.id || ''}`.trim();
  };

  const openPreview = (invoice: Invoice) => {
    setPreview(invoice);
  };

  const closePreview = () => setPreview(null);
  const closeVersions = () => setVersionsInvoice(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-lg font-medium w-full sm:w-auto ${
              activeFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveFilter('all')}
          >
            Toutes
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium w-full sm:w-auto ${
              activeFilter === 'paid'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveFilter('paid')}
          >
            Payées
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium w-full sm:w-auto ${
              activeFilter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveFilter('pending')}
          >
            En attente
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-medium w-full sm:w-auto ${
              activeFilter === 'overdue'
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveFilter('overdue')}
          >
            En retard
          </button>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto"
          onClick={() => handleOpenModal()}
        >
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

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-[900px] w-full">
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
                <tr key={invoice._id || invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <span>{invoice?.number || 'N/A'}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        v{invoice.version || 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{getCustomerLabel(invoice)}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{invoice?.issuedAt ? formatDate(invoice.issuedAt) : 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{invoice?.dueAt ? formatDate(invoice.dueAt) : 'N/A'}</td>
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
                      <button
                        className="p-1.5 hover:bg-gray-200 rounded"
                        title="Générer"
                        onClick={() => openPreview(invoice)}
                      >
                        <FileText className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-gray-200 rounded"
                        title="Modifier"
                        onClick={() => handleOpenModal(invoice)}
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-gray-200 rounded"
                        title="Télécharger PDF"
                        onClick={() => handleDownload(invoice)}
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-blue-100 rounded"
                        title="Partager"
                        onClick={() => handleShare(invoice)}
                      >
                        <Send className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-gray-200 rounded"
                        title="Historique des versions"
                        onClick={() => setVersionsInvoice(invoice)}
                      >
                        <History className="w-4 h-4 text-gray-600" />
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={handleCloseModal}>
          <Card className="w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? 'Modifier la facture' : 'Nouvelle facture'}
              </h2>
              <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded">
                <span className="sr-only">Fermer</span>
                ?
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Numéro (optionnel)"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client (optionnel)</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                >
                  <option value="">Selectionner un client</option>
                  {customersData.map((customer) => {
                    const id = customer._id || customer.id || '';
                    const label = customer.name || customer.email || id;
                    return (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
              <Input
                label="Nom du client (optionnel)"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Nom du client"
              />
              <Input
                label="Montant"
                type="number"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                required
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date d'émission</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.issuedAt}
                    onChange={(e) => setFormData({ ...formData, issuedAt: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date d'échéance</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.dueAt}
                    onChange={(e) => setFormData({ ...formData, dueAt: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="PENDING">En attente</option>
                  <option value="PAID">Payée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.templateName}
                  onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                >
                  {TEMPLATE_OPTIONS.map((template) => (
                    <option key={template.value} value={template.value}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={handleCloseModal}>
                  Annuler
                </Button>
                <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                  {editing ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closePreview}>
          <Card className="w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Résumé facture</h2>
              <button onClick={closePreview} className="p-1 hover:bg-gray-100 rounded">
                <span className="sr-only">Fermer</span>
                ?
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between"><span>Numéro</span><span>{preview.number || preview._id || 'N/A'}</span></div>
              <div className="flex justify-between"><span>Client</span><span>{getCustomerLabel(preview)}</span></div>
              <div className="flex justify-between"><span>Montant</span><span>{formatCurrency(preview.total || 0)}</span></div>
              <div className="flex justify-between"><span>Emise le</span><span>{preview.issuedAt ? formatDate(preview.issuedAt) : 'N/A'}</span></div>
              <div className="flex justify-between"><span>Échéance</span><span>{preview.dueAt ? formatDate(preview.dueAt) : 'N/A'}</span></div>
              <div className="flex justify-between"><span>Statut</span><span>{getInvoiceStatus(preview)}</span></div>
              <div className="flex justify-between"><span>Template</span><span>{preview.templateName || 'default'}</span></div>
              <div className="flex justify-between"><span>Version</span><span>v{preview.version || 1}</span></div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  closePreview();
                  handleOpenModal(preview);
                }}
              >
                Modifier
              </Button>
              <Button type="button" onClick={() => handleDownload(preview)}>
                Télécharger PDF
              </Button>
            </div>
          </Card>
        </div>
      )}

      {versionsInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeVersions}>
          <Card className="w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Historique des versions</h2>
              <button onClick={closeVersions} className="p-1 hover:bg-gray-100 rounded">
                <span className="sr-only">Fermer</span>
                ?
              </button>
            </div>
            {versionsLoading ? (
              <div className="text-sm text-gray-500">Chargement...</div>
            ) : versionsData && versionsData.versions.length > 0 ? (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">Version actuelle: v{versionsData.version || 1}</div>
                <div className="divide-y">
                  {versionsData.versions.map((version) => (
                    <div key={version.version} className="py-3 text-sm text-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">v{version.version}</span>
                        <span className="text-xs text-gray-500">
                          {version.createdAt ? formatDate(version.createdAt) : ''}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <div>Montant: {formatCurrency(version.snapshot?.total || 0)}</div>
                        <div>Statut: {version.snapshot?.status || 'PENDING'}</div>
                        <div>Client: {version.snapshot?.customerName || 'Client inconnu'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Aucune version precedente.</div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
