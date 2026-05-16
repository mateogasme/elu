'use client';

type EluGroupLabelReactProps = {
  className?: string;
  children?: React.ReactNode;
};

export function GroupLabel({ className, children }: EluGroupLabelReactProps) {
  return (
    <div data-elu-group-label className={className}>
      {children}
    </div>
  );
}
