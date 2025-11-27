import { useEffect, useMemo, useState } from 'react';
import { fetchDashboard } from '../api/client.js';

const format = (n) => `${(n || 0).toLocaleString('fr-FR')} XOF`;

const SummaryCard = ({ title, value, helper, gradient }) => (
  <div className="card" style={{ background: gradient, color: '#0f172a', border: 'none' }}>
    <div className="muted" style={{ color: '#0f172a', opacity: 0.7, marginBottom: 4 }}>
      {title}
    </div>
    <div className="stat-value" style={{ color: '#0f172a' }}>
      {value}
    </div>
    {helper ? (
      <div className="muted" style={{ color: '#0f172a', opacity: 0.75, marginTop: 4 }}>
        {helper}
      </div>
    ) : null}
  </div>
);

const Pill = ({ label, value, color }) => (
  <div style={{ background: color, padding: '10px 12px', borderRadius: 12 }}>
    <div className="muted" style={{ color: '#0f172a', opacity: 0.7 }}>
      {label}
    </div>
    <div style={{ fontWeight: 700, color: '#0f172a' }}>{value}</div>
  </div>
);

const BarChart = ({ sales = [], expenses = [] }) => {
  const merged = sales.map((s, idx) => ({ label: s.label, sale: s.total, expense: expenses[idx]?.total || 0 }));
  const max = Math.max(1, ...merged.map((m) => Math.max(m.sale, m.expense)));

  return (
    <div className="card">
      <div className="section-title" style={{ marginTop: 0 }}>
        Statistiques
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, minHeight: 180 }}>
        {merged.map((m) => (
          <div key={m.label} style={{ flex: 1, textAlign: 'center' }}>
            <div
              style={{
                display: 'flex',
                gap: 4,
                alignItems: 'flex-end',
                justifyContent: 'center',
                height: 140,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: (m.sale / max) * 120 || 6,
                  borderRadius: 8,
                  background: '#22d3ee',
                }}
              />
              <div
                style={{
                  width: 16,
                  height: (m.expense / max) * 120 || 6,
                  borderRadius: 8,
                  background: '#fb7185',
                }}
              />
            </div>
            <div className="muted" style={{ marginTop: 6 }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Legend color="#22d3ee" label="Ventes" />
        <Legend color="#fb7185" label="Dépenses" />
      </div>
    </div>
  );
};

const Legend = ({ color, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <div style={{ width: 10, height: 10, background: color, borderRadius: 999 }} />
    <div className="muted">{label}</div>
  </div>
);

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

  const invoiceStats = useMemo(
    () =>
      (data?.invoices || []).map((i) => ({
        label: i._id || 'Inconnu',
        total: format(i.total || 0),
        count: i.count,
      })),
    [data]
  );

  const recommendations = useMemo(() => {
    if (!data) return [];
    const tips = [];
    if (data.totals.monthCashFlow < 0) {
      tips.push('Cashflow du mois négatif : réduisez les charges variables et relancez les factures en retard.');
    }
    const overdue = (data.invoices || []).find((i) => i._id === 'overdue');
    if (overdue?.count) {
      tips.push(`${overdue.count} facture(s) en retard : priorisez les relances clients cette semaine.`);
    }
    if ((data.totals.expenses || 0) > (data.totals.sales || 0) * 0.7) {
      tips.push('Les dépenses dépassent 70% des ventes : renégociez fournisseurs ou échelonnez certains paiements.');
    }
    if (tips.length === 0) {
      tips.push('Indicators au vert : consolidez la trésorerie et préparez une campagne commerciale ciblée.');
    }
    return tips;
  }, [data]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ marginTop: 0 }}>Tableau de bord</h2>
        <input
          className="input"
          placeholder="Rechercher"
          style={{ maxWidth: 240, background: '#fff', color: '#0f172a', borderColor: '#e2e8f0' }}
        />
      </div>

      {!data ? (
        <p className="muted">Chargement...</p>
      ) : (
        <>
          <div className="card-grid">
            <SummaryCard
              title="Ventes totales"
              value={format(data.totals.sales)}
              helper="Cumul"
              gradient="linear-gradient(135deg, #22d3ee, #0ea5e9)"
            />
            <SummaryCard
              title="Dépenses totales"
              value={format(data.totals.expenses)}
              helper="Cumul"
              gradient="linear-gradient(135deg, #fb7185, #f97316)"
            />
            <SummaryCard
              title="Trésorerie"
              value={format(data.totals.cashFlow)}
              helper="Solde global"
              gradient="linear-gradient(135deg, #a3e635, #65a30d)"
            />
            <SummaryCard
              title="Cashflow (mois)"
              value={format(data.totals.monthCashFlow)}
              helper={`Ventes ${format(data.totals.monthSales)} · Dép. ${format(data.totals.monthExpenses)}`}
              gradient="linear-gradient(135deg, #fbbf24, #f59e0b)"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: 12, marginTop: 12 }}>
            <div className="card">
              <div className="section-title" style={{ marginTop: 0 }}>
                Balance
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>{format(data.totals.cashFlow)}</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <Pill label="Ventes" value={format(data.totals.sales)} color="rgba(34,211,238,0.2)" />
                <Pill label="Dépenses" value={format(data.totals.expenses)} color="rgba(251,113,133,0.2)" />
              </div>
            </div>
            <div className="card">
              <div className="section-title" style={{ marginTop: 0 }}>
                Factures
              </div>
              {invoiceStats.length === 0 ? (
                <div className="muted">Pas de données</div>
              ) : (
                invoiceStats.map((inv) => (
                  <div
                    key={inv.label}
                    style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{inv.label}</div>
                      <div className="muted">{inv.count} facture(s)</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{inv.total}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, marginTop: 12 }}>
            <div className="card">
              <div className="section-title" style={{ marginTop: 0 }}>
                Transactions récentes
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <TransactionRow label="Ventes (mois)" amount={data.totals.monthSales} color="#22d3ee" />
                <TransactionRow label="Dépenses (mois)" amount={-data.totals.monthExpenses} color="#fb7185" />
                <TransactionRow label="Cashflow (mois)" amount={data.totals.monthCashFlow} color="#fbbf24" />
              </div>
            </div>
            <BarChart sales={data.monthly.sales || []} expenses={data.monthly.expenses || []} />
          </div>

          <div className="card">
            <div className="section-title" style={{ marginTop: 0 }}>
              Recommandations IA
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {recommendations.map((tip, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: 'rgba(34,211,238,0.08)',
                  }}
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const TransactionRow = ({ label, amount, color }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 12,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--border)',
    }}
  >
    <div style={{ width: 10, height: 10, borderRadius: 999, background: color }} />
    <div style={{ flex: 1 }}>
      <div className="muted" style={{ marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ color: '#0f172a', fontWeight: 700 }}>{format(amount)}</div>
    </div>
  </div>
);

export default Dashboard;
