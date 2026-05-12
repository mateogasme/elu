# elu

Composable Select component for Astro. Single, multi, searchable and grouped, in one tiny package. Zero runtime dependencies.

Built on the native Popover API and CSS Anchor Positioning. Animation defaults follow Emil Kowalski's published principles (Sonner / Vaul lineage).

**Demo:** https://elu-astro.vercel.app

## Install

```bash
npm install @mgasme/elu
```

Astro `^5` or `^6` is a peer dependency.

## Minimal usage

```astro
---
import { Elu } from '@mgasme/elu';
import '@mgasme/elu/styles.css';
---

<Elu.Root name="fruit">
  <Elu.Trigger>
    <Elu.Value placeholder="Pick a fruit" />
  </Elu.Trigger>
  <Elu.Content>
    <Elu.Viewport>
      <Elu.Item value="apple">
        <Elu.ItemText>Apple</Elu.ItemText>
        <Elu.ItemIndicator />
      </Elu.Item>
      <Elu.Item value="pear">
        <Elu.ItemText>Pear</Elu.ItemText>
        <Elu.ItemIndicator />
      </Elu.Item>
    </Elu.Viewport>
  </Elu.Content>
</Elu.Root>
```

## Multi-select + grouped + searchable

```astro
<Elu.Root name="tags" multiple>
  <Elu.Trigger><Elu.Value placeholder="Pick tags" /></Elu.Trigger>
  <Elu.Content>
    <Elu.Search placeholder="Search…" />
    <Elu.Viewport>
      <Elu.Group>
        <Elu.GroupLabel>Team</Elu.GroupLabel>
        <Elu.Item value="design"><Elu.ItemText>Design</Elu.ItemText><Elu.ItemIndicator /></Elu.Item>
        <Elu.Item value="eng"><Elu.ItemText>Engineering</Elu.ItemText><Elu.ItemIndicator /></Elu.Item>
      </Elu.Group>
      <Elu.Separator />
      <Elu.Empty>No matches.</Elu.Empty>
    </Elu.Viewport>
  </Elu.Content>
</Elu.Root>
```

Multi trigger display:

| Selected | Trigger text |
|---|---|
| 0 | placeholder |
| 1 | item label |
| 2 | "A, B" |
| 3+ | "N selected" |

## API

### Parts

| Part | Required? | Why it exists |
|---|---|---|
| `Elu.Root` | yes | Scope owner. Emits hidden form input(s), holds ARIA root ids, owns the boot script. Mirrors Vaul `Drawer.Root`. |
| `Elu.Trigger` | yes | Button. Owns `:active` press scale, the popover anchor, focus ring. Separate part per Sonner's "one element one job". |
| `Elu.Value` | yes | Slot for the current selection text. Lets users style placeholder vs filled state. Parallel of Radix `Select.Value`. |
| `Elu.Content` | yes | Popover surface. Holds `popover="auto"`, anchor positioning, animation. |
| `Elu.Viewport` | yes | Scroll region. Separate from Content so Search / Empty don't scroll out of view. |
| `Elu.Item` | yes | `role="option"`. `value` mandatory so form serialization works even with icon-rich labels. |
| `Elu.ItemText` | yes | Labels option for screen readers + Trigger Value mirror. |
| `Elu.ItemIndicator` | optional | Renders only when item is selected (Vaul `Handle` precedent — slot-only-under-state). Ships an inline 14px check SVG; pass children to override. |
| `Elu.Group` + `Elu.GroupLabel` | optional | APG listbox grouping. Label is sticky. |
| `Elu.Separator` | optional | Visual divider. |
| `Elu.Search` | optional | Filterable combobox pattern. Filters items via the native `[hidden]` attribute. |
| `Elu.Empty` | optional | Shown declaratively via CSS `:has()` when every Item is hidden. No JS toggle. |

### Root props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `id` | `string` | auto | Use to deterministically link an external `<label for>`. |
| `name` | `string` | — | Hidden form input name. Omit to keep the Select outside form submission. |
| `value` | `string \| string[]` | — | Controlled-ish initial value. |
| `defaultValue` | `string \| string[]` | — | Uncontrolled initial value. |
| `multiple` | `boolean` | `false` | Multi-select mode. Hidden inputs serialize one-per-value like native `<select multiple>`. |
| `disabled` | `boolean` | `false` | Disables the trigger and prevents opening. |
| `required` | `boolean` | `false` | Adds `aria-required` and `required` to the hidden input. |
| `dir` | `'ltr' \| 'rtl'` | `'ltr'` | |
| `class` | `string` | — | |

### Content props

| Prop | Type | Default |
|---|---|---|
| `side` | `'top' \| 'bottom'` | `'bottom'` |
| `align` | `'start' \| 'center' \| 'end'` | `'start'` |
| `sideOffset` | `number` | `4` |
| `collisionPadding` | `number` | `8` |
| `class` | `string` | — |

