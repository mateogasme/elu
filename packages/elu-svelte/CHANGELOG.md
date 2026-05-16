# Changelog

All notable changes to `@mgasme/elu-svelte` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-05-15

### Added
- Initial Svelte release. Compound-component API (`Elu.Root`, `Elu.Trigger`, `Elu.Value`, `Elu.Content`, `Elu.Viewport`, `Elu.Item`, `Elu.ItemText`, `Elu.ItemIndicator`, `Elu.Group`, `Elu.GroupLabel`, `Elu.Separator`, `Elu.Search`, `Elu.Empty`) backed by the shared `@mgasme/elu-core` controller.
- Two consumption styles: namespace import (`import { Elu }`) and named part imports.
- `bind:value` support on `Elu.Root` (Svelte two-way binding) plus `on:change` event with `EluChangeDetail` payload. Uncontrolled mode via `defaultValue` prop.
- Works in Svelte 4 and Svelte 5 (legacy mode in 5, source untouched).
- Source-only ship — no build step. Consumer's Vite/SvelteKit toolchain compiles `.svelte` files natively.
