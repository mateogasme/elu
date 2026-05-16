'use client';

type EluItemIndicatorReactProps = {
  className?: string;
  children?: React.ReactNode;
};

function DefaultCheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function ItemIndicator({ className, children }: EluItemIndicatorReactProps) {
  return (
    <span data-elu-item-indicator className={className} aria-hidden="true">
      {children ?? <DefaultCheckIcon />}
    </span>
  );
}
