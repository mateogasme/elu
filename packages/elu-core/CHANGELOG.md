# Changelog

All notable changes to `@mgasme/elu-core` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-05-15

### Added
- `MutationObserver` on `[data-elu-viewport]` so items added or reordered after mount auto-rewire ARIA, IDs, and click listeners via a queued `refresh()`. Required by the Vue and React ports.

### Changed
- Version bump to align with `@mgasme/elu`, `@mgasme/elu-react`, and `@mgasme/elu-vue` 0.4.0.

## [0.1.0]

Initial extraction of the framework-agnostic controller, keyboard matrix, types, and styles from `@mgasme/elu`.
