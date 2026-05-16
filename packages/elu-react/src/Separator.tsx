'use client';

type EluSeparatorReactProps = {
  className?: string;
};

export function Separator({ className }: EluSeparatorReactProps) {
  return <div data-elu-separator className={className} aria-hidden="true" />;
}
