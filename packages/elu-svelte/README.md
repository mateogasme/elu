# @mgasme/elu-svelte

Composable Svelte select component. Single, multi, searchable, grouped. Zero runtime dependencies.

Same compound-component API as `@mgasme/elu` (Astro), `@mgasme/elu-react` (React), and `@mgasme/elu-vue` (Vue 3), powered by a shared framework-agnostic controller.

## Install

```bash
npm install @mgasme/elu-svelte
```

Requires Svelte 4 or Svelte 5 (SvelteKit works out of the box).

## Usage

Import styles once in your app entry (e.g. `src/routes/+layout.svelte` for SvelteKit):

```svelte
<script>
  import '@mgasme/elu-svelte/styles.css';
</script>
```

### Namespace import

```svelte
<script lang="ts">
  import { Elu } from '@mgasme/elu-svelte';
  let value = 'orange';
</script>

<Elu.Root name="fruit" bind:value>
  <Elu.Trigger>
    <Elu.Value placeholder="Pick a fruit" />
  </Elu.Trigger>
  <Elu.Content>
    <Elu.Viewport>
      <Elu.Item value="orange">
        <Elu.ItemText>Orange</Elu.ItemText>
        <Elu.ItemIndicator />
      </Elu.Item>
      <Elu.Item value="lemon">
        <Elu.ItemText>Lemon</Elu.ItemText>
        <Elu.ItemIndicator />
      </Elu.Item>
    </Elu.Viewport>
  </Elu.Content>
</Elu.Root>
```

### Named imports

```svelte
<script lang="ts">
  import { Root, Trigger, Value, Content, Viewport, Item, ItemText, ItemIndicator } from '@mgasme/elu-svelte';
</script>

<Root name="fruit">
  <Trigger>
    <Value placeholder="Pick a fruit" />
  </Trigger>
  <Content>
    <Viewport>
      <Item value="orange">
        <ItemText>Orange</ItemText>
        <ItemIndicator />
      </Item>
    </Viewport>
  </Content>
</Root>
```

## Controlled mode

Use `bind:value` for two-way binding, or `value` + `on:change` for one-way:

```svelte
<script lang="ts">
  let fruit = 'orange';
</script>

<!-- two-way -->
<Elu.Root bind:value={fruit}>...</Elu.Root>

<!-- one-way -->
<Elu.Root {value} on:change={(e) => (value = e.detail.value)}>...</Elu.Root>
```

Multi-select returns a `string[]`:

```svelte
<script lang="ts">
  let tags: string[] = [];
</script>

<Elu.Root multiple bind:value={tags}>...</Elu.Root>
```

## License

MIT
