import { View, Text, StyleSheet } from 'react-native';

const StatCard = ({ label, value, helper, accent = '#10b981' }) => {
  return (
    <View style={[styles.card, { borderColor: accent }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: accent }]}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#0f172a',
  },
  label: {
    color: '#e2e8f0',
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
  helper: {
    color: '#94a3b8',
    marginTop: 6,
    fontSize: 12,
  },
});

export default StatCard;
