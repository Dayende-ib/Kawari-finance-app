import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Skeleton from '../components/Skeleton';
import Card from '../components/Card';
import Table from '../components/Table';
import { notify } from '../components/Toast';
import Pagination from '../components/Pagination';

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
type TransactionResponse = { data: Transaction[]; total: number; page: number; limit: number; pages: number };

export default function Transactions() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'sale' | 'expense'>('sale');
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

  const { data, isLoading, isError } = useQuery<TransactionResponse>({
    queryKey: ['transactions', tab, page, pageSize],
    queryFn: async () => (await api.get('/transactions', { params: { type: tab, page, limit: pageSize } })).data,
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/transactions', { ...form }, { params: { type: tab } }),
    onSuccess: () => {
      notify('Transaction ajoutée');
      setForm({ amount: 0, currency: 'XOF', date: '', description: '', paymentMethod: '', category: '' });
      setErrors({});
      qc.invalidateQueries({ queryKey: ['transactions'] });
      setPage(1);
    },
    onError: () => notify('Erreur lors de la création', 'error'),
  });

  const rows = data?.data || [];
  const filtered = rows
    .filter((t) => (minAmount ? t.amount >= minAmount : true))
    .sort((a, b) => {
      if (sort === 'dateDesc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === 'dateAsc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sort === 'amountDesc') return b.amount - a.amount;
      return a.amount - b.amount;
    });
  const totalPages = data?.pages || 1;
  const current = filtered;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Transactions</h2>

      <div className="flex gap-2">
        <Button variant={tab === 'sale' ? 'primary' : 'ghost'} onClick={() => { setTab('sale'); setPage(1); }}>
          Ventes
        </Button>
        <Button variant={tab === 'expense' ? 'primary' : 'ghost'} onClick={() => { setTab('expense'); setPage(1); }}>
          Dépenses
        </Button>
      </div>

      <Card>
        <div className="text-sm text-muted mb-2">Ajouter {tab === 'sale' ? 'une vente' : 'une dépense'}</div>
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
        <div className="ml-auto">
          <Pagination page={page} pages={totalPages} onChange={setPage} />
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
