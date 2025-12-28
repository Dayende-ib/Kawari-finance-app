import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import Card from '../components/Card';
import Button from '../components/Button';
import { Building2, Users, TrendingUp, TrendingDown, ShieldAlert } from 'lucide-react';

type PlatformStats = {
  totalCompanies: number;
  totalAdmins: number;
  totalSellers: number;
  totalSales: number;
  totalExpenses: number;
  balance: number;
  totalInvoices: number;
  unpaidInvoices: number;
  unreadNotifications: number;
};

type Company = {
  id: string;
  name: string;
  email: string;
  companyId: string;
  suspended: boolean;
  createdAt: string;
};

export default function Platform() {
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<PlatformStats>({
    queryKey: ['platform', 'stats'],
    queryFn: async () => await api.get('/platform/stats'),
  });

  const { data: companies = [], isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ['platform', 'companies'],
    queryFn: async () => await api.get('/platform/companies'),
  });

  const suspendMutation = useMutation({
    mutationFn: async (payload: { id: string; suspended: boolean }) =>
      await api.patch(`/platform/companies/${payload.id}/suspend`, { suspended: payload.suspended }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform', 'companies'] });
    },
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plateforme Kawari</h1>
          <p className="text-sm text-gray-600">Supervision globale des entreprises et des statistiques.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ShieldAlert className="w-4 h-4" />
          Accès super admin uniquement
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Entreprises"
          value={statsLoading ? '...' : stats?.totalCompanies || 0}
          icon={Building2}
          color="bg-blue-600"
        />
        <StatCard
          title="Admins"
          value={statsLoading ? '...' : stats?.totalAdmins || 0}
          icon={Users}
          color="bg-gray-700"
        />
        <StatCard
          title="Vendeurs"
          value={statsLoading ? '...' : stats?.totalSellers || 0}
          icon={Users}
          color="bg-emerald-600"
        />
        <StatCard
          title="Ventes"
          value={statsLoading ? '...' : formatCurrency(stats?.totalSales || 0)}
          icon={TrendingUp}
          color="bg-green-600"
        />
        <StatCard
          title="Dépenses"
          value={statsLoading ? '...' : formatCurrency(stats?.totalExpenses || 0)}
          icon={TrendingDown}
          color="bg-red-600"
        />
        <StatCard
          title="Balance"
          value={statsLoading ? '...' : formatCurrency(stats?.balance || 0)}
          icon={TrendingUp}
          color="bg-indigo-600"
        />
      </div>

      <Card className="p-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Entreprises</h2>
            <p className="text-xs text-gray-500">Suspendre ou réactiver l’accès aux données.</p>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {companiesLoading ? (
            <div className="p-6 text-gray-500">Chargement...</div>
          ) : companies.length === 0 ? (
            <div className="p-6 text-gray-500">Aucune entreprise trouvée.</div>
          ) : (
            companies.map((company) => (
              <div key={company.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6">
                <div>
                  <p className="text-base font-semibold text-gray-900">{company.name || 'Entreprise sans nom'}</p>
                  <p className="text-sm text-gray-500">{company.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Créée le {new Date(company.createdAt).toLocaleDateString('fr-FR')} • ID {company.companyId}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      company.suspended ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {company.suspended ? 'Suspendue' : 'Active'}
                  </span>
                  <Button
                    variant={company.suspended ? 'secondary' : 'ghost'}
                    loading={suspendMutation.isPending}
                    onClick={() =>
                      suspendMutation.mutate({ id: company.id, suspended: !company.suspended })
                    }
                  >
                    {company.suspended ? 'Réactiver' : 'Suspendre'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.FC<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center gap-3">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
