<script setup lang="ts">
withDefaults(
  defineProps<{
    placeholder?: string;
    debounceMs?: number;
  }>(),
  { placeholder: 'Search…', debounceMs: 0 },
);
</script>

<template>
  <div data-elu-search>
    <input
      type="search"
      :placeholder="placeholder"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      enterkeyhint="search"
      :data-debounce-ms="debounceMs"
    />
  </div>
</template>
