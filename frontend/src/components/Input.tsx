import clsx from 'clsx';
import { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
};

export default function Input({ label, hint, error, className, ...rest }: Props) {
  return (
    <label className="flex flex-col gap-1 text-sm text-muted">
      {label && <span>{label}</span>}
      <input
        className={clsx(
          'rounded-md bg-slate-800 px-3 py-2 text-slate-50 border border-transparent focus:border-primary transition',
          error && 'border-danger',
          className
        )}
        {...rest}
      />
      {hint && !error && <span className="text-xs text-muted">{hint}</span>}
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}
