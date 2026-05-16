<script setup lang="ts">
import type { Side, Align } from '@mgasme/elu-core/types';

withDefaults(
  defineProps<{
    align?: Align;
    side?: Side;
    sideOffset?: number;
    collisionPadding?: number;
  }>(),
  { align: 'start', side: 'bottom', sideOffset: 4, collisionPadding: 8 },
);
</script>

<template>
  <div
    data-elu-content
    popover="auto"
    :data-side="side"
    :data-align="align"
    :data-side-offset="sideOffset"
    :data-collision-padding="collisionPadding"
  >
    <slot />
  </div>
</template>
