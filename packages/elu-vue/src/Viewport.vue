<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ maxHeight?: string }>();
const style = computed(() => (props.maxHeight ? { maxHeight: props.maxHeight } : undefined));
</script>

<template>
  <div data-elu-viewport :style="style">
    <slot />
  </div>
</template>
