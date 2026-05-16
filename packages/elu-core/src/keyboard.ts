export type KeyAction =
  | 'open'
  | 'close'
  | 'next'
  | 'prev'
  | 'first'
  | 'last'
  | 'select'
  | 'select-stay'
  | 'typeahead'
  | 'backspace-multi'
  | 'tab'
  | 'noop';

export interface KeyDispatch {
  action: KeyAction;
  key?: string;
}

export function dispatchClosed(e: KeyboardEvent): KeyDispatch {
  switch (e.key) {
    case 'ArrowDown':
      return { action: 'open' };
    case 'ArrowUp':
      return { action: 'open' };
    case 'Home':
      return { action: 'open' };
    case 'End':
      return { action: 'open' };
    case 'Enter':
    case ' ':
      return { action: 'open' };
    default:
      if (isPrintable(e)) return { action: 'open', key: e.key };
      return { action: 'noop' };
  }
}

export function dispatchOpen(e: KeyboardEvent, searchFocused: boolean, multiple: boolean): KeyDispatch {
  switch (e.key) {
    case 'ArrowDown':
      return { action: 'next' };
    case 'ArrowUp':
      return { action: 'prev' };
    case 'Home':
      return { action: 'first' };
    case 'End':
      return { action: 'last' };
    case 'Enter':
      return { action: multiple ? 'select-stay' : 'select' };
    case ' ':
      if (searchFocused) return { action: 'noop' };
      return { action: multiple ? 'select-stay' : 'select' };
    case 'Escape':
      return { action: 'close' };
    case 'Tab':
      return { action: 'tab' };
    case 'Backspace':
      if (multiple && searchFocused) return { action: 'backspace-multi' };
      return { action: 'noop' };
    default:
      if (isPrintable(e) && !searchFocused) return { action: 'typeahead', key: e.key };
      return { action: 'noop' };
  }
}

function isPrintable(e: KeyboardEvent): boolean {
  return e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey;
}
