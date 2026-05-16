'use client';

import type { EluGroupProps } from '@mgasme/elu-core/types';

type EluGroupReactProps = Omit<EluGroupProps, 'class'> & {
  className?: string;
  children?: React.ReactNode;
};

export function Group({ className, children }: EluGroupReactProps) {
  return (
    <div data-elu-group role="group" className={className}>
      {children}
    </div>
  );
}
