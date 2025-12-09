import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import Skeleton from '../components/Skeleton';
import { notify } from '../components/Toast';
import { useState } from 'react';

type Tx = { id: number; amount: number; currency: string; date: string; description?: string; paymentMethod?: string };

export default function MobileMoney() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ amount: 0, currency: 'XOF', operator: '', customerId: '' });

  const { data, isLoading, isError } = useQuery<Tx[]>({
    queryKey: ['mobile-history'],
    queryFn: async () => (await api.get('/mobile-money/history')).data,
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.post('/mobile-money/mock', {
        amount: form.amount,
        currency: form.currency,
        operator: form.operator,
        customerId: form.customerId ? Number(form.customerId) : undefined,
      }),
    onSuccess: () => {
      notify('Transaction Mobile Money créée');
      setForm({ amount: 0, currency: 'XOF', operator: '', customerId: '' });
      qc.invalidateQueries({ queryKey: ['mobile-history'] });
    },
    onError: () => notify('Erreur lors de la création', 'error'),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Mobile Money</h2>

      <Card>
        <div className="grid md:grid-cols-4 gap-3">
          <Input label="Montant" type="number" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))} />
          <Input label="Devise" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
          <Input label="Opérateur" value={form.operator} onChange={(e) => setForm((f) => ({ ...f, operator: e.target.value }))} />
          <Input label="Client ID (optionnel)" value={form.customerId} onChange={(e) => setForm((f) => ({ ...f, customerId: e.target.value }))} />
        </div>
        <div className="mt-3">
          <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
            Simuler
          </Button>
        </div>
      </Card>

      {isLoading && <Skeleton rows={4} />}
      {isError && <div className="text-danger">Erreur de chargement.</div>}

      <div className="space-y-2">
        {data?.map((t) => (
          <Card key={t.id} className="flex justify-between">
            <div>
              <div className="font-semibold">
                {t.amount.toLocaleString()} {t.currency}
              </div>
              <div className="text-sm text-muted">{t.description}</div>
            </div>
            <div className="text-sm text-muted">{new Date(t.date).toLocaleString()}</div>
          </Card>
        ))}
        {data?.length === 0 && <div className="text-muted">Aucun paiement Mobile Money.</div>}
      </div>
    </div>
  );
}
