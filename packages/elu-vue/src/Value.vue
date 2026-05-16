<script setup lang="ts">
withDefaults(defineProps<{ placeholder?: string }>(), { placeholder: '' });
</script>

<template>
  <span data-elu-value :data-placeholder="placeholder" data-empty="true">{{ placeholder }}</span>
</template>
