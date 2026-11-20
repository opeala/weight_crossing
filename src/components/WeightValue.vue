<template>
  <span class="weight">
    <template v-for="(part, i) in parts" :key="i">
      <span v-if="i > 0">&nbsp;</span>{{ part.value }}<small>&#8239;{{ part.unit }}</small>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { deltaParts, weightParts, type Unit } from '@/utils/units';

const props = defineProps<{
  kg: number;
  unit: Unit;
  /** Treat `kg` as a change in weight (absolute value, stone shown as lb when small). */
  delta?: boolean;
}>();

const parts = computed(() => (props.delta ? deltaParts(props.kg, props.unit) : weightParts(props.kg, props.unit)));
</script>

<style scoped lang="scss">
small {
  font-size: 0.6em;
}
</style>
