import { useQuery } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import StatTile from '../components/StatTile';
import Skeleton from '../components/Skeleton';
import Card from '../components/Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

type Stats = {
  totalSales: number;
  totalExpenses: number;
  balance: number;
  unreadNotifications: number;
  totalInvoices: number;
  unpaidInvoices: number;
};

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: async () => (await api.get('/stats')).data,
  });

  const monthly = useQuery({
    queryKey: ['stats-monthly'],
    queryFn: async () => (await api.get('/transactions/monthly')).data,
  });

  const categories = useQuery({
    queryKey: ['stats-categories'],
    queryFn: async () => (await api.get('/transactions/categories')).data,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dashboard</h2>
      {isLoading && <Skeleton rows={6} />}
      {isError && <div className="text-danger">Erreur de chargement des statistiques.</div>}
      {data && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatTile label="Ventes" value={data.totalSales} suffix="XOF" />
            <StatTile label="Dépenses" value={data.totalExpenses} suffix="XOF" />
            <StatTile label="Balance" value={data.balance} suffix="XOF" />
            <StatTile label="Factures totales" value={data.totalInvoices} />
            <StatTile label="Factures en attente" value={data.unpaidInvoices} tone="warning" />
            <StatTile label="Notifications non lues" value={data.unreadNotifications} tone="secondary" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="min-h-[320px]">
              <h3 className="text-sm text-muted mb-3">Ventes vs Dépenses (6 derniers mois)</h3>
              {monthly.isLoading && <Skeleton rows={4} />}
              {monthly.data && (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={monthly.data.monthlySales.map((s, i) => ({
                    month: s.month,
                    sales: s.total,
                    expenses: monthly.data.monthlyExpenses[i]?.total || 0,
                  }))}>
                    <XAxis dataKey="month" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#2563eb" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            <Card className="min-h-[320px]">
              <h3 className="text-sm text-muted mb-3">Montant par catégorie</h3>
              {categories.isLoading && <Skeleton rows={4} />}
              {categories.data && (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={categories.data}>
                    <XAxis dataKey="category" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="_sum.amount" fill="#2563eb" name="Montant" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          <Card className="min-h-[260px]">
            <h3 className="text-sm text-muted mb-3">Répartition ventes vs dépenses</h3>
            {data && (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Ventes', value: data.totalSales },
                      { name: 'Dépenses', value: data.totalExpenses },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    label
                  >
                    <Cell fill="#2563eb" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
