<script lang="ts">
  export let value: string;
  export let disabled: boolean = false;
  export let textValue: string | undefined = undefined;
  let className: string = '';
  export { className as class };
</script>

<div
  data-elu-item
  data-value={value}
  data-text-value={textValue ?? null}
  data-disabled={disabled ? 'true' : null}
  class={className}
>
  <slot />
</div>
