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
          'rounded-md bg-white px-3 py-2 text-gray-900 border border-gray-300 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition',
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
