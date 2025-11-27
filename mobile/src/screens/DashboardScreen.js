import { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchDashboard } from '../api/client';

const formatCurrency = (amount = 0) => `${Number(amount || 0).toLocaleString('fr-FR')} XOF`;

const SummaryCard = ({ title, value, helper, colors }) => (
  <LinearGradient colors={colors} style={styles.summaryCard}>
    <Text style={styles.summaryTitle}>{title}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
    {helper ? <Text style={styles.summaryHelper}>{helper}</Text> : null}
  </LinearGradient>
);

const StatPill = ({ label, value, color }) => (
  <View style={[styles.pill, { backgroundColor: color }]}>
    <Text style={styles.pillLabel}>{label}</Text>
    <Text style={styles.pillValue}>{value}</Text>
  </View>
);

const BarChart = ({ sales, expenses }) => {
  const months = sales.map((s, idx) => {
    const expense = expenses[idx];
    return { label: s.label, sale: s.total, expense: expense ? expense.total : 0 };
  });
  const max = Math.max(1, ...months.map((m) => Math.max(m.sale || 0, m.expense || 0)));

  return (
    <View style={styles.chartBox}>
      <Text style={styles.sectionTitle}>Statistiques</Text>
      <View style={styles.chartBars}>
        {months.map((m) => (
          <View key={m.label} style={styles.chartBarItem}>
            <View style={[styles.chartBar, { height: (m.sale / max) * 120 || 6, backgroundColor: '#22d3ee' }]} />
            <View style={[styles.chartBar, { height: (m.expense / max) * 120 || 6, backgroundColor: '#fb7185' }]} />
            <Text style={styles.chartLabel}>{m.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#22d3ee' }]} />
          <Text style={styles.legendText}>Ventes</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#fb7185' }]} />
          <Text style={styles.legendText}>Dépenses</Text>
        </View>
      </View>
    </View>
  );
};

const TransactionRow = ({ label, amount, color }) => (
  <View style={styles.transactionRow}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <View style={{ flex: 1 }}>
      <Text style={styles.trendLabel}>{label}</Text>
      <Text style={styles.muted}>Dernier mois</Text>
    </View>
    <Text style={[styles.trendValue, { color }]}>{formatCurrency(amount)}</Text>
  </View>
);

const DashboardScreen = () => {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetchDashboard();
      setData(res.data);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const invoiceStats = useMemo(
    () =>
      (data?.invoices || []).map((i) => ({
        label: i._id || 'Inconnu',
        total: formatCurrency(i.total || 0),
      })),
    [data]
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor="#fbbf24" />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.header}>Tableau de bord</Text>
        <TextInput style={styles.search} placeholder="Rechercher" placeholderTextColor="#94a3b8" />
      </View>

      {!data ? (
        <Text style={styles.placeholder}>Glissez pour rafraîchir</Text>
      ) : (
        <>
          <View style={styles.summaryGrid}>
            <SummaryCard
              title="Ventes totales"
              value={formatCurrency(data.totals.sales)}
              helper="Cumul"
              colors={['#22d3ee', '#0ea5e9']}
            />
            <SummaryCard
              title="Dépenses totales"
              value={formatCurrency(data.totals.expenses)}
              helper="Cumul"
              colors={['#fb7185', '#f97316']}
            />
            <SummaryCard
              title="Trésorerie"
              value={formatCurrency(data.totals.cashFlow)}
              helper="Solde global"
              colors={['#a3e635', '#65a30d']}
            />
            <SummaryCard
              title="Cashflow (mois)"
              value={formatCurrency(data.totals.monthCashFlow)}
              helper={`Ventes ${formatCurrency(data.totals.monthSales)} · Dép. ${formatCurrency(
                data.totals.monthExpenses
              )}`}
              colors={['#fbbf24', '#f59e0b']}
            />
          </View>

          <View style={styles.sectionRow}>
            <View style={[styles.card, { flex: 1 }]}>
              <Text style={styles.sectionTitle}>Balance</Text>
              <Text style={styles.balanceValue}>{formatCurrency(data.totals.cashFlow)}</Text>
              <View style={styles.balanceRow}>
                <StatPill label="Ventes" value={formatCurrency(data.totals.sales)} color="rgba(34,211,238,0.15)" />
                <StatPill
                  label="Dépenses"
                  value={formatCurrency(data.totals.expenses)}
                  color="rgba(251,113,133,0.15)"
                />
              </View>
            </View>
            <View style={[styles.card, { flex: 1 }]}>
              <Text style={styles.sectionTitle}>Factures</Text>
              {invoiceStats.length === 0 ? (
                <Text style={styles.muted}>Pas de données</Text>
              ) : (
                invoiceStats.map((inv) => (
                  <View key={inv.label} style={styles.invoiceRow}>
                    <Text style={styles.trendLabel}>{inv.label}</Text>
                    <Text style={styles.trendValue}>{inv.total}</Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Transactions récentes</Text>
            <View style={{ gap: 8 }}>
              <TransactionRow label="Ventes (mois)" amount={data.totals.monthSales} color="#22d3ee" />
              <TransactionRow label="Dépenses (mois)" amount={-data.totals.monthExpenses} color="#fb7185" />
              <TransactionRow label="Cashflow (mois)" amount={data.totals.monthCashFlow} color="#fbbf24" />
            </View>
          </View>

          <BarChart sales={data.monthly.sales || []} expenses={data.monthly.expenses || []} />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef2f7',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  header: {
    color: '#0f172a',
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
  },
  search: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 120,
    color: '#0f172a',
  },
  placeholder: {
    color: '#94a3b8',
    padding: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryCard: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
  },
  summaryTitle: {
    color: '#f8fafc',
    fontSize: 13,
    marginBottom: 6,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  summaryHelper: {
    color: '#e2e8f0',
    marginTop: 6,
    fontSize: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 12,
  },
  sectionTitle: {
    marginBottom: 8,
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 16,
  },
  balanceValue: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 24,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
  },
  pillLabel: {
    color: '#0f172a',
    fontWeight: '700',
  },
  pillValue: {
    color: '#0f172a',
    marginTop: 4,
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  trendLabel: {
    color: '#0f172a',
  },
  trendValue: {
    color: '#0f172a',
    fontWeight: '700',
  },
  muted: {
    color: '#94a3b8',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 10,
  },
  chartBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 12,
    marginBottom: 18,
  },
  chartBars: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-end',
    marginTop: 8,
  },
  chartBarItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  chartBar: {
    width: '100%',
    borderRadius: 8,
  },
  chartLabel: {
    color: '#475569',
    fontSize: 12,
  },
  chartLegend: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  legendText: {
    color: '#475569',
  },
});

export default DashboardScreen;
