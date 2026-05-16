<script lang="ts">
  let className: string = '';
  export { className as class };
</script>

<div data-elu-group role="group" class={className}>
  <slot />
</div>
