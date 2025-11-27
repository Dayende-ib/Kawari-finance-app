import { useEffect, useState } from 'react';
import { me, updateProfile } from '../api/client.js';

const Settings = ({ user, onProfileUpdate }) => {
  const [form, setForm] = useState({
    name: '',
    company: '',
    address: '',
    logoUrl: '',
    signatureUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const { data } = await me();
      setForm({
        name: data.user.name || '',
        company: data.user.company || '',
        address: data.user.address || '',
        logoUrl: data.user.logoUrl || '',
        signatureUrl: data.user.signatureUrl || '',
      });
      onProfileUpdate?.(data.user);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateProfile(form);
      onProfileUpdate?.(data.user);
      alert('Profil mis à jour');
    } catch (err) {
      alert(err.response?.data?.message || 'Impossible de mettre à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Paramètres</h2>
      <form className="form" onSubmit={submit}>
        <input
          className="input"
          placeholder="Nom"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          className="input"
          placeholder="Entreprise"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
        <textarea
          className="input"
          placeholder="Adresse (sur facture)"
          rows={2}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />
        <input
          className="input"
          placeholder="Logo URL (affiché sur facture)"
          value={form.logoUrl}
          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
        />
        <input
          className="input"
          placeholder="Signature URL (affichée sur facture)"
          value={form.signatureUrl}
          onChange={(e) => setForm({ ...form, signatureUrl: e.target.value })}
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? '...' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  );
};

export default Settings;
