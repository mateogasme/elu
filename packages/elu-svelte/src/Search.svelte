<script lang="ts">
  export let placeholder: string = 'Search…';
  export let debounceMs: number = 0;
  let className: string = '';
  export { className as class };
</script>

<div data-elu-search class={className}>
  <input
    type="search"
    {placeholder}
    autocomplete="off"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    enterkeyhint="search"
    data-debounce-ms={debounceMs}
  />
</div>
