import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@kawari.com');
  const [password, setPassword] = useState('Password123!');
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
      setError(err?.data?.message || err?.message || 'Connexion échouée');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setEmail('admin@kawari.com');
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg to-panel px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-panel p-8 rounded-lg shadow-card space-y-4 border border-slate-800">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Kawari Finance</h1>
          <p className="text-sm text-muted">Connectez-vous pour accéder au tableau de bord.</p>
        </div>

        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="text-danger text-sm">{error}</div>}
        <Button type="submit" loading={loading} className="w-full">
          Se connecter
        </Button>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Démo : admin@kawari.com / password123</span>
          <button type="button" onClick={fillDemo} className="text-primary hover:underline">
            Mode invité
          </button>
        </div>
        <button type="button" onClick={() => nav('/register')} className="text-xs text-primary hover:underline">
          Créer un compte
        </button>
      </form>
    </div>
  );
}
