<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { EluController } from '@mgasme/elu-core/controller';
import type { EluChangeDetail, Dir, Size, Theme } from '@mgasme/elu-core/types';

const props = withDefaults(
  defineProps<{
    id?: string;
    name?: string;
    defaultValue?: string | string[];
    modelValue?: string | string[];
    multiple?: boolean;
    disabled?: boolean;
    required?: boolean;
    dir?: Dir;
    size?: Size;
    theme?: Theme;
  }>(),
  { dir: 'ltr' },
);

const emit = defineEmits<{
  'update:modelValue': [next: string | string[]];
  change: [detail: EluChangeDetail];
}>();

const rootRef = ref<HTMLDivElement | null>(null);
const ctrlRef = ref<EluController | null>(null);

const initialArray: string[] = (() => {
  const src = props.modelValue ?? props.defaultValue;
  if (src == null || src === '') return [];
  return Array.isArray(src) ? src.map(String) : [String(src)];
})();

function onChange(e: Event) {
  const detail = (e as CustomEvent<EluChangeDetail>).detail;
  emit('update:modelValue', detail.value);
  emit('change', detail);
}

onMounted(() => {
  const root = rootRef.value;
  if (!root) return;
  root.dataset.eluBooted = 'true';
  const ctrl = new EluController({ root });
  ctrlRef.value = ctrl;
  root.addEventListener('elu:change', onChange);
});

onUnmounted(() => {
  const root = rootRef.value;
  root?.removeEventListener('elu:change', onChange);
  ctrlRef.value?.destroy();
  ctrlRef.value = null;
});

// Controlled mode: push external v-model updates into the controller silently.
watch(
  () => props.modelValue,
  (next) => {
    if (next !== undefined) ctrlRef.value?.setValue(next, { silent: true });
  },
);
</script>

<template>
  <div
    ref="rootRef"
    data-elu-root
    data-state="closed"
    :data-multiple="multiple ? 'true' : null"
    :data-disabled="disabled ? 'true' : null"
    :data-required="required ? 'true' : null"
    :data-size="size"
    :data-theme="theme"
    :data-name="name"
    :data-value-initial="JSON.stringify(initialArray)"
    :dir="dir"
    :id="id"
  >
    <slot />
    <span data-elu-form-inputs hidden />
  </div>
</template>
