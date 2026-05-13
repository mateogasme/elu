# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repo root (npm workspaces):

- `npm install` — symlinks `elu` into `apps/web/node_modules`.
- `npm run dev` — Astro dev server for `apps/web` at `http://localhost:4321`.
- `npm run build` — production build of `apps/web`.
- `npm run preview` — preview the production build.
- `npm run check` — runs `astro check` in **both** workspaces (`packages/elu` then `apps/web`). Use this as the type/diagnostics gate; there is no separate lint or test script.

Workspace-scoped variants:

- `npm run check -w packages/elu` — type-check the package only.
- `npm run dev -w apps/web` — same as `npm run dev`.

No test runner is wired up. No lint script. Verification = `npm run check` + manual UI walkthrough in the dev server.

## Architecture

Monorepo with two workspaces:

- `packages/elu` — the component library (zero runtime deps, ships source directly).
- `apps/web` — landing page that consumes the package via the `"elu": "*"` workspace specifier (npm-workspaces syntax; **not** `workspace:*`).

### Package ships source, no build step

`packages/elu/package.json` `exports` map points at `./src/index.ts`, `./src/styles.css`, and `./components/*` directly. Astro's Vite plugin resolves `.astro` and `.ts` from the workspace symlink. The only verification command in the package is `astro check`. Do not add a build step.

`src/index.ts` is the public barrel — it imports each `.astro` part, side-imports `./styles.css`, and re-exports the `Select` namespace + types. Adding a new part means: create `components/NewPart.astro`, import + add to the `Select` object in `src/index.ts`, document in the package README.

### Component model: compound parts + one controller per Root

Public API is a single `Select` namespace with parts (`Root`, `Trigger`, `Value`, `Content`, `Viewport`, `Item`, `ItemText`, `ItemIndicator`, `Group`, `GroupLabel`, `Separator`, `Search`, `Empty`). All parts are dumb Astro templates; **all behavior lives in `src/controller.ts`**.

Bootstrapping flow:
1. `Root.astro` renders `[data-elu-root]` + an inline `<script>` that imports `SelectController` and instantiates one per root in the DOM.
2. The controller queries its descendants by `data-elu-*` attributes, wires events, and mirrors state back to the DOM as `data-state`, `data-highlighted`, `aria-activedescendant`, `[hidden]`, etc.
3. CSS in `src/styles.css` reacts to those `data-*` hooks. No CSS-in-JS, no class toggling for animation.

The controller is the only place that holds state. Astro renders structure; CSS reacts to data-attrs; controller mediates. When debugging a behavior, start in `controller.ts` (and `keyboard.ts` for key handling).

### Public controller surface (set by `Root.astro` boot)

The instance is exposed on the root element as `root.__selectInstance`. Notable methods:

- `setValue(value, { silent? })` — programmatic selection. `silent: true` suppresses the `elu:change` event (used by the landing page to set initial theme without re-emitting on boot).
- The root dispatches a bubbling `elu:change` CustomEvent with `detail.value: string | string[]`.

### Positioning + animation

- Native Popover API (`popover="auto"`) + CSS Anchor Positioning (`anchor-name` / `position-anchor`). Anchor positioning is feature-detected via `CSS.supports('anchor-name', '--x')`; Firefox falls back to a `getBoundingClientRect()` repositioner inside the controller. No Floating UI, no portal.
- Animation rules are non-negotiable (Emil Kowalski lineage): animate **only `transform` + `opacity`**, ease-out `cubic-bezier(0.23, 1, 0.32, 1)`, `--elu-duration-open: 180ms` / `--elu-duration-close: 140ms`, exit via `transition-behavior: allow-discrete` + `@starting-style` for entry. `transform-origin` is selected by `[data-side]` / `[data-align]` modifiers on Content. No animation on keyboard highlight movement. Respect `prefers-reduced-motion: reduce`.

### Accessibility

APG editable combobox + listbox pattern using `aria-activedescendant` (not roving tabindex) so focus can remain on `Elu.Search` while users arrow. Disabled items are skipped during keyboard nav.

### Theming via CSS custom properties

All visuals controlled by `--elu-*` vars scoped to `[data-elu-root]` (not `:root`) so multiple instances theme independently. The dark theme is layered via `[data-elu-root][data-theme="dark"], [data-theme="dark"] [data-elu-root]:not([data-theme="light"])` — meaning a parent `[data-theme="dark"]` propagates unless the Select explicitly overrides. Size variants (`sm`/`md`/`lg`) override the same vars under `[data-elu-root][data-size="..."]`.

### Forms

`Root.astro` emits one `<input type="hidden">` per selected value (matches native `<select multiple>` `FormData` serialization). `required` is forwarded to the hidden input. The controller listens for `form reset` to restore `defaultValue`.

## Landing app (`apps/web`)

- Tailwind v4 via `@tailwindcss/vite`, configured in `astro.config.mjs`.
- Geist via `@fontsource-variable/geist` (imported once in `src/layouts/Layout.astro`).
- The page-level theme (light/dark) lives on `<html data-theme="...">`. The toggle is itself a `Select` instance; the change handler adds an `html.theme-transitioning` class for ~220ms with `!important` global transitions so every paintable surface crossfades in lockstep. Don't replace this with per-element transitions — that's what the `globals.css` block under `html.theme-transitioning *` exists to avoid.
- The page is structured as `<header class="hero">` + a `.container > .content` flex column of sections (Installation / Usage / Multi / Searchable / Grouped / Sizes / Theme / Customization). Each demo section follows the pattern: `<h2>` + `<p>` + `.demo-row` (live Select) + `.codeblock` (Astro `<Code>` from `astro:components` with dual Shiki themes `github-light` / `github-dark`, swapped via `--shiki-light` / `--shiki-dark` CSS vars).

## Project-specific rules

- **`elu` is published to npm** (source-only, no build step). Inside this repo the landing consumes the package via the `"elu": "*"` workspace symlink, not the registry copy.
- **Don't add a bundler/build step to the package.** Source ships as-is — Astro's Vite plugin resolves `.astro`/`.ts` in the consumer.
- **Don't introduce runtime dependencies.** Only `astro` as a peer.
- **`workspace:*` will break npm.** Always use `"*"` in the consuming app's `package.json`.
- **Animation defaults are intentional.** When touching `src/styles.css`, preserve the Emil rules above (transform/opacity only, ease-out, exit faster than entry, no animation on highlight movement, reduced-motion bypass).
- **CSS vars are scoped to `[data-elu-root]`**, never `:root`. Page-level vars in `apps/web/src/styles/globals.css` use `--page-*`.
- **All colors use `oklch()`** — never `hsl()`, `rgb()`, or hex. This applies to both `packages/elu/src/styles.css` and `apps/web/src/styles/globals.css`. Pure neutrals use `oklch(L 0 0)` (C=0, H=0).
- **`InstallBlock.astro`** is a dedicated component for copyable install commands (single `<code role="button">` element, `cursor: copy`, WAAPI icon swap). Use it for `npm install` blocks. `CodeBlock.astro` is for multi-line code snippets and accepts an optional `class?` prop for layout overrides.
