import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { fetchDashboard } from '../api/client';
import StatCard from '../components/StatCard';

const formatCurrency = (amount) => `${amount.toLocaleString('fr-FR')} XOF`;

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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor=\"#fbbf24\" />}
    >
      <Text style={styles.header}>Tableau de bord</Text>
      {!data ? (
        <Text style={styles.placeholder}>Glissez pour rafraîchir</Text>
      ) : (
        <>
          <View style={styles.grid}>
            <StatCard label=\"Ventes totales\" value={formatCurrency(data.totals.sales)} accent=\"#22d3ee\" />
            <StatCard
              label=\"Dépenses totales\"
              value={formatCurrency(data.totals.expenses)}
              accent=\"#f97316\"
            />
          </View>
          <View style={styles.grid}>
            <StatCard
              label=\"Trésorerie\"
              value={formatCurrency(data.totals.cashFlow)}
              helper=\"Ventes - Dépenses\"
              accent=\"#a3e635\"
            />
            <StatCard
              label=\"Ce mois\"
              value={formatCurrency(data.totals.monthCashFlow)}
              helper={`Ventes: ${formatCurrency(data.totals.monthSales)} | Dép.: ${formatCurrency(
                data.totals.monthExpenses
              )}`}
              accent=\"#fbbf24\"
            />
          </View>

          <Text style={styles.sectionTitle}>Tendance 6 derniers mois</Text>
          <View style={styles.trend}>
            {(data.monthly.sales || []).map((item) => (
              <View style={styles.trendRow} key={`sale-${item.label}`}>
                <Text style={styles.trendLabel}>Ventes {item.label}</Text>
                <Text style={styles.trendValue}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
            {(data.monthly.expenses || []).map((item) => (
              <View style={styles.trendRow} key={`expense-${item.label}`}>
                <Text style={styles.trendLabel}>Dépenses {item.label}</Text>
                <Text style={styles.trendValue}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Factures</Text>
          <View style={styles.trend}>
            {(data.invoices || []).map((item) => (
              <View style={styles.trendRow} key={`invoice-${item._id || item._id?.status}`}>
                <Text style={styles.trendLabel}>{item._id}</Text>
                <Text style={styles.trendValue}>{formatCurrency(item.total || 0)}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1224',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    color: '#e2e8f0',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  placeholder: {
    color: '#94a3b8',
    padding: 12,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  sectionTitle: {
    marginTop: 18,
    marginBottom: 8,
    color: '#cbd5e1',
    fontWeight: '700',
    fontSize: 16,
  },
  trend: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  trendLabel: {
    color: '#e2e8f0',
  },
  trendValue: {
    color: '#fbbf24',
    fontWeight: '700',
  },
});

export default DashboardScreen;
