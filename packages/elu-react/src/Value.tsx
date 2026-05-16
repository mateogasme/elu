'use client';

import type { EluValueProps } from '@mgasme/elu-core/types';

type EluValueReactProps = Omit<EluValueProps, 'class'> & {
  className?: string;
};

export function Value({ placeholder = '', className }: EluValueReactProps) {
  return (
    <span
      data-elu-value
      data-placeholder={placeholder}
      data-empty="true"
      className={className}
    >
      {placeholder}
    </span>
  );
}
