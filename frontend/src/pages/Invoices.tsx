import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import Skeleton from '../components/Skeleton';
import Card from '../components/Card';
import Button from '../components/Button';
import Table from '../components/Table';
import Input from '../components/Input';
import { FormEvent, useState } from 'react';
import Badge from '../components/Badge';
import { notify } from '../components/Toast';

type InvoiceItem = { label: string; quantity: number; unitPrice: number };
type Invoice = {
  id: number;
  number: string;
  total: number;
  issuedAt: string;
  status: string;
  items: InvoiceItem[];
};

export default function Invoices() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    customerId: '',
    number: '',
    total: 0,
    issuedAt: '',
    items: [{ label: '', quantity: 1, unitPrice: 0 }],
  });
  const [errors, setErrors] = useState<{ total?: string; issuedAt?: string }>({});

  const { data, isLoading, isError } = useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => (await api.get('/invoices')).data,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post('/invoices', {
        ...form,
        customerId: form.customerId ? Number(form.customerId) : null,
        items: form.items,
      }),
    onSuccess: () => {
      notify('Facture créée');
      setForm({ customerId: '', number: '', total: 0, issuedAt: '', items: [{ label: '', quantity: 1, unitPrice: 0 }] });
      setErrors({});
      qc.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: () => notify('Erreur lors de la création', 'error'),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!form.total || form.total <= 0) nextErrors.total = 'Total doit être > 0';
    if (!form.issuedAt) nextErrors.issuedAt = 'Date requise';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (form.items.length === 0) return notify('Ajouter au moins un item', 'error');
    createMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Factures</h2>

      <Card>
        <form className="grid md:grid-cols-4 gap-3" onSubmit={onSubmit}>
          <Input label="Client ID (optionnel)" value={form.customerId} onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))} />
          <Input label="Numéro" value={form.number} onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))} />
          <Input
            label="Total"
            type="number"
            value={form.total}
            onChange={(e) => setForm((f) => ({ ...f, total: Number(e.target.value) }))}
            error={errors.total}
          />
          <Input
            label="Date émission"
            type="date"
            value={form.issuedAt}
            onChange={(e) => setForm((f) => ({ ...f, issuedAt: e.target.value }))}
            error={errors.issuedAt}
          />
          <div className="md:col-span-4 flex items-end justify-end">
            <Button type="submit" loading={createMutation.isPending}>
              Créer
            </Button>
          </div>
        </form>
      </Card>

      {isLoading && <Skeleton rows={5} />}
      {isError && <div className="text-danger">Erreur de chargement.</div>}

      {data && (
        <Table
          columns={[
            { header: '#', render: (i) => i.number },
            { header: 'Total', render: (i) => `${i.total.toLocaleString()} XOF` },
            { header: 'Émise le', render: (i) => new Date(i.issuedAt).toLocaleDateString() },
            { header: 'Statut', render: (i) => <Badge tone={i.status === 'pending' ? 'warning' : 'secondary'}>{i.status}</Badge> },
            {
              header: 'Items',
              render: (i) => (
                <div className="text-xs text-muted">
                  {i.items?.map((it, idx) => (
                    <div key={idx}>
                      {it.label} ×{it.quantity} @ {it.unitPrice}
                    </div>
                  ))}
                </div>
              ),
            },
          ]}
          data={data}
        />
      )}
    </div>
  );
}
