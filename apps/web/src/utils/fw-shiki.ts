// Monochrome 3-tier syntax highlighting.
//
// Tier 1 — content (keywords, names, strings, values): darkest
// Tier 2 — punctuation (<, >, {, }, =, ., ;, …): mid gray
// Tier 3 — comments: lightest / most receded
//
// Uses custom Shiki theme objects (scope-based) instead of colorReplacements
// (hex-based). Hex replacement can't distinguish <bracket> from text when both
// share the same foreground hex in github-light/dark; scope selectors can.
//
// Vue panes use lang="html" (not lang="vue") so the HTML grammar tokenises
// `Elu.Root` as a single tag-name token — no `invalid.illegal` or spurious
// `punctuation.attribute-shorthand` issues from the Vue grammar.
//
// Colors are oklch-computed neutrals:
//   Light  content  oklch(0.18 0 0) → #111111
//   Light  punct    oklch(0.63 0 0) → #898989
//   Light  comment  oklch(0.76 0 0) → #B1B1B1
//   Dark   content  oklch(0.94 0 0) → #EBEBEB
//   Dark   punct    oklch(0.60 0 0) → #808080
//   Dark   comment  oklch(0.50 0 0) → #636363

import type { ThemeRegistration } from 'shiki';

export type Framework = 'astro' | 'react' | 'vue' | 'svelte';

const PUNCT_SCOPES = [
  'punctuation',
  'keyword.operator',
  'meta.brace',
];

export const eluLight: ThemeRegistration = {
  name: 'elu-light',
  type: 'light',
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#111111',
  },
  tokenColors: [
    {
      name: 'Punctuation',
      scope: PUNCT_SCOPES,
      settings: { foreground: '#898989' },
    },
    {
      name: 'Comment',
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#B1B1B1' },
    },
  ],
};

export const eluDark: ThemeRegistration = {
  name: 'elu-dark',
  type: 'dark',
  colors: {
    'editor.background': '#1E1E1E',
    'editor.foreground': '#EBEBEB',
  },
  tokenColors: [
    {
      name: 'Punctuation',
      scope: PUNCT_SCOPES,
      settings: { foreground: '#808080' },
    },
    {
      name: 'Comment',
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#636363' },
    },
  ],
};

// `fw` arg kept so FwCode.astro doesn't need to change its call signature.
export function getThemes(_fw: Framework) {
  return { light: eluLight, dark: eluDark };
}
