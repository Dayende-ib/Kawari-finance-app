import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/apiInterceptor';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Table from '../components/Table';
import Skeleton from '../components/Skeleton';
import { notify } from '../components/Toast';
import { FormEvent, useState } from 'react';
import Pagination from '../components/Pagination';
import { useEffect } from 'react';

type Customer = { id: number; name: string; phone?: string };
type CustomerResponse = { data: Customer[]; total: number; page: number; limit: number; pages: number };

export default function Customers() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', phone: '' });
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError } = useQuery<CustomerResponse>({
    queryKey: ['customers', page, limit, search],
    queryFn: async () => (await api.get('/customers', { params: { page, limit, search } })).data,
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post('/customers', form),
    onSuccess: () => {
      notify('Client ajouté');
      setForm({ name: '', phone: '' });
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: () => notify('Erreur lors de la création', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      notify('Client supprimé');
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: () => notify('Erreur lors de la suppression', 'error'),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name) return notify('Nom requis', 'error');
    createMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Clients</h2>
      </div>

      <Card>
        <form className="grid md:grid-cols-3 gap-3" onSubmit={onSubmit}>
          <Input label="Nom" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Téléphone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <div className="flex items-end">
            <Button type="submit" loading={createMutation.isPending}>
              Ajouter
            </Button>
          </div>
        </form>
      </Card>

      <Card className="flex flex-wrap gap-3 items-center">
        <Input
          label="Rechercher"
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setPage(1);
          }}
          hint="Nom ou téléphone"
        />
      </Card>

      {isLoading && <Skeleton rows={5} />}
      {isError && <div className="text-danger">Erreur de chargement.</div>}

      {data && (
        <Table
          columns={[
            { header: 'Nom', render: (c) => c.name },
            { header: 'Téléphone', render: (c) => c.phone || '—' },
            {
              header: '',
              render: (c) => (
                <Button variant="ghost" onClick={() => deleteMutation.mutate(c.id)}>
                  Supprimer
                </Button>
              ),
            },
          ]}
          data={data.data}
        />
      )}
      {data && <Pagination page={data.page} pages={data.pages} onChange={setPage} />}
    </div>
  );
}
