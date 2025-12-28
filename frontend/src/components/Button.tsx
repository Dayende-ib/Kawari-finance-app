import clsx from 'clsx';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
};

export default function Button({ variant = 'primary', loading, className, children, ...rest }: Props) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition';
  const variants: Record<string, string> = {
    primary: 'bg-primary text-white hover:brightness-110 disabled:opacity-60',
    secondary: 'bg-secondary text-white hover:brightness-110 disabled:opacity-60',
    ghost: 'bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-60',
  };

  return (
    <button className={clsx(base, variants[variant], className)} disabled={loading || rest.disabled} {...rest}>
      {loading && <span className="animate-spin h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full" />}
      {children}
    </button>
  );
}
