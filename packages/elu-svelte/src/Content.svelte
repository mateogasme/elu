<script lang="ts">
  import type { Side, Align } from '@mgasme/elu-core/types';
  export let align: Align = 'start';
  export let side: Side = 'bottom';
  export let sideOffset: number = 4;
  export let collisionPadding: number = 8;
  let className: string = '';
  export { className as class };
</script>

<div
  data-elu-content
  popover="auto"
  class={className}
  data-side={side}
  data-align={align}
  data-side-offset={sideOffset}
  data-collision-padding={collisionPadding}
>
  <slot />
</div>
