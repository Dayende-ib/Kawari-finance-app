import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createInvoice, fetchInvoices } from '../api/client';

const InvoiceFormScreen = () => {
  const [number, setNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchInvoices();
      setItems(res.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    try {
      await createInvoice({
        number,
        customerName,
        amount: Number(amount),
        dueDate,
        status,
      });
      Alert.alert('Enregistré', 'Facture ajoutée');
      setNumber('');
      setCustomerName('');
      setAmount('');
      setDueDate('');
      setStatus('draft');
      load();
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible de créer la facture');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Facture</Text>
      <TextInput
        placeholder=\"Numéro\"
        placeholderTextColor=\"#94a3b8\"
        value={number}
        onChangeText={setNumber}
        style={styles.input}
      />
      <TextInput
        placeholder=\"Client\"
        placeholderTextColor=\"#94a3b8\"
        value={customerName}
        onChangeText={setCustomerName}
        style={styles.input}
      />
      <TextInput
        placeholder=\"Montant (XOF)\"
        placeholderTextColor=\"#94a3b8\"
        keyboardType=\"numeric\"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />
      <TextInput
        placeholder=\"Échéance (YYYY-MM-DD)\"
        placeholderTextColor=\"#94a3b8\"
        value={dueDate}
        onChangeText={setDueDate}
        style={styles.input}
      />
      <TextInput
        placeholder=\"Statut (draft/sent/paid/overdue)\"
        placeholderTextColor=\"#94a3b8\"
        value={status}
        onChangeText={setStatus}
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Enregistrer</Text>
      </Pressable>

      <Text style={[styles.title, { marginTop: 20 }]}>Dernières factures</Text>
      {loading ? (
        <ActivityIndicator color=\"#fbbf24\" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View>
                <Text style={styles.itemTitle}>{item.number}</Text>
                <Text style={styles.itemSubtitle}>{item.customerName}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.itemStatus}>{item.status}</Text>
                <Text style={styles.itemAmount}>{item.amount?.toLocaleString('fr-FR')} XOF</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1224',
    padding: 16,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#111827',
    borderColor: '#1f2937',
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    color: '#e5e7eb',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    fontWeight: '700',
    color: '#0f172a',
  },
  item: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1f2937',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemTitle: {
    color: '#e2e8f0',
    fontWeight: '700',
  },
  itemSubtitle: {
    color: '#94a3b8',
  },
  itemStatus: {
    color: '#fbbf24',
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  itemAmount: {
    color: '#e2e8f0',
    marginTop: 4,
  },
});

export default InvoiceFormScreen;
