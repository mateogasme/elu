'use client';

import { useLayoutEffect, useRef } from 'react';
import { EluController } from '@mgasme/elu-core/controller';
import type { EluRootProps, EluChangeDetail } from '@mgasme/elu-core/types';

type EluRootReactProps = Omit<EluRootProps, 'class'> & {
  value?: string | string[];
  onValueChange?: (next: string | string[]) => void;
  className?: string;
  children: React.ReactNode;
};

export function Root({
  id,
  name,
  defaultValue,
  value,
  onValueChange,
  multiple,
  disabled,
  required,
  dir = 'ltr',
  size,
  theme,
  className,
  children,
}: EluRootReactProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<EluController | null>(null);
  const onValueChangeRef = useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  const initialArray: string[] =
    value != null
      ? Array.isArray(value)
        ? value.map(String)
        : value === ''
          ? []
          : [String(value)]
      : Array.isArray(defaultValue)
        ? defaultValue.map(String)
        : defaultValue != null && defaultValue !== ''
          ? [String(defaultValue)]
          : [];

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.dataset.eluBooted = 'true';

    const ctrl = new EluController({ root });
    ctrlRef.current = ctrl;

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<EluChangeDetail>).detail;
      onValueChangeRef.current?.(detail.value);
    };
    root.addEventListener('elu:change', handler);

    return () => {
      root.removeEventListener('elu:change', handler);
      ctrl.destroy();
      ctrlRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controlled mode: push external value changes into the controller silently
  useLayoutEffect(() => {
    if (value !== undefined && ctrlRef.current) {
      ctrlRef.current.setValue(value, { silent: true });
    }
  }, [value]);

  return (
    <div
      ref={rootRef}
      data-elu-root
      data-state="closed"
      data-multiple={multiple ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      data-required={required ? 'true' : undefined}
      data-size={size}
      data-theme={theme}
      data-name={name}
      data-value-initial={JSON.stringify(initialArray)}
      dir={dir}
      id={id}
      className={className}
    >
      {children}
      {/* Controller writes hidden form inputs here imperatively; React must not reconcile children. */}
      <span data-elu-form-inputs hidden suppressHydrationWarning />
    </div>
  );
}