Anchor positioning is driven by `side` and `align`. The `transform-origin` of the open animation is selected from these attributes — Emil's "origin-aware scaling" rule.

### Item props

| Prop | Type | Required | Notes |
|---|---|---|---|
| `value` | `string` | yes | Submitted form value. |
| `textValue` | `string` | no | Override the text used for filtering / type-ahead when children include icons. |
| `disabled` | `boolean` | no | Skipped by keyboard navigation (APG recommendation). |
| `class` | `string` | no | |

### Search props

| Prop | Type | Default |
|---|---|---|
| `placeholder` | `string` | `'Search…'` |
| `debounceMs` | `number` | `0` |
| `class` | `string` | — |

### Form integration

```astro
<form>
  <Elu.Root name="tags" multiple required defaultValue={['design']}>…</Elu.Root>
  <button type="submit">Submit</button>
</form>

<script>
  document.querySelector('form')!.addEventListener('submit', (e) => {
    const data = new FormData(e.target as HTMLFormElement);
    console.log(data.getAll('tags'));
  });
</script>
```

The Select emits a `<input type="hidden">` per selected value, parented inside Root, so it serializes via `FormData` like a native `<select multiple>`.

### `elu:change` event

The Root element dispatches a bubbling `elu:change` CustomEvent each time the selection changes:

```ts
root.addEventListener('elu:change', (e: CustomEvent) => {
  console.log(e.detail.value); // string | string[]
});
```

## Theming

All visuals are controlled by CSS custom properties scoped to `[data-elu-root]`. Override per-instance or globally:

```css
[data-elu-root] {
  --elu-radius: 12px;
  --elu-bg: hsl(220 14% 96%);
  --elu-duration-open: 220ms;
}
```

### Variables

#### Colors

| Var | Default | Controls |
|---|---|---|
| `--elu-bg` | `hsl(0 0% 100%)` | Trigger + Content surface |
| `--elu-border` | `hsl(0 0% 92%)` | Border (shadow-as-border per Vercel DS) |
| `--elu-border-strong` | `hsl(0 0% 85%)` | Trigger `:hover` border |
| `--elu-text` | `hsl(0 0% 9%)` | Primary text |
| `--elu-text-muted` | `hsl(0 0% 43%)` | Placeholder, GroupLabel |
| `--elu-item-bg-hover` | `hsl(0 0% 96%)` | Item `:hover` |
| `--elu-item-bg-active` | `hsl(0 0% 93%)` | Item keyboard-highlighted |
| `--elu-shadow` | `0 1px 2px …, 0 8px 24px …` | Content elevation (Emil "Tailored Shadows") |
| `--elu-focus-ring` | `hsl(212 100% 47%)` | Trigger `:focus-visible` |

#### Size / radius / spacing

| Var | Default | Controls |
|---|---|---|
| `--elu-radius` | `8px` | Trigger + Content radius |
| `--elu-radius-item` | `6px` | Item radius |
| `--elu-width` | `min(280px, calc(100vw - 32px))` | Min width of Trigger + Content |
| `--elu-trigger-height` | `36px` | Trigger height |
| `--elu-item-height` | `32px` | Item min-height |
| `--elu-item-padding-x` | `8px` | Item horizontal padding |
| `--elu-content-padding` | `4px` | Content inner padding |
| `--elu-gap` | `2px` | Item gap |

#### Typography

| Var | Default |
|---|---|
| `--elu-font` | system stack |
| `--elu-font-size` | `14px` |
| `--elu-font-weight` | `500` |
| `--elu-font-weight-label` | `600` |

#### Animation

| Var | Default | Why |
|---|---|---|
| `--elu-duration-open` | `180ms` | Emil-canonical entry duration |
| `--elu-duration-close` | `140ms` | Exit faster than entry |
| `--elu-easing` | `cubic-bezier(0.23, 1, 0.32, 1)` | Documented Emil ease-out |
| `--elu-trigger-active-scale` | `0.97` | Pressable feel |

Animations animate only `transform` and `opacity`. The component respects `prefers-reduced-motion: reduce` automatically.

## Hide the built-in chevron

```css
[data-elu-trigger] [data-elu-icon] { display: none; }
```

## Browser support

| Feature | Chrome | Safari | Firefox |
|---|---|---|---|
| Popover API + `:popover-open` + `@starting-style` | ✅ | ✅ | ✅ |
| CSS Anchor Positioning | ✅ | ✅ (Safari 26+) | ❌ (JS fallback ships in this library) |

Firefox is auto-detected via `CSS.supports('anchor-name', '--x')`; if absent, the component positions the popover with `getBoundingClientRect()` on `toggle`, `scroll`, and `resize`. No external dependency.

## Accessibility

Follows the WAI-ARIA APG editable combobox + listbox pattern with `aria-activedescendant` (not roving tabindex) so focus can stay on the Search input while users arrow through options.

- https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
- https://www.w3.org/WAI/ARIA/apg/patterns/listbox/

## License

MIT
