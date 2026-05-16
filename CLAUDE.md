# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

TENES ABSOLUTAMENTE PROHIBIDO USAR CLAUDE-IN-CHROME.

En su lugar, utiliza la skill "agent-browser".

Para la extracción de iconos utiliza <https://svgl.app/>. URL pattern: `https://svgl.app/library/{name}.svg` (e.g. `react_dark.svg`, `vue.svg`, `svelte.svg`). Use `agent-browser` to browse the site if the exact filename is unknown.

## Commands

Run from the repo root (npm workspaces):

- `npm install` — symlinks all packages into `apps/web/node_modules`.
- `npm run dev` — Astro dev server for `apps/web` at `http://localhost:4321`.
- `npm run build` — production build of `apps/web`.
- `npm run preview` — preview the production build.
- `npm run check` — type-checks all five workspaces in order: `elu-core`, `elu`, `elu-react`, `elu-vue`, `apps/web`. Use this as the type/diagnostics gate; there is no separate lint or test script.

Workspace-scoped variants:

- `npm run check -w packages/elu-core` — type-check core only (tsc).
- `npm run check -w packages/elu` — type-check Astro package only (astro check).
- `npm run check -w packages/elu-react` — type-check React package only (tsc).
- `npm run check -w packages/elu-vue` — type-check Vue package only (vue-tsc).
- `npm run dev -w apps/web` — same as `npm run dev`.

No test runner is wired up. No lint script. Verification = `npm run check` + manual UI walkthrough in the dev server.

## Architecture

Monorepo with five workspaces:

