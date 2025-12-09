import clsx from 'clsx';

type Props = { tone?: 'primary' | 'secondary' | 'warning' | 'danger' | 'muted'; children: React.ReactNode };

const toneToClass: Record<string, string> = {
  primary: 'bg-primary/15 text-primary',
  secondary: 'bg-secondary/15 text-secondary',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/15 text-danger',
  muted: 'bg-slate-700 text-muted',
};

export default function Badge({ tone = 'primary', children }: Props) {
  return <span className={clsx('inline-flex px-2 py-1 rounded-md text-xs', toneToClass[tone])}>{children}</span>;
}
