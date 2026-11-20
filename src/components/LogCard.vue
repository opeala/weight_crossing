<template>
  <CozyCard title="Log a weigh-in" icon="✎" color="#3fb56a">
    <form class="log" @submit.prevent="submit">
      <div class="row">
        <label class="field date">
          <span>Date</span>
          <input v-model="date" type="date" :max="today" required />
        </label>
        <WeightInput v-model="weight" class="weight" :unit="unit" label="Weight" />
      </div>
      <label class="field">
        <span>Note <em>(optional)</em></span>
        <textarea
          v-model="note"
          rows="2"
          maxlength="280"
          placeholder="How are you feeling? Ate a whole basket of peaches?"
        />
      </label>
      <button class="btn" type="submit" :disabled="weight == null">Save it!</button>
    </form>

    <div class="goal-row">
      <WeightInput v-model="goalInput" class="goal" :unit="unit" label="Goal" optional />
      <button class="btn alt" type="button" @click="$emit('goal', goalInput)">Set goal</button>
    </div>

    <div class="units" role="group" aria-label="Units">
      <button
        v-for="u in UNITS"
        :key="u.value"
        type="button"
        :class="{ on: unit === u.value }"
        :aria-pressed="unit === u.value"
        @click="$emit('unit', u.value)"
      >
        {{ u.label }}
      </button>
    </div>
  </CozyCard>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import CozyCard from './CozyCard.vue';
import WeightInput from './WeightInput.vue';
import { UNITS, type Unit } from '@/utils/units';
import { todayISO } from '@/utils/dates';

const props = defineProps<{ unit: Unit; goal: number | null }>();
const emit = defineEmits<{
  log: [payload: { date: string; kg: number; note: string }];
  goal: [kg: number | null];
  unit: [unit: Unit];
}>();

const today = todayISO();
const date = ref(today);
const weight = ref<number | null>(null);
const note = ref('');
const goalInput = ref<number | null>(props.goal);

watch(
  () => props.goal,
  (g) => (goalInput.value = g),
);

function submit() {
  if (!date.value || weight.value == null) return;
  emit('log', { date: date.value, kg: weight.value, note: note.value });
  weight.value = null;
  note.value = '';
}
</script>

<style scoped lang="scss">
.log {
  display: grid;
  gap: 10px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  align-items: end;

  @include small-screen {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  color: $brown-soft;
  min-width: 0;

  em {
    font-style: normal;
    opacity: 0.8;
  }
}

input,
textarea {
  @include field;
}

textarea {
  resize: vertical;
  line-height: 1.4;
}

.btn {
  @include chunky-button($leaf, $leaf-dark);
  justify-self: end;

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }

  &.alt {
    @include chunky-button($blue, $blue-dark);
  }

  @include small-screen {
    justify-self: stretch;
  }
}

.goal-row {
  display: flex;
  gap: 10px;
  align-items: end;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 3px dashed $cream-2;

  .goal {
    flex: 1;
  }
}

.units {
  display: flex;
  margin-top: 14px;
  background: $cream-2;
  border-radius: $radius-pill;
  padding: 4px;

  button {
    flex: 1;
    font: inherit;
    font-weight: 800;
    border: 0;
    background: none;
    color: $brown-soft;
    padding: 6px 14px;
    border-radius: $radius-pill;
    cursor: pointer;

    &.on {
      background: $white;
      color: $leaf-dark;
      box-shadow: 0 2px 0 rgba(0, 0, 0, 0.08);
    }
  }
}
</style>
