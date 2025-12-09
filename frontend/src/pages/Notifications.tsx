import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import Skeleton from '../components/Skeleton';
import Button from '../components/Button';
import Card from '../components/Card';
import { notify } from '../components/Toast';
import { useState } from 'react';

type Notification = { id: number; message: string; type: string; read: boolean; createdAt: string };

export default function Notifications() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const { data, isLoading, isError } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
  });

  const markMutation = useMutation({
    mutationFn: (id: number) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/notifications/${id}`),
    onSuccess: () => {
      notify('Notification supprimée');
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => notify('Erreur lors de la suppression', 'error'),
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Notifications</h2>
      {isLoading && <Skeleton rows={5} />}
      {isError && <div className="text-danger">Erreur de chargement.</div>}
      <div className="flex items-center gap-2 text-sm text-muted">
        Page {page}/
        {Math.max(1, Math.ceil((data?.length || 0) / pageSize))}
        <Button variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Précédent
        </Button>
        <Button
          variant="ghost"
          disabled={page >= Math.max(1, Math.ceil((data?.length || 0) / pageSize))}
          onClick={() => setPage((p) => p + 1)}
        >
          Suivant
        </Button>
      </div>
      <div className="space-y-2">
        {data
          ?.slice((page - 1) * pageSize, page * pageSize)
          .map((n) => (
            <Card key={n.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{n.message}</div>
                <div className="text-xs text-muted">{n.type}</div>
              </div>
            <div className="flex gap-2">
              {!n.read && (
                <Button variant="ghost" onClick={() => markMutation.mutate(n.id)}>
                  Marquer lu
                </Button>
              )}
              <Button variant="ghost" onClick={() => deleteMutation.mutate(n.id)}>
                Supprimer
              </Button>
              </div>
            </Card>
          ))}
        {data?.length === 0 && <div className="text-muted">Aucune notification.</div>}
      </div>
    </div>
  );
}
