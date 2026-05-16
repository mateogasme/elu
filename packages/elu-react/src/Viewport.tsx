'use client';

import type { EluViewportProps } from '@mgasme/elu-core/types';

type EluViewportReactProps = Omit<EluViewportProps, 'class'> & {
  className?: string;
  children?: React.ReactNode;
};

export function Viewport({ className, maxHeight, children }: EluViewportReactProps) {
  const style = maxHeight ? { maxHeight } : undefined;
  return (
    <div data-elu-viewport className={className} style={style}>
      {children}
    </div>
  );
}
