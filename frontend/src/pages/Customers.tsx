import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import { Plus, Search, Edit2, Mail, Phone, TrendingUp, X } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { notify } from '../components/Toast';

interface Customer {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
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

export default function Customers() {
  const [searchInput, setSearchInput] = useState('');
  const [showAnonymous, setShowAnonymous] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const queryClient = useQueryClient();

  const { data: customersData, isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ['customers'],
    queryFn: async () => await api.get('/customers'),
  });

  const { data: statsData } = useQuery<Stats>({
    queryKey: ['customer-stats'],
    queryFn: async () => await api.get('/stats'),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { name: string; email?: string; phone?: string }) => await api.post('/customers', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      notify('Client créé');
      setFormData({ name: '', email: '', phone: '' });
      setShowModal(false);
    },
    onError: (err: any) => notify(err?.data?.message || 'Erreur lors de la création', 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: { name: string; email?: string; phone?: string } }) =>
      await api.put(`/customers/${payload.id}`, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      notify('Client mis à jour');
      setFormData({ name: '', email: '', phone: '' });
      setSelectedCustomer(null);
      setShowModal(false);
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

  const normalizedSearch = searchInput.trim().toLowerCase();
  const filteredCustomers = (customersData || []).filter((customer) => {
    if (showAnonymous && customer.name) return false;
    if (!normalizedSearch) return true;
    return (
      customer.name?.toLowerCase().includes(normalizedSearch) ||
      customer.email?.toLowerCase().includes(normalizedSearch) ||
      customer.phone?.toLowerCase().includes(normalizedSearch)
    );
  });

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
    setFormData({ name: '', email: '', phone: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
    };

    if (selectedCustomer) {
      const id = selectedCustomer._id || selectedCustomer.id;
      if (!id) {
        notify('ID client introuvable', 'error');
        return;
      }
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Rechercher un client..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            className="px-3 py-2 rounded-lg border text-sm font-medium transition w-full sm:w-auto ${showAnonymous ? 'bg-gray-100 text-gray-700 border-gray-300' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}"
            onClick={() => setShowAnonymous((prev) => !prev)}
          >
            {showAnonymous ? 'Voir tous' : 'Sans nom'}
          </button>
          <button
            className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
            onClick={() => setShowModal(true)}
          >
          <Plus className="w-5 h-5" />
          Nouveau Client
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-6 h-6 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total clients</p>
              <p className="text-2xl font-bold text-gray-900">{customersData ? customersData.length : 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-6 h-6 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenu total clients</p>
              <p className="text-2xl font-bold text-gray-900">{statsData ? formatCurrency(statsData.totalSales) : '0'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-6 h-6 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total factures</p>
              <p className="text-2xl font-bold text-gray-900">{statsData ? statsData.totalInvoices : 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <div className="w-6 h-6 text-orange-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Valeur moyenne</p>
              <p className="text-2xl font-bold text-gray-900">{statsData ? formatCurrency(statsData.balance / (customersData?.length || 1)) : '0'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {customersLoading ? (
            <div className="md:col-span-2 p-6 text-center text-gray-500">Chargement...</div>
          ) : filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => {
              const customerId = customer._id || customer.id || customer.name;
              const fallbackEmail = customer.name ? `${customer.name.toLowerCase().replace(/\s+/g, '')}@example.com` : 'email@exemple.com';
              return (
                <div
                  key={customerId}
                  className="border border-gray-200 rounded-xl p-6 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-lg text-gray-900">{customer.name || 'Client sans nom'}</h4>
                      {!customer.name && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">Sans nom</span>
                      )}
                    </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {customer.email || fallbackEmail}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Phone className="w-4 h-4" />
                        {customer.phone || 'Non renseigné'}
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg self-start" onClick={() => handleEdit(customer)}>
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total dépenses</p>
                      <p className="font-semibold text-green-600">{formatCurrency(0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Factures</p>
                      <p className="font-semibold text-gray-900">0</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Dernier achat</p>
                      <p className="font-semibold text-gray-900 text-xs">{formatDate(customer.createdAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="md:col-span-2 p-6 text-center text-gray-500">Aucun client trouvé</div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedCustomer ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nom (optionnel)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Email (optionnel)"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Téléphone (optionnel)"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="ghost" onClick={handleCloseModal}>
                  Annuler
                </Button>
                <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                  {selectedCustomer ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
