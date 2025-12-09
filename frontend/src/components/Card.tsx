import clsx from 'clsx';

export default function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('bg-panel rounded-lg p-4 shadow-card border border-slate-800', className)}>{children}</div>;
}
