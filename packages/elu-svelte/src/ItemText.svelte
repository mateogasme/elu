<script lang="ts">
  let className: string = '';
  export { className as class };
</script>

<span data-elu-item-text class={className}>
  <slot />
</span>
