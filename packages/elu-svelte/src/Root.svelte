<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { EluController } from '@mgasme/elu-core/controller';
  import type { EluChangeDetail, Dir, Size, Theme } from '@mgasme/elu-core/types';

  export let id: string | undefined = undefined;
  export let name: string | undefined = undefined;
  export let defaultValue: string | string[] | undefined = undefined;
  export let value: string | string[] | undefined = undefined;
  export let multiple: boolean = false;
  export let disabled: boolean = false;
  export let required: boolean = false;
  export let dir: Dir = 'ltr';
  export let size: Size | undefined = undefined;
  export let theme: Theme | undefined = undefined;

  let className: string = '';
  export { className as class };

  let rootEl: HTMLDivElement;
  let ctrl: EluController | null = null;

  const dispatch = createEventDispatcher<{ change: EluChangeDetail }>();

  const initialArray: string[] = (() => {
    const src = value ?? defaultValue;
    if (src == null || src === '') return [];
    return Array.isArray(src) ? src.map(String) : [String(src)];
  })();

  function handleChange(e: Event) {
    const detail = (e as CustomEvent<EluChangeDetail>).detail;
    value = detail.value;
    dispatch('change', detail);
  }

  onMount(() => {
    rootEl.dataset.eluBooted = 'true';
    ctrl = new EluController({ root: rootEl });
    rootEl.addEventListener('elu:change', handleChange);
  });

  onDestroy(() => {
    rootEl?.removeEventListener('elu:change', handleChange);
    ctrl?.destroy();
    ctrl = null;
  });

  // Controlled mode: push external value changes into the controller silently.
  $: if (ctrl && value !== undefined) ctrl.setValue(value, { silent: true });
</script>

<div
  bind:this={rootEl}
  data-elu-root
  data-state="closed"
  data-multiple={multiple ? 'true' : null}
  data-disabled={disabled ? 'true' : null}
  data-required={required ? 'true' : null}
  data-size={size ?? null}
  data-theme={theme ?? null}
  data-name={name ?? null}
  data-value-initial={JSON.stringify(initialArray)}
  {dir}
  {id}
  class={className}
>
  <slot />
  <!-- Controller writes hidden form inputs here imperatively. -->
  <span data-elu-form-inputs hidden></span>
</div>
