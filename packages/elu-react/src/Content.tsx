'use client';

import type { EluContentProps } from '@mgasme/elu-core/types';

type EluContentReactProps = Omit<EluContentProps, 'class'> & {
  className?: string;
  children?: React.ReactNode;
};

export function Content({
  className,
  align = 'start',
  side = 'bottom',
  sideOffset = 4,
  collisionPadding = 8,
  children,
}: EluContentReactProps) {
  return (
    <div
      data-elu-content
      popover="auto"
      className={className}
      data-side={side}
      data-align={align}
      data-side-offset={sideOffset}
      data-collision-padding={collisionPadding}
    >
      {children}
    </div>
  );
}
