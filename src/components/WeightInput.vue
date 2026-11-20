<template>
  <div class="weight-input" :class="{ split: unit === 'st' }">
    <label class="field">
      <span>{{ label }} ({{ unit }})</span>
      <input
        v-model="primary"
        type="number"
        inputmode="decimal"
        :step="unit === 'st' ? 1 : 0.1"
        min="0"
        :placeholder="placeholder"
        @input="emitValue"
      />
    </label>
    <label v-if="unit === 'st'" class="field">
      <span>(lb)</span>
      <input
        v-model="secondary"
        type="number"
        inputmode="decimal"
        step="0.1"
        min="0"
        max="13.9"
        placeholder="lb"
        @input="emitValue"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { inputToKg, kgToInput, type Unit } from '@/utils/units';

const props = defineProps<{
  modelValue: number | null;
  unit: Unit;
  label: string;
  optional?: boolean;
}>();
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>();

const primary = ref('');
const secondary = ref('');

const placeholder = computed(() => {
  if (props.optional) return 'optional';
  return { kg: 'e.g. 70.5', lb: 'e.g. 155.4', st: 'st' }[props.unit];
});

let lastEmitted: number | null = null;

function emitValue() {
  const p = parseFloat(String(primary.value));
  const s = parseFloat(String(secondary.value));
  lastEmitted = Number.isFinite(p) || Number.isFinite(s) ? inputToKg(props.unit, p, s) : null;
  emit('update:modelValue', lastEmitted);
}

function fill(kg: number | null) {
  lastEmitted = kg;
  if (kg == null) {
    primary.value = '';
    secondary.value = '';
    return;
  }
  const v = kgToInput(kg, props.unit);
  primary.value = v.primary;
  secondary.value = v.secondary;
}

// Re-fill the fields when the parent changes the value (e.g. clearing after save).
watch(
  () => props.modelValue,
  (kg) => {
    if (kg !== lastEmitted) fill(kg);
  },
  { immediate: true },
);

// Keep the typed weight when switching units.
watch(
  () => props.unit,
  () => fill(props.modelValue),
);
</script>

<style scoped lang="scss">
.weight-input {
  display: grid;
  gap: 8px;

  &.split {
    grid-template-columns: 1fr 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: $brown-soft;
  min-width: 0;
}

input {
  @include field;
}
</style>
