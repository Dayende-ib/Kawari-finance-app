type Props = { label: string; value: number; suffix?: string; tone?: 'primary' | 'secondary' | 'warning' | 'danger' };
const toneToClass = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
};

export default function StatTile({ label, value, suffix, tone = 'primary' }: Props) {
  return (
    <div className="bg-panel rounded-lg p-4 shadow-card border border-slate-800">
      <div className="text-sm text-muted mb-1">{label}</div>
      <div className="text-2xl font-semibold flex items-baseline gap-2">
        <span>{value.toLocaleString('fr-FR')}</span>
        {suffix && <span className="text-muted text-sm">{suffix}</span>}
      </div>
      <div className={`mt-3 inline-flex px-2 py-1 rounded-md text-xs ${toneToClass[tone]}`}>•</div>
    </div>
  );
}
