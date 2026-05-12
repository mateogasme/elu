export type Dir = 'ltr' | 'rtl';
export type Side = 'top' | 'bottom';
export type Align = 'start' | 'center' | 'end';
export type Size = 'sm' | 'md' | 'lg';
export type Theme = 'light' | 'dark';

export interface EluRootProps {
  id?: string;
  name?: string;
  value?: string | string[];
  defaultValue?: string | string[];
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  dir?: Dir;
  size?: Size;
  theme?: Theme;
  class?: string;
}

export interface EluTriggerProps {
  class?: string;
  placeholder?: string;
}

export interface EluValueProps {
  placeholder?: string;
  class?: string;
}

export interface EluContentProps {
  class?: string;
  align?: Align;
  side?: Side;
  sideOffset?: number;
  collisionPadding?: number;
}

export interface EluViewportProps {
  class?: string;
  maxHeight?: string;
}

export interface EluItemProps {
  value: string;
  disabled?: boolean;
  textValue?: string;
  class?: string;
}

export interface EluGroupProps {
  class?: string;
}

export interface EluSearchProps {
  placeholder?: string;
  class?: string;
  debounceMs?: number;
}

export interface EluChangeDetail {
  value: string | string[];
  multiple: boolean;
}
