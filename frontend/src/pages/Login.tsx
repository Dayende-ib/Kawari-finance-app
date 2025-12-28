import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      nav('/');
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Connexion echouee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-sm space-y-4 border border-gray-200">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Kawari Finance</h1>
          <p className="text-sm text-gray-600">Connectez-vous pour acceder au tableau de bord.</p>
        </div>

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-danger text-sm">{error}</div>}
        <Button type="submit" loading={loading} className="w-full">
          Se connecter
        </Button>
        <button type="button" onClick={() => nav('/register')} className="text-xs text-primary hover:underline">
          Creer un compte
        </button>
      </form>
    </div>
  );
}
