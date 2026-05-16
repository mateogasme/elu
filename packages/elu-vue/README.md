# @mgasme/elu-vue

Composable Vue 3 select component. Single, multi, searchable, grouped. Zero runtime dependencies.

Same compound-component API as `@mgasme/elu` (Astro) and `@mgasme/elu-react` (React), powered by a shared framework-agnostic controller.

## Install

```bash
npm install @mgasme/elu-vue
```

Requires Vue 3.3 or later.

## Usage

Import styles once in your app entry:

```ts
import '@mgasme/elu-vue/styles.css';
```

Three ways to consume the components:

### 1. Namespace import

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Elu } from '@mgasme/elu-vue';

const fruit = ref('orange');
</script>

<template>
  <Elu.Root v-model="fruit">
    <Elu.Trigger><Elu.Value placeholder="Pick a fruit" /></Elu.Trigger>
    <Elu.Content>
      <Elu.Viewport>
        <Elu.Item value="orange"><Elu.ItemText>Orange</Elu.ItemText><Elu.ItemIndicator /></Elu.Item>
        <Elu.Item value="lemon"><Elu.ItemText>Lemon</Elu.ItemText><Elu.ItemIndicator /></Elu.Item>
      </Elu.Viewport>
    </Elu.Content>
  </Elu.Root>
</template>
```

### 2. Named imports

```vue
<script setup lang="ts">
import { Root, Trigger, Value, Content, Viewport, Item, ItemText, ItemIndicator } from '@mgasme/elu-vue';
</script>
```

### 3. Global plugin

```ts
// main.ts
import { createApp } from 'vue';
import { Elu } from '@mgasme/elu-vue';
import '@mgasme/elu-vue/styles.css';
import App from './App.vue';

createApp(App).use(Elu).mount('#app');
```

Then in any template:

```vue
<template>
  <elu-root v-model="fruit">
    <elu-trigger><elu-value placeholder="Pick" /></elu-trigger>
    ...
  </elu-root>
</template>
```

## License

MIT
