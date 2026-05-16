<script lang="ts">
  let className: string = '';
  export { className as class };
</script>

<button type="button" data-elu-trigger class={className}>
  <slot />
  <svg
    data-elu-icon
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
</button>
