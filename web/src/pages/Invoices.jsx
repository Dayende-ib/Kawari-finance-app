import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import { createInvoice, fetchInvoices, updateInvoice, deleteInvoice } from '../api/client.js';

const templates = [
  {
    id: 'pro',
    label: 'Pro classique',
    accent: '#fbbf24',
    description: 'Bloc logo à gauche, infos client/fournisseur, tableau simple.',
  },
  {
    id: 'minimal',
    label: 'Minimal élégant',
    accent: '#111827',
    description: 'Typographie fine, colonnes aérées, idéal pour services.',
  },
  {
    id: 'receipt',
    label: 'Reçu moderne',
    accent: '#6366f1',
    description: 'Mise en avant montant total, reçu de vente rapide.',
  },
];

const Invoices = ({ user }) => {
  const [invoiceList, setInvoiceList] = useState([]);
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
  const [items, setItems] = useState([{ description: 'Produit / service', quantity: 1, unitPrice: 0 }]);
  const totalComputed = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0),
    [items]
  );

  const load = async () => {
    try {
      const { data } = await fetchInvoices();
      setInvoiceList(data);
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur chargement factures');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selectedTemplate = useMemo(() => templates.find((t) => t.id === form.template) || templates[0], [form.template]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        items,
        amount: items.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0),
      };

      if (editingId) {
        await updateInvoice(editingId, {
          ...payload,
        });
      } else {
        await createInvoice(payload);
      }
      setForm({ number: '', customerName: '', amount: '', dueDate: '', status: 'draft', template: 'sahara' });
      setItems([{ description: 'Produit / service', quantity: 1, unitPrice: 0 }]);
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
    setItems(
      (item.items || []).map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })) || [{ description: 'Produit / service', quantity: 1, unitPrice: 0 }]
    );
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
    const tpl = templates.find((t) => t.id === (invoice.template || 'pro')) || templates[0];
    const doc = new jsPDF();
    const info = {
      seller: {
        name: 'Kawari Démo',
        address: 'Ouagadougou, Burkina Faso',
        phone: '+226 70 00 00 00',
        email: user?.email || 'contact@kawari.app',
        logoUrl: user?.logoUrl,
        signatureUrl: user?.signatureUrl,
      },
      buyer: {
        name: invoice.customerName,
        address: 'Client adresse',
      },
    };

    if (tpl.id === 'minimal') {
      buildMinimal(doc, invoice, info);
    } else if (tpl.id === 'receipt') {
      buildReceipt(doc, invoice, info);
    } else {
      buildPro(doc, invoice, info);
    }

    doc.save(`facture-${invoice.number}.pdf`);
  };

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Factures</h2>
      <TemplateGallery
        templates={templates}
        selected={selectedTemplate.id}
        onSelect={(id) => setForm({ ...form, template: id })}
      />
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
          value={totalComputed}
          onChange={() => {}}
          type="number"
          disabled
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
        <div className="card" style={{ border: '1px dashed var(--border)', background: '#f8fafc' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Lignes de facture</div>
          {items.map((it, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 0.6fr 0.8fr 0.6fr', gap: 8, marginBottom: 8 }}>
              <input
                className="input"
                placeholder="Description"
                value={it.description}
                onChange={(e) =>
                  setItems(items.map((row, rIdx) => (rIdx === idx ? { ...row, description: e.target.value } : row)))
                }
              />
              <input
                className="input"
                type="number"
                placeholder="Qté"
                value={it.quantity}
                onChange={(e) =>
                  setItems(items.map((row, rIdx) => (rIdx === idx ? { ...row, quantity: e.target.value } : row)))
                }
              />
              <input
                className="input"
                type="number"
                placeholder="PU"
                value={it.unitPrice}
                onChange={(e) =>
                  setItems(items.map((row, rIdx) => (rIdx === idx ? { ...row, unitPrice: e.target.value } : row)))
                }
              />
              <button
                className="button"
                type="button"
                style={{ background: '#1f2937', color: '#fff' }}
                onClick={() => setItems(items.filter((_, rIdx) => rIdx !== idx))}
                disabled={items.length === 1}
              >
                Supprimer
              </button>
            </div>
          ))}
          <button
            className="button"
            type="button"
            onClick={() => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])}
          >
            + Ajouter une ligne
          </button>
          <div style={{ marginTop: 8, fontWeight: 700 }}>
            Total calculé: {formatMoney(totalComputed)}
          </div>
        </div>
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
          {invoiceList.map((it) => (
            <tr key={it._id}>
              <td>{it.number}</td>
              <td className="muted">{it.customerName}</td>
              <td>{formatMoney(it.amount)}</td>
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

// --------- PDF templates ----------

const buildPro = (doc, invoice, info) => {
  doc.setFillColor('#fbbf24');
  doc.circle(20, 18, 10, 'F');
  if (info.seller.logoUrl) {
    doc.setFontSize(8);
    doc.text(`Logo: ${info.seller.logoUrl}`, 40, 18);
  }
  doc.setTextColor('#111');
  doc.setFontSize(16);
  doc.text(`FACTURE ${invoice.number}`, 120, 20);
  doc.setFontSize(11);
  doc.text(`Date: ${formatDate(invoice.createdAt || new Date())}`, 120, 28);
  doc.text(`Échéance: ${formatDate(invoice.dueDate)}`, 120, 34);

  doc.setFontSize(10);
  doc.text('Mon entreprise', 20, 40);
  doc.text(info.seller.name, 20, 46);
  doc.text(info.seller.address, 20, 52);
  doc.text(info.seller.phone, 20, 58);
  doc.text(info.seller.email, 20, 64);

  doc.text('Client', 120, 40);
  doc.text(info.buyer.name, 120, 46);
  doc.text(info.buyer.address, 120, 52);

  doc.setDrawColor('#cbd5e1');
  doc.line(20, 72, 190, 72);
  doc.setFontSize(12);
  doc.text('Description', 22, 80);
  doc.text('Qté', 120, 80);
  doc.text('PU', 140, 80);
  doc.text('Total', 165, 80);

  let y = 92;
  doc.setFontSize(11);
  (invoice.items || []).forEach((it) => {
    doc.text(it.description || 'Ligne', 22, y);
    doc.text(String(it.quantity || 1), 120, y);
    doc.text(formatMoney(it.unitPrice), 140, y);
    doc.text(formatMoney(it.lineTotal), 165, y);
    y += 8;
  });

  doc.setDrawColor('#e2e8f0');
  doc.line(20, y, 190, y);
  doc.setFontSize(12);
  doc.text('Total TTC', 120, y + 12);
  doc.text(formatMoney(invoice.amount), 165, y + 12);

  doc.setFontSize(10);
  doc.text('Merci pour votre confiance.', 22, y + 26);
  doc.text('Conditions de paiement: 30 jours', 22, y + 32);
  if (info.seller.signatureUrl) {
    doc.text(`Signature: ${info.seller.signatureUrl}`, 22, y + 40);
  }
};

const buildMinimal = (doc, invoice, info) => {
  doc.setTextColor('#0f172a');
  doc.setFontSize(22);
  doc.text('INVOICE', 20, 20);
  doc.setFontSize(11);
  doc.text(`Invoice No. ${invoice.number}`, 140, 16);
  doc.text(`Date: ${formatDate(invoice.createdAt || new Date())}`, 140, 22);
  doc.text(`Due: ${formatDate(invoice.dueDate)}`, 140, 28);

  doc.setFontSize(11);
  doc.text('Billed To:', 20, 40);
  doc.text(info.buyer.name, 20, 46);
  doc.text(info.buyer.address, 20, 52);

  doc.setDrawColor('#cbd5e1');
  doc.line(20, 60, 190, 60);
  doc.text('Item', 20, 68);
  doc.text('Qty', 120, 68);
  doc.text('Unit', 140, 68);
  doc.text('Total', 165, 68);

  let y = 82;
  doc.setFontSize(11);
  (invoice.items || []).forEach((it) => {
    doc.text(it.description || 'Ligne', 20, y);
    doc.text(String(it.quantity || 1), 120, y);
    doc.text(formatMoney(it.unitPrice), 140, y);
    doc.text(formatMoney(it.lineTotal), 165, y);
    y += 8;
  });

  doc.line(120, y + 4, 190, y + 4);
  doc.text('Total Due', 120, y + 14);
  doc.setFontSize(16);
  doc.text(formatMoney(invoice.amount), 165, y + 14);

  doc.setFontSize(10);
  doc.text('Payment info: IBAN FRXX XXXX XXXX, SWIFT BIC XXXX', 20, y + 30);
  if (info.seller.logoUrl) doc.text(`Logo: ${info.seller.logoUrl}`, 20, y + 38);
  if (info.seller.signatureUrl) doc.text(`Signature: ${info.seller.signatureUrl}`, 20, y + 46);
  doc.text('Thank you for your business!', 20, y + 54);
};

const buildReceipt = (doc, invoice, info) => {
  doc.setFillColor('#dfe3ff');
  doc.circle(180, 22, 10, 'F');
  if (info.seller.logoUrl) {
    doc.setFontSize(8);
    doc.text(`Logo: ${info.seller.logoUrl}`, 20, 22);
  }
  doc.setFontSize(16);
  doc.text('REÇU DE VENTE', 20, 20);

  doc.setFontSize(10);
  doc.text('De', 20, 32);
  doc.text(info.seller.name, 20, 38);
  doc.text(info.seller.address, 20, 44);

  doc.text('Vendu à', 110, 32);
  doc.text(info.buyer.name, 110, 38);
  doc.text(info.buyer.address, 110, 44);

  doc.text(`Reçu n° ${invoice.number}`, 20, 58);
  doc.text(`Date: ${formatDate(invoice.createdAt || new Date())}`, 20, 64);
  doc.text(`Échéance: ${formatDate(invoice.dueDate)}`, 20, 70);

  doc.setDrawColor('#cbd5e1');
  doc.line(20, 76, 190, 76);
  doc.text('Quantité', 22, 84);
  doc.text('Désignation', 50, 84);
  doc.text('Prix', 145, 84);
  doc.text('Montant', 170, 84);

  let y = 96;
  (invoice.items || []).forEach((it) => {
    doc.text(String(it.quantity || 1), 22, y);
    doc.text(it.description || 'Ligne', 50, y);
    doc.text(formatMoney(it.unitPrice), 145, y);
    doc.text(formatMoney(it.lineTotal), 170, y);
    y += 8;
  });

  doc.line(120, y + 4, 190, y + 4);
  doc.text('Total', 145, y + 14);
  doc.setFontSize(14);
  doc.text(formatMoney(invoice.amount), 170, y + 14);

  doc.setFontSize(10);
  doc.text('Conditions: paiement dû sous 15 jours.', 22, y + 30);
  if (info.seller.signatureUrl) doc.text(`Signature: ${info.seller.signatureUrl}`, 22, y + 38);
};

const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR');
const formatMoney = (n) => {
  const num = Math.round(Number(n) || 0);
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} XOF`;
};

const TemplateGallery = ({ templates, selected, onSelect }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 12 }}>
    {templates.map((t) => (
      <button
        key={t.id}
        onClick={() => onSelect(t.id)}
        style={{
          textAlign: 'left',
          padding: 14,
          borderRadius: 14,
          border: selected === t.id ? '2px solid var(--accent-2)' : '1px solid var(--border)',
          background: '#fff',
          boxShadow: '0 10px 25px rgba(15,23,42,0.06)',
          cursor: 'pointer',
        }}
      >
        <div style={{ fontWeight: 700 }}>{t.label}</div>
        <div className="muted" style={{ marginTop: 6 }}>{t.description}</div>
        <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
          <span style={{ width: 14, height: 14, borderRadius: 999, background: t.accent }} />
          <span className="muted">Aperçu rapide</span>
        </div>
      </button>
    ))}
  </div>
);
