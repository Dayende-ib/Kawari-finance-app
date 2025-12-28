const rules = [
  { label: '8 caractères minimum', test: (v: string) => v.length >= 8 },
  { label: '1 majuscule', test: (v: string) => /[A-Z]/.test(v) },
  { label: '1 minuscule', test: (v: string) => /[a-z]/.test(v) },
  { label: '1 chiffre', test: (v: string) => /\d/.test(v) },
  { label: '1 caractère spécial', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export default function PasswordStrengthMeter({ value }: { value: string }) {
  const passed = rules.filter((r) => r.test(value)).length;
  const percent = (passed / rules.length) * 100;

  return (
    <div className="space-y-2">
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${percent < 60 ? 'bg-danger' : percent < 100 ? 'bg-warning' : 'bg-success'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <ul className="text-xs text-muted space-y-1">
        {rules.map((r) => (
          <li key={r.label} className={r.test(value) ? 'text-success' : ''}>
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
