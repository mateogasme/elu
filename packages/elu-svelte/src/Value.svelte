<script lang="ts">
  export let placeholder: string = '';
  let className: string = '';
  export { className as class };
</script>

<span data-elu-value data-placeholder={placeholder} data-empty="true" class={className}
  >{placeholder}</span
>
