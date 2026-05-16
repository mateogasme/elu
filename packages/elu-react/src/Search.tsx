'use client';

import type { EluSearchProps } from '@mgasme/elu-core/types';

type EluSearchReactProps = Omit<EluSearchProps, 'class'> & {
  className?: string;
};

export function Search({ placeholder = 'Search…', className, debounceMs = 0 }: EluSearchReactProps) {
  return (
    <div data-elu-search className={className}>
      <input
        type="search"
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        enterKeyHint="search"
        data-debounce-ms={debounceMs}
      />
    </div>
  );
}
