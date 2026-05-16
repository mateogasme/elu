'use client';

type EluItemTextReactProps = {
  className?: string;
  children?: React.ReactNode;
};

export function ItemText({ className, children }: EluItemTextReactProps) {
  return (
    <span data-elu-item-text className={className}>
      {children}
    </span>
  );
}
