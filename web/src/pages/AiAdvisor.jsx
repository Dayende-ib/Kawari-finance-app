import { useEffect, useMemo, useState } from 'react';
import { fetchDashboard } from '../api/client.js';

const buildAdvice = (data) => {
  if (!data) return [];
  const adv = [];

  if (data.totals.monthCashFlow < 0) {
    adv.push('La trésorerie du mois est négative : réduisez les charges non essentielles et priorisez le recouvrement des factures.');
  } else if (data.totals.cashFlow < 0) {
    adv.push('Cashflow global négatif : sécurisez un matelas de trésorerie (épargne, ligne de crédit) et limitez les dépenses variables.');
  }

  const overdue = (data.invoices || []).find((i) => i._id === 'overdue');
  if (overdue?.count) {
    adv.push(`Il y a ${overdue.count} facture(s) en retard : relancez ces clients et proposez un paiement partiel si besoin.`);
  }

  if ((data.totals.expenses || 0) > (data.totals.sales || 0) * 0.7) {
    adv.push('Les dépenses dépassent 70% des ventes : renégociez fournisseurs et optimisez les stocks/achats.');
  }

  if ((data.totals.monthSales || 0) < (data.totals.monthExpenses || 0)) {
    adv.push('Les ventes du mois sont inférieures aux dépenses : lancez une promo courte ou un rappel aux clients fidèles.');
  }

  if (adv.length === 0) {
    adv.push('Situation saine : maintenez vos marges et planifiez les investissements (marketing ciblé, stock stratégique).');
  }
  return adv;
};

const AiAdvisor = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchDashboard();
      setData(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur chargement conseils');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const advice = useMemo(() => buildAdvice(data), [data]);

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Conseils IA</h2>
      {loading ? <p className="muted">Chargement...</p> : null}
      {!data ? (
        <p className="muted">Aucune donnée, rafraîchissez.</p>
      ) : (
        <div className="card" style={{ display: 'grid', gap: 10 }}>
          {advice.map((tip, idx) => (
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
      )}
    </div>
  );
};

export default AiAdvisor;
