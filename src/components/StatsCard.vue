<template>
  <CozyCard title="Island stats" icon="★" color="#f5a742">
    <div class="stats">
      <div class="stat">
        <div class="label">Current</div>
        <div class="value">
          <WeightValue v-if="latest" :kg="latest.kg" :unit="unit" />
          <template v-else>–</template>
        </div>
      </div>
      <div class="stat">
        <div class="label">Change</div>
        <div class="value">
          <span v-if="change != null" :class="change <= 0 ? 'down' : 'up'">
            {{ change > 0 ? '+' : change < 0 ? '−' : '' }}<WeightValue :kg="change" :unit="unit" delta />
          </span>
          <template v-else>–</template>
        </div>
      </div>
      <div class="stat">
        <div class="label">Goal</div>
        <div class="value">
          <WeightValue v-if="goal != null" :kg="goal" :unit="unit" />
          <template v-else>–</template>
        </div>
      </div>
    </div>
    <div class="progress-track">
      <div class="progress-fill" :style="{ width: progress.pct + '%' }" />
    </div>
    <div class="progress-text">{{ progress.text }}</div>
  </CozyCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CozyCard from './CozyCard.vue';
import WeightValue from './WeightValue.vue';
import { useWeights } from '@/composables/useWeights';
import { formatDelta } from '@/utils/units';

const { state, sorted, first, latest } = useWeights();

const unit = computed(() => state.unit);
const goal = computed(() => state.goal);
const change = computed(() => (sorted.value.length > 1 ? latest.value!.kg - first.value!.kg : null));

const progress = computed(() => {
  if (state.goal == null) return { pct: 0, text: 'Set a goal to see your progress!' };
  if (!first.value || !latest.value) return { pct: 0, text: 'Log a weigh-in to start your progress path!' };
  const total = first.value.kg - state.goal;
  const done = first.value.kg - latest.value.kg;
  const pct = Math.abs(total) < 0.01 ? 100 : Math.max(0, Math.min(100, (done / total) * 100));
  const left = Math.abs(latest.value.kg - state.goal);
  if (left < 0.05) return { pct: 100, text: 'Goal reached! 🎉' };
  return { pct, text: `${Math.round(pct)}% of the way · ${formatDelta(left, state.unit)} to go` };
});
</script>

<style scoped lang="scss">
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat {
  background: $cream-2;
  border-radius: 20px;
  padding: 12px 6px;
  text-align: center;
  min-width: 0;
}

.label {
  font-size: 13px;
  color: $brown-soft;
}

.value {
  font-family: $font-display;
  font-weight: 800;
  font-size: 26px;
  line-height: 1.1;

  @include small-screen {
    font-size: 19px;
  }
}

.down {
  color: $leaf-dark;
}

.up {
  color: $red-soft;
}

.progress-track {
  margin-top: 16px;
  height: 22px;
  border-radius: $radius-pill;
  background: $cream-2;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: $radius-pill;
  background: repeating-linear-gradient(-45deg, $leaf 0 12px, #52c47a 12px 24px);
  transition: width 0.5s ease;
}

.progress-text {
  text-align: center;
  font-size: 14px;
  margin-top: 6px;
  color: $brown-soft;
}
</style>
