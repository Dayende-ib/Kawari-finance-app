import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import Suggestions from '../components/Suggestions';
import { Users, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import Card from '../components/Card';

interface Seller {
  id: number;
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

interface Suggestion {
  id: number;
  type: 'warning' | 'success' | 'info';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

export default function AdminDashboard() {
  const { data: sellers = [], isLoading: sellersLoading } = useQuery<Seller[]>({
    queryKey: ['sellers'],
    queryFn: async () => await api.get('/sellers'),
  });

  const { data: adminSuggestions, isLoading: suggestionsLoading } = useQuery<{
    suggestions: Suggestion[];
  }>({
    queryKey: ['suggestions', 'admin'],
    queryFn: async () => await api.get('/suggestions/admin'),
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculer les statistiques globales
  const totalSales = sellers.reduce((sum, seller) => sum + (seller.stats?.totalSales || 0), 0);
  const totalExpenses = sellers.reduce((sum, seller) => sum + (seller.stats?.totalExpenses || 0), 0);
  const totalTransactions = sellers.reduce((sum, seller) => sum + (seller.stats?.transactionCount || 0), 0);
  const totalInvoices = sellers.reduce((sum, seller) => sum + (seller.stats?.invoiceCount || 0), 0);
  const profit = totalSales - totalExpenses;
  const profitMargin = totalSales > 0 ? ((profit / totalSales) * 100).toFixed(1) : 0;

  // Top sellers
  const topSellers = [...sellers]
    .sort((a, b) => (b.stats?.totalSales || 0) - (a.stats?.totalSales || 0))
    .slice(0, 3);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtext,
  }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color: string;
    subtext?: string;
  }) => (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-2">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Vue d'ensemble</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Revenu total"
            value={formatCurrency(totalSales)}
            icon={TrendingUp}
            color="bg-green-600"
            subtext="Tous les vendeurs"
          />
          <StatCard
            title="Dépenses totales"
            value={formatCurrency(totalExpenses)}
            icon={TrendingDown}
            color="bg-red-600"
            subtext="Tous les vendeurs"
          />
          <StatCard
            title="Profit net"
            value={formatCurrency(profit)}
            icon={DollarSign}
            color="bg-blue-600"
            subtext={`Marge: ${profitMargin}%`}
          />
          <StatCard
            title="Équipe"
            value={sellers.length}
            icon={Users}
            color="bg-purple-600"
            subtext={`${totalTransactions} transactions`}
          />
        </div>
      </div>

      {/* Suggestions IA pour l'admin */}
      <div>
        <Suggestions
          suggestions={adminSuggestions?.suggestions || []}
          isLoading={suggestionsLoading}
        />
      </div>

      {/* Performance des vendeurs */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Performance des vendeurs</h2>

        {sellersLoading ? (
          <Card className="p-8 text-center text-gray-500">Chargement...</Card>
        ) : sellers.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">Aucun vendeur. Créez-en un pour commencer.</Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Vendeur
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Ventes
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Dépenses
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Profit
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Factures
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Marge
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.map((seller, index) => {
                    const sellerProfit = (seller.stats?.totalSales || 0) - (seller.stats?.totalExpenses || 0);
                    const sellerMargin =
                      seller.stats?.totalSales && seller.stats.totalSales > 0
                        ? (
                            (sellerProfit / seller.stats.totalSales) *
                            100
                          ).toFixed(1)
                        : 0;
                    const isTopSeller = topSellers.some((s) => s.id === seller.id);

                    return (
                      <tr
                        key={seller.id}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                          isTopSeller ? 'bg-green-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {index + 1}. {seller.name}
                              {isTopSeller && <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">⭐ Top</span>}
                            </p>
                            <p className="text-sm text-gray-500">{seller.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                          {formatCurrency(seller.stats?.totalSales || 0)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-red-600">
                          {formatCurrency(seller.stats?.totalExpenses || 0)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">
                          {formatCurrency(sellerProfit)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {seller.stats?.transactionCount || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {seller.stats?.invoiceCount || 0}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  parseFloat(sellerMargin as string) > 40
                                    ? 'bg-green-600'
                                    : parseFloat(sellerMargin as string) > 20
                                    ? 'bg-yellow-600'
                                    : 'bg-red-600'
                                }`}
                                style={{
                                  width: `${Math.min(parseFloat(sellerMargin as string), 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{sellerMargin}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Meilleurs vendeurs */}
      {topSellers.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Meilleurs vendeurs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topSellers.map((seller, index) => (
              <Card key={seller.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      #{index + 1} {seller.name}
                    </h3>
                    <p className="text-sm text-gray-500">{seller.email}</p>
                  </div>
                  <div className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Revenu</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(seller.stats?.totalSales || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Transactions</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {seller.stats?.transactionCount || 0}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