- `packages/elu-core` — vanilla TS runtime: `EluController`, `bootElu`, `keyboard.ts`, `types.ts`, `styles.css`. Zero dependencies. All framework packages depend on this.
- `packages/elu` — Astro component library. Zero runtime deps (except `@mgasme/elu-core`). `.astro` templates in `components/` are dumb wrappers. `src/{controller,keyboard,types}.ts` are **one-line shim re-exports** from `@mgasme/elu-core/*` (kept so consumers and `Root.astro`'s `<script>` can `import from '../src/controller'` without knowing the extraction happened). `src/styles.css` is `@import '@mgasme/elu-core/styles.css'`.
- `packages/elu-react` — React component library. Same compound-component API as `elu`, same CSS, same controller. All React files have `"use client"` at the top for Next.js App Router.
- `packages/elu-vue` — Vue 3 component library. Same compound-component API, same CSS, same controller. SFCs (`.vue` with `<script setup lang="ts">`); peer dep `vue ^3.3.0`. Lifecycle = `onMounted`/`onUnmounted` (controller mount/destroy). No `class` prop — Vue's automatic class fall-through binds consumer-passed `class` to the SFC's single root. Exports the `Elu` namespace **and** named parts **and** a Vue plugin (`app.use(Elu)` registers all parts as `EluRoot`/`EluTrigger`/... so kebab `<elu-root>` works globally). Type-checked with `vue-tsc --noEmit`.
- `apps/web` — landing page (Astro) that consumes `@mgasme/elu` via workspace symlinks for live demos. Single route: `apps/web/src/pages/index.astro`. The `@astrojs/react` integration is installed and configured in `astro.config.mjs` (enables `client:*` directives if/when needed) but the live demos all use the Astro package. The hero framework toggle (`id="hero-fw"`) and per-`CodeBlock` framework tabs switch between **Astro / React / Vue** code samples — `SectionFrameworks.astro` lists all three as **Available**, with Svelte still labelled "Soon". Vue code samples use the namespace pattern (`<Elu.Root>` with `import { Elu } from '@mgasme/elu-vue'`) and render via Shiki with `lang="html"` (not `"vue"`) so the HTML grammar tokenises `Elu.Root` as a single tag-name token — see `apps/web/src/components/CodeBlock.astro` (`vueLang` default) and `apps/web/src/utils/fw-shiki.ts`.

All packages use `"*"` workspace specifiers (npm-workspaces syntax; **not** `workspace:*`).

### Package ships source, no build step

All packages export source directly — no bundler, no compilation. Vite/Astro/Vue resolve `.ts`/`.tsx`/`.astro`/`.vue` from the workspace symlinks. Do not add a build step to any package.

`packages/elu/src/index.ts` is the Astro barrel — it imports each `.astro` part, side-imports `./styles.css`, and re-exports the `Elu` namespace + types. Adding a new part means: create `components/NewPart.astro`, import + add to the `Elu` object in `src/index.ts`.

`packages/elu-react/src/index.tsx` is the React barrel — same `Elu` namespace, same parts, `"use client"` at top of every file.

### Component model: compound parts + one controller per Root

Public API is a single `Elu` namespace with parts (`Root`, `Trigger`, `Value`, `Content`, `Viewport`, `Item`, `ItemText`, `ItemIndicator`, `Group`, `GroupLabel`, `Separator`, `Search`, `Empty`). All parts are dumb templates; **all behavior lives in `packages/elu-core/src/controller.ts`**.

Bootstrapping flow — **Astro**:
1. `Root.astro` renders `[data-elu-root]` + an inline `<script>` that imports `bootElu` from `@mgasme/elu-core/controller` and instantiates one controller per root.

Bootstrapping flow — **React**:
1. `Root.tsx` renders the same DOM (`<div data-elu-root ...>`).
2. A `useLayoutEffect` constructs `new EluController({ root: ref.current })`, stores it in `ctrlRef`, and returns `ctrl.destroy()` as cleanup.
3. A second `useLayoutEffect([value])` handles controlled mode: when the `value` prop changes, calls `ctrl.setValue(value, { silent: true })` to reconcile without re-emitting `elu:change`.

The controller is the only place that holds state. Templates render structure; CSS reacts to data-attrs; controller mediates. When debugging a behavior, start in `elu-core/src/controller.ts` (and `keyboard.ts` for key handling).

### MutationObserver in the controller

The controller observes `[data-elu-viewport]` children via a `MutationObserver` (added in `elu-core`). On change, it queues a microtask (`queueMicrotask`) to call `this.refresh()`, which re-queries `[data-elu-item]` elements, re-assigns IDs and ARIA roles, re-wires click listeners, and re-syncs selected state. This auto-heals when React re-renders a dynamic item list. Astro's static renders never trigger the observer. `destroy()` disconnects it.

### Public controller surface

The instance is exposed on the root element as `root.__eluInstance`. Notable methods:

- `setValue(value, { silent? })` — programmatic selection. `silent: true` suppresses the `elu:change` event (used by the landing page to set initial theme without re-emitting on boot, and by React's controlled-mode reconciliation).
- `refresh()` — re-queries items, re-assigns IDs/ARIA, re-wires listeners. Called automatically by the MutationObserver; call manually if you mutate items without going through the viewport DOM.
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

- Tailwind v4 via `@tailwindcss/vite`, configured in `astro.config.mjs`. No `tailwind.config.*` file — utilities are applied inline as Tailwind arbitrary-value classes (`text-[var(--page-fg)]`, `shadow-[0_0_0_1px_var(--page-border)]`, etc.). Page-level CSS vars (`--page-*`) live in `apps/web/src/styles/globals.css`.
- Geist via `@fontsource-variable/geist` (imported once in `src/layouts/Layout.astro`).
- **Page structure**: single `pages/index.astro` renders a hero header + a flex column of section components from `src/components/`. Order: `SectionInstallation` → `SectionFrameworks` → `SectionUsage` → `SectionMulti` → `SectionSearchable` → `SectionGrouped` → `SectionSizes` → `SectionTheme` → `SectionCustomization` → `SectionExamples`. Each section is a self-contained `.astro` file: heading + paragraph + live `Elu.Root` demo + `CodeBlock`. Section anchors scroll-margined via `[&_section]:scroll-mt-8` on the wrapper.
- **Theme toggle** (light/dark): lives on `<html data-theme="...">`. The toggle is itself a `Select` instance; the change handler adds an `html.theme-transitioning` class for ~220ms with `!important` global transitions so every paintable surface crossfades in lockstep. Don't replace this with per-element transitions — that's what the `globals.css` block under `html.theme-transitioning *` exists to avoid.
- **Framework toggle**: hero contains an `id="hero-fw"` `Elu.Root` that, on change, sets `html[data-framework="astro|react"]`. This single attribute drives three coordinated swaps via `globals.css`:
  - `[data-code-pane][data-framework]` — which framework's code pane in a `CodeBlock` is visible.
  - `[data-fw-block="astro|react"]` — per-framework prose blocks (e.g., the two `<p>` install descriptions in `SectionInstallation.astro`).
  - `.cb-fw-tab[data-fw]::after` underline + color — the active tab indicator in code-block headers, kept in lockstep across every code block on the page.
- **Code blocks**: Astro `<Code>` from `astro:components` with dual Shiki themes (`github-light` / `github-dark`, swapped via `--shiki-light` / `--shiki-dark` CSS vars).
  - `CodeBlock.astro` accepts either a single `code` string (single pane) or a `codes={{ astro, react }}` object (dual pane with framework tabs). Dual-pane mode marks panes with `data-fw-pair` so global selectors don't accidentally match the per-size slotted panes in `SectionSizes.astro` (which use `data-framework` for a different reason).
  - **Dual-pane height sync** (`fixFwPaneHeights` IIFE in `CodeBlock.astro`): both framework panes are forced to a shared `max-height` so switching framework never reflows the page. Two-pass measurement: (1) temporarily force `display: block` on both panes (since `display: none` reports `scrollHeight = 0`), read `scrollHeight`, lock to the min; (2) measure `offsetHeight - clientHeight` to recover the height stolen by the X scrollbar, add it back. Re-run on a `MutationObserver` so Shiki/HMR re-renders don't desync the heights.
  - **Shiki `overflow-x` override**: Shiki injects `overflow-x: auto` as an inline style on `<pre class="astro-code">`, which beats any plain selector. The pane (not the `<pre>`) must own X scrolling so the scrollbar sits at the pane bottom, not the content bottom. `globals.css` uses `[data-code-pane][data-fw-pair] .astro-code { overflow-x: visible !important }` — the `!important` is load-bearing.

## Deployment

- Vercel project. `vercel.json` declares framework `astro`, `buildCommand: npm run build`, `outputDirectory: apps/web/dist`. Production: `https://elu-astro.vercel.app`.

## Project-specific rules

- **All four published packages are source-only, no build step** (`elu-core`, `elu`, `elu-react`, `elu-vue`). Inside this repo the landing consumes `elu` and `elu-react` via `"*"` workspace symlinks, not registry copies.
- **Don't add a bundler/build step to any package.** Source ships as-is.
- **`packages/elu`, `packages/elu-react`, and `packages/elu-vue` must not have runtime dependencies** other than `@mgasme/elu-core`. `elu-core` itself has zero deps.
- **`workspace:*` will break npm.** Always use `"*"` in `package.json` dependency entries.
- **All React files use `"use client"`** at the top. Required for Next.js App Router RSC compatibility — the controller is DOM-only.
- **Vue parts mount the controller in `onMounted` and destroy in `onUnmounted`.** Only `Root.vue` is non-trivial; the other 12 SFCs are dumb templates with `<slot />`. Don't define a `class` prop on Vue parts — Vue's automatic class fall-through binds consumer-passed `class` to the SFC's single root. `v-model` maps to `modelValue` + `update:modelValue`; controlled-mode reconciliation happens via `watch(() => props.modelValue, ...)` + `ctrl.setValue(next, { silent: true })` (mirrors the React port's controlled-mode pattern).
- **`data-multiple="true"` is a string**, not a presence attribute. The controller checks `root.dataset.multiple === 'true'`.
- **Animation defaults are intentional.** When touching `src/styles.css`, preserve the Emil rules above (transform/opacity only, ease-out, exit faster than entry, no animation on highlight movement, reduced-motion bypass).
- **CSS vars are scoped to `[data-elu-root]`**, never `:root`. Page-level vars in `apps/web/src/styles/globals.css` use `--page-*`.
- **All colors use `oklch()`** — never `hsl()`, `rgb()`, or hex. This applies to both `packages/elu/src/styles.css` and `apps/web/src/styles/globals.css`. Pure neutrals use `oklch(L 0 0)` (C=0, H=0). Exception: inline SVG brand icons (e.g. framework logos) keep their official brand hex values in `fill` attributes — converting brand colors to oklch is not required.
- **`InstallBlock.astro`** is a dedicated component for copyable install commands (single `<code role="button">` element, `cursor: copy`, WAAPI icon swap). Use it for `npm install` blocks. `CodeBlock.astro` is for multi-line code snippets and accepts an optional `class?` prop for layout overrides.
