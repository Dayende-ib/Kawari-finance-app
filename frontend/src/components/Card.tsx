import clsx from 'clsx';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export default function Card({ children, className, ...props }: Props) {
  return (
    <div className={clsx('bg-white rounded-lg p-4 shadow-sm border border-gray-100', className)} {...props}>
      {children}
    </div>
  );
}
