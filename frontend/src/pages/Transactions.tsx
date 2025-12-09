import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Skeleton from '../components/Skeleton';
import Card from '../components/Card';
import Table from '../components/Table';
import { notify } from '../components/Toast';

type Transaction = {
  id: number;
  type: 'sale' | 'expense';
  amount: number;
  currency: string;
  date: string;
  description?: string;
  category?: string;
  paymentMethod?: string;
};

export default function Transactions() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'sales' | 'expenses'>('sales');
  const [form, setForm] = useState({
    amount: 0,
    currency: 'XOF',
    date: '',
    description: '',
    paymentMethod: '',
    category: '',
  });
  const [errors, setErrors] = useState<{ amount?: string; date?: string }>({});
  const [sort, setSort] = useState<'dateDesc' | 'dateAsc' | 'amountDesc' | 'amountAsc'>('dateDesc');
  const [minAmount, setMinAmount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const { data, isLoading, isError } = useQuery<Transaction[]>({
    queryKey: ['transactions', tab],
    queryFn: async () => (await api.get(`/transactions/${tab}`)).data,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post(`/transactions/${tab}`, { ...form }),
    onSuccess: () => {
      notify('Transaction ajoutée');
      setForm({ amount: 0, currency: 'XOF', date: '', description: '', paymentMethod: '', category: '' });
      setErrors({});
      qc.invalidateQueries({ queryKey: ['transactions'] });
      setPage(1);
    },
    onError: () => notify('Erreur lors de la création', 'error'),
  });

  const filtered = (data || [])
    .filter((t) => (minAmount ? t.amount >= minAmount : true))
    .sort((a, b) => {
      if (sort === 'dateDesc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === 'dateAsc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sort === 'amountDesc') return b.amount - a.amount;
      return a.amount - b.amount;
    });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Transactions</h2>

      <div className="flex gap-2">
        <Button variant={tab === 'sales' ? 'primary' : 'ghost'} onClick={() => setTab('sales')}>
          Ventes
        </Button>
        <Button variant={tab === 'expenses' ? 'primary' : 'ghost'} onClick={() => setTab('expenses')}>
          Dépenses
        </Button>
      </div>

      <Card>
        <div className="text-sm text-muted mb-2">Ajouter {tab === 'sales' ? 'une vente' : 'une dépense'}</div>
        <div className="grid md:grid-cols-6 gap-3">
          <Input
            label="Montant"
            type="number"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
            error={errors.amount}
          />
          <Input label="Devise" value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} error={errors.date} />
          <Input label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input label="Moyen paiement" value={form.paymentMethod} onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))} />
          <Input label="Catégorie" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
        </div>
        <div className="mt-3">
          <Button
            onClick={() => {
              const nextErrors: typeof errors = {};
              if (!form.amount || form.amount <= 0) nextErrors.amount = 'Le montant doit être > 0';
              if (!form.date) nextErrors.date = 'Date requise';
              setErrors(nextErrors);
              if (Object.keys(nextErrors).length === 0) createMutation.mutate();
            }}
            loading={createMutation.isPending}
          >
            Ajouter
          </Button>
        </div>
      </Card>

      <Card className="flex flex-wrap gap-3 items-end">
        <Input
          label="Filtrer montant min"
          type="number"
          value={minAmount}
          onChange={(e) => {
            setMinAmount(Number(e.target.value));
            setPage(1);
          }}
        />
        <label className="text-sm text-muted flex flex-col">
          Tri
          <select
            className="bg-slate-800 rounded-md px-3 py-2"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as any);
              setPage(1);
            }}
          >
            <option value="dateDesc">Date ↓</option>
            <option value="dateAsc">Date ↑</option>
            <option value="amountDesc">Montant ↓</option>
            <option value="amountAsc">Montant ↑</option>
          </select>
        </label>
        <div className="ml-auto flex items-center gap-2 text-sm text-muted">
          Page {page}/{totalPages}
          <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Précédent
          </Button>
          <Button variant="ghost" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Suivant
          </Button>
        </div>
      </Card>

      {isLoading && <Skeleton rows={5} />}
      {isError && <div className="text-danger">Erreur de chargement.</div>}

      {data && (
        <Table
          columns={[
            { header: 'Montant', render: (t) => `${t.amount.toLocaleString()} ${t.currency}` },
            { header: 'Date', render: (t) => new Date(t.date).toLocaleDateString() },
            { header: 'Description', render: (t) => t.description || '—' },
            { header: 'Paiement', render: (t) => t.paymentMethod || '—' },
            { header: 'Catégorie', render: (t) => t.category || '—' },
          ]}
          data={current}
        />
      )}
    </div>
  );
}
