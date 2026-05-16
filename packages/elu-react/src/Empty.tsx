'use client';

type EluEmptyReactProps = {
  className?: string;
  children?: React.ReactNode;
};

export function Empty({ className, children }: EluEmptyReactProps) {
  return (
    <div data-elu-empty role="status" aria-live="polite" className={className}>
      {children ?? 'No results.'}
    </div>
  );
}
