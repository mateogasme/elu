'use client';

import type { EluItemProps } from '@mgasme/elu-core/types';

type EluItemReactProps = Omit<EluItemProps, 'class'> & {
  className?: string;
  children?: React.ReactNode;
};

export function Item({ value, disabled, textValue, className, children }: EluItemReactProps) {
  return (
    <div
      data-elu-item
      data-value={value}
      data-text-value={textValue}
      data-disabled={disabled ? 'true' : undefined}
      className={className}
    >
      {children}
    </div>
  );
}
