<script lang="ts">
  let className: string = '';
  export { className as class };
</script>

<span data-elu-item-indicator class={className} aria-hidden="true">
  <slot>
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  </slot>
</span>
