import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ name, email, password });
      nav('/');
    } catch (err: any) {
      setError(err?.data?.message || err?.message || 'Inscription échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg to-panel px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-panel p-8 rounded-lg shadow-card space-y-4 border border-slate-800">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Créer un compte</h1>
          <p className="text-sm text-muted">Respecter les critères de mot de passe ci-dessous.</p>
        </div>

        <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <PasswordStrengthMeter value={password} />
        {error && <div className="text-danger text-sm">{error}</div>}
        <Button type="submit" loading={loading} className="w-full">
          S'inscrire
        </Button>
        <button type="button" onClick={() => nav('/login')} className="text-xs text-primary hover:underline">
          Déjà un compte ? Se connecter
        </button>
      </form>
    </div>
  );
}
