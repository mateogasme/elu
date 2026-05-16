<script lang="ts">
  let className: string = '';
  export { className as class };
</script>

<div data-elu-empty role="status" aria-live="polite" class={className}>
  <slot>No results.</slot>
</div>
