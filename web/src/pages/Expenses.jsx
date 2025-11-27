import { useEffect, useState } from 'react';
import { createExpense, fetchExpenses, updateExpense, deleteExpense } from '../api/client.js';

const Expenses = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ amount: '', category: 'Charges', description: '', counterparty: '' });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await fetchExpenses();
      setItems(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur chargement dépenses');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await updateExpense(editingId, { ...form, amount: Number(form.amount) });
      } else {
        await createExpense({ ...form, amount: Number(form.amount), date: new Date().toISOString() });
      }
      setForm({ amount: '', category: form.category, description: '', counterparty: '' });
      setEditingId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Impossible de sauvegarder la dépense');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      amount: item.amount,
      category: item.category || 'Charges',
      description: item.description || '',
      counterparty: item.counterparty || '',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette dépense ?')) return;
    try {
      await deleteExpense(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Suppression impossible');
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Dépenses</h2>
      <form className="form" onSubmit={submit}>
        <input
          className="input"
          placeholder="Montant (XOF)"
          name="amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          type="number"
          required
        />
        <input
          className="input"
          placeholder="Catégorie"
          name="category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          className="input"
          placeholder="Fournisseur"
          name="counterparty"
          value={form.counterparty}
          onChange={(e) => setForm({ ...form, counterparty: e.target.value })}
        />
        <textarea
          className="input"
          placeholder="Note"
          rows={3}
          name="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button className="button" type="submit" disabled={loading}>
          {loading ? '...' : editingId ? 'Mettre à jour' : 'Enregistrer'}
        </button>
        {editingId ? (
          <button
            className="button"
            type="button"
            style={{ background: '#0f172a', color: 'var(--accent)', border: '1px solid var(--border)' }}
            onClick={() => {
              setEditingId(null);
              setForm({ amount: '', category: 'Charges', description: '', counterparty: '' });
            }}
          >
            Annuler
          </button>
        ) : null}
      </form>

      <div className="section-title">Dernières dépenses</div>
      <table className="table">
        <thead>
          <tr>
            <th>Montant</th>
            <th>Catégorie</th>
            <th>Fournisseur</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it._id}>
              <td>{it.amount?.toLocaleString('fr-FR')} XOF</td>
              <td className="muted">{it.category}</td>
              <td className="muted">{it.counterparty}</td>
              <td className="muted">{new Date(it.date).toLocaleDateString('fr-FR')}</td>
              <td style={{ display: 'flex', gap: 8 }}>
                <button className="button" type="button" onClick={() => handleEdit(it)}>
                  Modifier
                </button>
                <button
                  className="button"
                  type="button"
                  style={{ background: '#1f2937', color: '#f43f5e' }}
                  onClick={() => handleDelete(it._id)}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Expenses;
