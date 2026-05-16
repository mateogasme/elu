<script lang="ts">
  export let maxHeight: string | number | undefined = undefined;
  let className: string = '';
  export { className as class };
</script>

<div
  data-elu-viewport
  class={className}
  style={maxHeight != null ? `max-height: ${typeof maxHeight === 'number' ? maxHeight + 'px' : maxHeight}` : ''}
>
  <slot />
</div>
