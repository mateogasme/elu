# Changelog

All notable changes to `@mgasme/elu-vue` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-05-15

### Added
- Initial Vue 3 release. Compound-component API (`Elu.Root`, `Elu.Trigger`, `Elu.Value`, `Elu.Content`, `Elu.Viewport`, `Elu.Item`, `Elu.ItemText`, `Elu.ItemIndicator`, `Elu.Group`, `Elu.GroupLabel`, `Elu.Separator`, `Elu.Search`, `Elu.Empty`) backed by the shared `@mgasme/elu-core` controller.
- Three consumption styles: namespace import (`import { Elu }`), named part imports, and Vue plugin install (`app.use(Elu)` → kebab-case `<elu-root>` / PascalCase `<EluRoot>` globally registered).
- `v-model` support on `Elu.Root` (maps to `modelValue` / `update:modelValue`). Uncontrolled mode via `defaultValue` prop.
- Source-only ship — no build step. Consumer's Vite/Vue toolchain compiles `.vue` SFCs natively.
