import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import { BarChart3, Receipt, Users, Wallet, Bell, Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Menu, X, Home, FileText, Settings, LogOut, Search, Filter } from 'lucide-react';

interface Stats {
  totalSales: number;
  totalExpenses: number;
  balance: number;
  unreadNotifications: number;
  totalInvoices: number;
  unpaidInvoices: number;
}

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

interface MonthlyData {
  month: string;
  total: number;
}

export default function Dashboard() {
  // Récupération des données depuis l'API
  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => (await api.get('/stats')).data,
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const response = await api.get('/transactions', { params: { limit: 5 } });
      // Filtrer les transactions undefined
      return Array.isArray(response.data) ? response.data.filter(t => t) : [];
    },
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery<{
    monthlySales: MonthlyData[];
    monthlyExpenses: MonthlyData[];
  }>({
    queryKey: ['monthly-data'],
    queryFn: async () => (await api.get('/transactions/monthly')).data,
  });

  // Calcul du profit basé sur les données
  const profit = statsData ? statsData.totalSales - statsData.totalExpenses : 0;

  // Données formatées pour le graphique
  const chartData = monthlyData ? monthlyData.monthlySales.map((sale, i) => ({
    month: sale.month,
    revenue: sale.total,
    expenses: monthlyData.monthlyExpenses[i]?.total || 0,
  })) : [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }: { title: string; value: string | number; icon: React.FC<any>; trend?: number; color: string }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && trend !== null && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );

  const TransactionItem = ({ transaction }: { transaction?: Transaction }) => {
    // Récupérer le client si customerId existe
    const getClientName = () => {
      return transaction?.customerId ? `Client ${transaction.customerId}` : 'Aucun client';
    };

    return (
      <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${transaction?.type === 'sale' ? 'bg-green-100' : 'bg-red-100'}`}>
            {transaction?.type === 'sale' ? (
              <TrendingUp className={`w-5 h-5 ${transaction?.type === 'sale' ? 'text-green-600' : 'text-red-600'}`} />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{transaction ? getClientName() : 'Transaction inconnue'}</p>
            <p className="text-sm text-gray-500">{transaction?.date ? new Date(transaction.date).toLocaleDateString('fr-FR') : ''}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`font-semibold ${transaction?.amount && transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {transaction?.amount ? formatCurrency(Math.abs(transaction.amount)) : 'N/A'}
          </p>
          <span className={`text-xs px-2 py-1 rounded-full ${
            transaction?.type === 'sale' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {transaction?.type === 'sale' ? 'Vente' : transaction?.type === 'expense' ? 'Dépense' : 'Inconnu'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="h-20 flex items-center justify-center">
              <div className="text-gray-500">Chargement...</div>
            </div>
          </div>
        ) : statsError ? (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 col-span-4">
            <div className="text-red-500 text-center">Erreur de chargement des données</div>
          </div>
        ) : (
          <>
            <StatCard
              title="Revenus du mois"
              value={formatCurrency(statsData?.totalSales || 0)}
              icon={TrendingUp}
              trend={12}
              color="bg-green-500"
            />
            <StatCard
              title="Dépenses du mois"
              value={formatCurrency(statsData?.totalExpenses || 0)}
              icon={TrendingDown}
              trend={-5}
              color="bg-red-500"
            />
            <StatCard
              title="Bénéfice net"
              value={formatCurrency(profit)}
              icon={DollarSign}
              trend={18}
              color="bg-blue-500"
            />
            <StatCard
              title="Total clients"
              value={statsData?.totalInvoices || 0}
              icon={Users}
              trend={undefined}
              color="bg-purple-500"
            />
          </>
        )}
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Évolution mensuelle</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg font-medium">
                Revenus
              </button>
              <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
                Dépenses
              </button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {monthlyLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-500">Chargement...</div>
              </div>
            ) : chartData.length > 0 ? (
              chartData.map((data, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col gap-1">
                    <div
                      className="w-full bg-green-500 rounded-t-lg hover:bg-green-600 transition-colors cursor-pointer"
                      style={{ height: `${(data.revenue / Math.max(2500000, data.revenue)) * 200}px` }}
                      title={formatCurrency(data.revenue)}
                    />
                    <div
                      className="w-full bg-red-500 rounded-b-lg hover:bg-red-600 transition-colors cursor-pointer"
                      style={{ height: `${(data.expenses / Math.max(2500000, data.expenses)) * 200}px` }}
                      title={formatCurrency(data.expenses)}
                    />
                  </div>
                  <span className="text-xs text-gray-600 font-medium">{data.month}</span>
                </div>
              ))
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-500">Aucune donnée disponible</div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Transactions récentes</h3>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
              Voir tout
            </button>
          </div>
          <div className="space-y-2">
            {transactionsLoading ? (
              <div className="p-4 text-center text-gray-500">Chargement...</div>
            ) : transactionsData && transactionsData.length > 0 ? (
              transactionsData.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">Aucune transaction récente</div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <Calendar className="w-8 h-8 mb-3 opacity-80" />
          <h4 className="text-sm font-medium mb-1 opacity-90">Factures en attente</h4>
          <p className="text-3xl font-bold">{statsData?.unpaidInvoices || 0}</p>
          <p className="text-sm mt-2 opacity-90">À collecter: {formatCurrency(statsData?.unpaidInvoices ? statsData.unpaidInvoices * 85000 : 0)}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <BarChart3 className="w-8 h-8 mb-3 opacity-80" />
          <h4 className="text-sm font-medium mb-1 opacity-90">Taux de marge</h4>
          <p className="text-3xl font-bold">{statsData?.totalSales && statsData.totalExpenses ? Math.round(((statsData.totalSales - statsData.totalExpenses) / statsData.totalSales) * 100) : 0}%</p>
          <p className="text-sm mt-2 opacity-90">+3.2% vs mois dernier</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <Wallet className="w-8 h-8 mb-3 opacity-80" />
          <h4 className="text-sm font-medium mb-1 opacity-90">Trésorerie disponible</h4>
          <p className="text-3xl font-bold">{formatCurrency(statsData?.balance || 0)}</p>
          <p className="text-sm mt-2 opacity-90">Solde actuel</p>
        </div>
      </div>
    </div>
  );
}