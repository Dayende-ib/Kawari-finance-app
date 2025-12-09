type Props = {
  page: number;
  pages: number;
  onChange: (p: number) => void;
};

export default function Pagination({ page, pages, onChange }: Props) {
  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(pages, page + 1));

  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      Page {page}/{pages || 1}
      <button className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-60" disabled={page <= 1} onClick={prev}>
        Précédent
      </button>
      <button
        className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-60"
        disabled={page >= pages}
        onClick={next}
      >
        Suivant
      </button>
    </div>
  );
}
