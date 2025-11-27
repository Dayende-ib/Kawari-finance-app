import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/client.js';

const Login = ({ onAuth }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', company: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const api = mode === 'login' ? login : register;
      const { data } = await api(form);
      onAuth(data);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div className="panel" style={{ maxWidth: 440, width: '100%' }}>
        <div className="badge" style={{ marginBottom: 16 }}>
          <strong>Kawari</strong>
          <span className="muted">Assistant financier</span>
        </div>
        <h2 style={{ margin: '0 0 12px' }}>{mode === 'login' ? 'Connexion' : 'Créer un compte'}</h2>
        <form className="form" onSubmit={submit}>
          {mode === 'register' && (
            <input
              className="input"
              placeholder="Nom complet"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          )}
          <input
            className="input"
            placeholder="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            required
          />
          <input
            className="input"
            placeholder="Mot de passe"
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            required
          />
          {mode === 'register' && (
            <input
              className="input"
              placeholder="Entreprise (facultatif)"
              name="company"
              value={form.company}
              onChange={handleChange}
            />
          )}
          <button className="button" type="submit" disabled={loading}>
            {loading ? '...' : 'Continuer'}
          </button>
        </form>
        <div style={{ marginTop: 12 }}>
          <button
            style={{ color: 'var(--accent)', background: 'transparent', border: 'none', cursor: 'pointer' }}
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? "Créer un compte" : "J'ai déjà un compte"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
