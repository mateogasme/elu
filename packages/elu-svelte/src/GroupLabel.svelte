<script lang="ts">
  let className: string = '';
  export { className as class };
</script>

<div data-elu-group-label class={className}>
  <slot />
</div>
