# Changelog

All notable changes to `@mgasme/elu-react` are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-05-15

### Changed
- Version bump to align with `@mgasme/elu`, `@mgasme/elu-core`, and `@mgasme/elu-vue` 0.4.0.

### Internal
- `MutationObserver` on the viewport now lives in `@mgasme/elu-core`, so dynamic item lists (`{items.map(...)}`) keep working without per-render bookkeeping.

## [0.1.0]

Initial React release. Same compound-component API as `@mgasme/elu`, same CSS, shared controller via `@mgasme/elu-core`. All parts ship with `"use client"` for Next.js App Router compatibility. Controlled mode via `value` / `onValueChange`, uncontrolled via `defaultValue`.
