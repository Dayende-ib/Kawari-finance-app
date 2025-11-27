import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { createSale } from '../api/client';

const SaleFormScreen = () => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Vente');
  const [description, setDescription] = useState('');
  const [counterparty, setCounterparty] = useState('');

  const submit = async () => {
    try {
      await createSale({
        amount: Number(amount),
        category,
        description,
        counterparty,
        date: new Date().toISOString(),
      });
      Alert.alert('Enregistré', 'Vente ajoutée');
      setAmount('');
      setDescription('');
      setCounterparty('');
    } catch (err) {
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible de créer la vente');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouvelle vente</Text>
      <TextInput
        placeholder=\"Montant (XOF)\"
        placeholderTextColor=\"#94a3b8\"
        keyboardType=\"numeric\"
        value={amount}
        onChangeText={setAmount}
        style={styles.input}
      />
      <TextInput
        placeholder=\"Catégorie\"
        placeholderTextColor=\"#94a3b8\"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />
      <TextInput
        placeholder=\"Client\"
        placeholderTextColor=\"#94a3b8\"
        value={counterparty}
        onChangeText={setCounterparty}
        style={styles.input}
      />
      <TextInput
        placeholder=\"Note\"
        placeholderTextColor=\"#94a3b8\"
        value={description}
        onChangeText={setDescription}
        style={[styles.input, { height: 100 }]}
        multiline
      />
      <Pressable style={styles.button} onPress={submit}>
        <Text style={styles.buttonText}>Enregistrer</Text>
      </Pressable>
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
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
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
    backgroundColor: '#22d3ee',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    fontWeight: '700',
    color: '#0f172a',
  },
});

export default SaleFormScreen;
