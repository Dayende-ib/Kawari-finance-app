import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { createInvoice, fetchInvoices, updateInvoice, deleteInvoice } from '../api/client.js';

const templates = [
  { id: 'sahara', label: 'Sahara (gold/blue)', accent: '#fbbf24' },
  { id: 'lagoon', label: 'Lagoon (cyan)', accent: '#22d3ee' },
  { id: 'rose', label: 'Rose (pink)', accent: '#fb7185' },
];

const Invoices = ({ user }) => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    number: '',
    customerName: '',
    amount: '',
    dueDate: '',
    status: 'draft',
    template: 'sahara',
  });
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    try {
      const { data } = await fetchInvoices();
      setItems(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur chargement factures');
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
        await updateInvoice(editingId, {
          ...form,
          amount: Number(form.amount),
        });
      } else {
        await createInvoice({ ...form, amount: Number(form.amount) });
      }
      setForm({ number: '', customerName: '', amount: '', dueDate: '', status: 'draft', template: 'sahara' });
      setEditingId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Impossible de sauvegarder la facture');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      number: item.number,
      customerName: item.customerName,
      amount: item.amount,
      dueDate: item.dueDate?.slice(0, 10) || '',
      status: item.status,
      template: item.template || 'sahara',
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette facture ?')) return;
    try {
      await deleteInvoice(id);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Suppression impossible');
    }
  };

  const exportPdf = (invoice) => {
    const tpl = templates.find((t) => t.id === invoice.template) || templates[0];
    const doc = new jsPDF();

    doc.setFillColor(tpl.accent);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor('#0b1224');
    doc.setFontSize(18);
    doc.text('Kawari - Facture', 12, 18);

    doc.setTextColor('#111');
    doc.setFontSize(12);
    doc.text(`Facture #${invoice.number}`, 12, 42);
    doc.text(`Client: ${invoice.customerName}`, 12, 52);
    doc.text(`Statut: ${invoice.status}`, 12, 62);
    doc.text(`Date d'echeance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, 12, 72);

    doc.setFontSize(26);
    doc.setTextColor(tpl.accent);
    doc.text(`${(invoice.amount || 0).toLocaleString('fr-FR')} XOF`, 12, 95);

    doc.setDrawColor('#ddd');
    doc.line(12, 102, 198, 102);
    doc.setTextColor('#555');
    doc.setFontSize(10);
    doc.text('Merci pour votre confiance.', 12, 112);
    if (user?.email) doc.text(`Contact: ${user.email}`, 12, 120);

    doc.save(`facture-${invoice.number}.pdf`);
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Factures</h2>
      <form className="form" onSubmit={submit}>
        <input
          className="input"
          placeholder="Numero"
          name="number"
          value={form.number}
          onChange={(e) => setForm({ ...form, number: e.target.value })}
          required
        />
        <input
          className="input"
          placeholder="Client"
          name="customerName"
          value={form.customerName}
          onChange={(e) => setForm({ ...form, customerName: e.target.value })}
          required
        />
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
          placeholder="Echeance (YYYY-MM-DD)"
          name="dueDate"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          type="date"
          required
        />
        <select
          className="input"
          name="status"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="draft">Brouillon</option>
          <option value="sent">Envoyee</option>
          <option value="paid">Payee</option>
          <option value="overdue">En retard</option>
        </select>
        <select
          className="input"
          name="template"
          value={form.template}
          onChange={(e) => setForm({ ...form, template: e.target.value })}
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              Modele: {t.label}
            </option>
          ))}
        </select>
        <button className="button" type="submit" disabled={loading}>
          {loading ? '...' : editingId ? 'Mettre a jour' : 'Enregistrer'}
        </button>
        {editingId ? (
          <button
            className="button"
            type="button"
            style={{ background: '#0f172a', color: 'var(--accent)', border: '1px solid var(--border)' }}
            onClick={() => {
              setEditingId(null);
              setForm({ number: '', customerName: '', amount: '', dueDate: '', status: 'draft', template: 'sahara' });
            }}
          >
            Annuler
          </button>
        ) : null}
      </form>

      <div className="section-title">Liste des factures</div>
      <table className="table">
        <thead>
          <tr>
            <th>Numero</th>
            <th>Client</th>
            <th>Montant</th>
            <th>Echeance</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it._id}>
              <td>{it.number}</td>
              <td className="muted">{it.customerName}</td>
              <td>{it.amount?.toLocaleString('fr-FR')} XOF</td>
              <td className="muted">{new Date(it.dueDate).toLocaleDateString('fr-FR')}</td>
              <td>
                <span className={`pill ${it.status}`}>{it.status}</span>
              </td>
              <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
                <button
                  className="button"
                  type="button"
                  style={{ background: '#0f172a', color: 'var(--accent-2)', border: '1px solid var(--border)' }}
                  onClick={() => exportPdf(it)}
                >
                  Export PDF
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Invoices;
