<template>
  <CozyCard title="Journal" icon="❀" color="#f79fb3">
    <template v-if="rows.length" #hint>Tap to add a note · swipe to remove</template>

    <div v-if="!rows.length" class="empty">Your journal is empty for now ✿</div>

    <ion-list v-else lines="none" class="journal">
      <ion-item-sliding v-for="row in rows" :key="row.entry.date">
        <ion-item button :detail="false" class="entry" @click="$emit('edit', row.entry)">
          <div class="entry-body">
            <div class="top">
              <span class="date">{{ prettyDate(row.entry.date, dateFmt) }}</span>
              <span class="weight"><WeightValue :kg="row.entry.kg" :unit="unit" /></span>
              <span v-if="row.delta == null" class="delta start">start</span>
              <span v-else class="delta" :class="row.delta <= 0 ? 'down' : 'up'">
                {{ row.delta > 0 ? '▲ +' : row.delta < 0 ? '▼ −' : '• ' }}<WeightValue
                  :kg="row.delta"
                  :unit="unit"
                  delta
                />
              </span>
            </div>
            <p v-if="row.entry.note" class="note">“{{ row.entry.note }}”</p>
          </div>
        </ion-item>
        <ion-item-options side="end">
          <ion-item-option color="danger" @click="$emit('remove', row.entry)">Remove</ion-item-option>
        </ion-item-options>
      </ion-item-sliding>
    </ion-list>
  </CozyCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonList } from '@ionic/vue';
import CozyCard from './CozyCard.vue';
import WeightValue from './WeightValue.vue';
import { useWeights, type WeighIn } from '@/composables/useWeights';
import { prettyDate } from '@/utils/dates';

defineEmits<{ edit: [entry: WeighIn]; remove: [entry: WeighIn] }>();

const { state, sorted } = useWeights();
const unit = computed(() => state.unit);
const dateFmt: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };

const rows = computed(() =>
  sorted.value
    .map((entry, i, list) => ({ entry, delta: i > 0 ? entry.kg - list[i - 1].kg : null }))
    .reverse(),
);
</script>

<style scoped lang="scss">
.journal {
  background: transparent;
  padding: 0;
}

ion-item-sliding {
  border-bottom: 3px dashed $cream-2;

  &:last-child {
    border-bottom: 0;
  }
}

.entry {
  --background: #{$cream};
  --background-hover: #{$cream-2};
  --background-hover-opacity: 0.6;
  --background-activated: #{$cream-2};
  --color: #{$brown};
  --padding-start: 6px;
  --inner-padding-end: 6px;
  --min-height: 52px;
}

.entry-body {
  width: 100%;
  padding: 8px 0;
}

.top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date {
  flex: 1;
  min-width: 0;
}

.weight {
  font-family: $font-display;
  font-weight: 800;
  font-size: 20px;
  white-space: nowrap;
}

.delta {
  font-size: 13px;
  font-weight: 800;
  min-width: 70px;
  text-align: right;
  white-space: nowrap;

  &.start {
    color: $brown-soft;
  }
}

.down {
  color: $leaf-dark;
}

.up {
  color: $red-soft;
}

.note {
  margin: 6px 0 0;
  padding: 8px 12px;
  background: $cream-2;
  border-radius: 14px 14px 14px 4px;
  font-size: 14px;
  color: $brown;
  white-space: pre-wrap;
  word-break: break-word;
}

ion-item-option {
  font-family: $font-display;
  font-weight: 800;
  border-radius: 16px;
  margin: 6px 0 6px 6px;
}

.empty {
  text-align: center;
  color: $brown-soft;
  padding: 26px 0;
}

@include small-screen {
  .top {
    flex-wrap: wrap;
    row-gap: 2px;
  }

  .date {
    flex-basis: 100%;
    font-size: 14px;
    color: $brown-soft;
  }

  .weight {
    flex: 1;
  }
}
</style>
