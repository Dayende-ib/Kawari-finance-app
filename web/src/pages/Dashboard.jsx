import { useEffect, useState } from 'react';
import { fetchDashboard } from '../api/client.js';
import StatCard from '../components/StatCard.jsx';

const format = (n) => `${(n || 0).toLocaleString('fr-FR')} XOF`;

const Dashboard = () => {
  const [data, setData] = useState(null);

  const load = async () => {
    try {
      const { data } = await fetchDashboard();
      setData(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur chargement dashboard');
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Tableau de bord</h2>
      {!data ? (
        <p className="muted">Chargement...</p>
      ) : (
        <>
          <div className="card-grid">
            <StatCard label="Ventes totales" value={format(data.totals.sales)} color="var(--accent-2)" />
            <StatCard label="Dépenses totales" value={format(data.totals.expenses)} color="var(--accent-3)" />
            <StatCard
              label="Trésorerie"
              value={format(data.totals.cashFlow)}
              hint="Ventes - Dépenses"
              color="var(--accent)"
            />
            <StatCard
              label="Ce mois"
              value={format(data.totals.monthCashFlow)}
              hint={`Ventes ${format(data.totals.monthSales)} · Dépenses ${format(data.totals.monthExpenses)}`}
              color="#a3e635"
            />
          </div>

          <div className="section-title">Tendance 6 mois</div>
          <div className="card">
            {(data.monthly.sales || []).map((item) => (
              <div
                key={`sale-${item.label}`}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}
              >
                <span className="muted">Ventes {item.label}</span>
                <strong>{format(item.total)}</strong>
              </div>
            ))}
            {(data.monthly.expenses || []).map((item) => (
              <div
                key={`expense-${item.label}`}
                style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}
              >
                <span className="muted">Dépenses {item.label}</span>
                <strong>{format(item.total)}</strong>
              </div>
            ))}
          </div>

          <div className="section-title">Factures par statut</div>
          <div className="card-grid">
            {(data.invoices || []).map((it) => (
              <div className="card" key={it._id}>
                <div className="muted">{it._id}</div>
                <div className="stat-value">{format(it.total || 0)}</div>
                <div className="muted">{it.count} facture(s)</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
