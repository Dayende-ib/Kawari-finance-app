import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { login, register, setAuthToken } from '../api/client';

const LoginScreen = ({ onAuth }) => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload =
        mode === 'register'
          ? await register({ name, email, password, company })
          : await login({ email, password });
      const data = payload.data;
      setAuthToken(data.token);
      onAuth(data.user);
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert('Erreur', err.response?.data?.message || 'Impossible de se connecter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kawari</Text>
      <Text style={styles.subtitle}>Assistant financier pour votre trésorerie</Text>

      {mode === 'register' && (
        <TextInput
          placeholder=\"Nom complet\"
          placeholderTextColor=\"#94a3b8\"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      )}
      <TextInput
        placeholder=\"Email\"
        placeholderTextColor=\"#94a3b8\"
        autoCapitalize=\"none\"
        keyboardType=\"email-address\"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder=\"Mot de passe\"
        placeholderTextColor=\"#94a3b8\"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      {mode === 'register' && (
        <TextInput
          placeholder=\"Entreprise (facultatif)\"
          placeholderTextColor=\"#94a3b8\"
          value={company}
          onChangeText={setCompany}
          style={styles.input}
        />
      )}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color=\"#0f172a\" /> : <Text style={styles.buttonText}>Continuer</Text>}
      </Pressable>

      <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
        <Text style={styles.link}>
          {mode === 'login' ? \"Créer un compte\" : \"J'ai déjà un compte\"}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#0b1224',
    justifyContent: 'center',
  },
  title: {
    color: '#e2e8f0',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 20,
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
  link: {
    color: '#c084fc',
    textAlign: 'center',
    marginTop: 14,
  },
});

export default LoginScreen;
