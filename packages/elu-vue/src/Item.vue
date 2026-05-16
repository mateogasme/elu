<script setup lang="ts">
defineProps<{ value: string; disabled?: boolean; textValue?: string }>();
</script>

<template>
  <div
    data-elu-item
    :data-value="value"
    :data-text-value="textValue"
    :data-disabled="disabled ? 'true' : null"
  >
    <slot />
  </div>
</template>
