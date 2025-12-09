import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import StatTile from '../components/StatTile';
import Skeleton from '../components/Skeleton';
import Card from '../components/Card';

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
          <Card className="min-h-[120px] flex items-center justify-center text-muted">
            Graphiques mensuels à brancher sur /transactions/monthly (barres ventes/dépenses).
          </Card>
        </>
      )}
    </div>
  );
}
