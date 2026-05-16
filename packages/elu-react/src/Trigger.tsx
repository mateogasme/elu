'use client';

import type { EluTriggerProps } from '@mgasme/elu-core/types';

type EluTriggerReactProps = Omit<EluTriggerProps, 'class'> & {
  className?: string;
  children?: React.ReactNode;
};

export function Trigger({ className, children }: EluTriggerReactProps) {
  return (
    <button type="button" data-elu-trigger className={className}>
      {children}
      <svg
        data-elu-icon
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}
