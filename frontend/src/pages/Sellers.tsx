import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

interface Seller {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  stats?: {
    totalSales: number;
    totalExpenses: number;
    transactionCount: number;
    invoiceCount: number;
  };
}

export default function Sellers() {
  const [showModal, setShowModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const queryClient = useQueryClient();

  const { data: sellers = [], isLoading } = useQuery<Seller[]>({
    queryKey: ['sellers'],
    queryFn: async () => await api.get('/auth/sellers'),
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => await api.post('/auth/sellers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      setFormData({ name: '', email: '', password: '' });
      setShowModal(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => await api.patch(`/auth/sellers/${selectedSeller?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
      setFormData({ name: '', email: '', password: '' });
      setSelectedSeller(null);
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => await api.delete(`/auth/sellers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellers'] });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSeller) {
      updateMutation.mutate({ name: formData.name, email: formData.email });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (seller: Seller) => {
    setSelectedSeller(seller);
    setFormData({ name: seller.name, email: seller.email, password: '' });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce vendeur?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSeller(null);
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="space-y-6">
      {/* En-tête avec bouton d'ajout */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des vendeurs</h1>
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Ajouter un vendeur
        </Button>
      </div>

      {/* Modal de création/édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {selectedSeller ? 'Modifier le vendeur' : 'Ajouter un vendeur'}
              </h2>
              <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nom"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              {!selectedSeller && (
                <Input
                  label="Mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-300 hover:bg-gray-400"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {selectedSeller ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Liste des vendeurs */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card className="p-8 text-center text-gray-500">Chargement...</Card>
        ) : sellers.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            Aucun vendeur créé. Créez votre premier vendeur pour commencer.
          </Card>
        ) : (
          sellers.map((seller) => (
            <Card key={seller.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{seller.name}</h3>
                  <p className="text-sm text-gray-500">{seller.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Créé le {new Date(seller.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  {seller.stats && (
                    <div className="grid grid-cols-4 gap-4 mt-3 text-xs">
                      <div>
                        <p className="text-gray-600">Ventes</p>
                        <p className="font-semibold text-green-600">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'XOF',
                            minimumFractionDigits: 0,
                          }).format(seller.stats.totalSales)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Dépenses</p>
                        <p className="font-semibold text-red-600">
                          {new Intl.NumberFormat('fr-FR', {
                            style: 'currency',
                            currency: 'XOF',
                            minimumFractionDigits: 0,
                          }).format(seller.stats.totalExpenses)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Transactions</p>
                        <p className="font-semibold text-gray-900">{seller.stats.transactionCount}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Factures</p>
                        <p className="font-semibold text-gray-900">{seller.stats.invoiceCount}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(seller)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(seller.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
