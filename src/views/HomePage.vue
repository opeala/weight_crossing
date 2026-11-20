<template>
  <ion-page>
    <ion-content :fullscreen="true" class="island">
      <div class="scene">
        <div class="wrap">
          <header>
            <div class="title-sign">
              <h1>Weight <span>Crossing</span></h1>
            </div>
            <div><span class="date-pill">{{ todayLabel }}</span></div>
          </header>

          <PipDialogue :message="message" />

          <StatsCard />
          <LogCard :unit="state.unit" :goal="state.goal" @log="onLog" @goal="onGoal" @unit="setUnit" />
          <ProgressChart />
          <JournalList @edit="onEdit" @remove="onRemove" />

          <footer>Saved on this device · have a lovely day on the island!</footer>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonContent, IonPage, alertController } from '@ionic/vue';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

import PipDialogue from '@/components/PipDialogue.vue';
import StatsCard from '@/components/StatsCard.vue';
import LogCard from '@/components/LogCard.vue';
import ProgressChart from '@/components/ProgressChart.vue';
import JournalList from '@/components/JournalList.vue';
import { useWeights, type WeighIn } from '@/composables/useWeights';
import { formatDelta, formatWeight } from '@/utils/units';
import { prettyDate, todayISO } from '@/utils/dates';

const { state, ready, sorted, logWeight, setNote, removeEntry, setGoal, setUnit } = useWeights();

const todayLabel = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
const message = ref('');

const tap = () => Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});

function greeting(): string {
  const list = sorted.value;
  const h = new Date().getHours();
  const time = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  if (!list.length)
    return `${time}! I'm Pip, your island weigh-in buddy. Hop on the scale and log your first entry, ribbit!`;
  const last = list[list.length - 1];
  if (last.date === todayISO()) return `${time}! You already logged today. Nice and steady, like a lily pad on a calm pond~`;
  return `${time}! Your last weigh-in was ${prettyDate(last.date, { month: 'long', day: 'numeric' })}. Ready for a new one?`;
}

function reaction(prevKg: number | null, newKg: number, note: string): string {
  const noteBit = note.trim() ? " I've tucked your note into the journal, too." : '';
  if (prevKg == null) return `Your very first entry! Every journey starts with one little hop. Ribbit!${noteBit}`;
  if (state.goal != null && Math.abs(newKg - state.goal) < 0.25)
    return "Wowee! You've reached your goal! Time to celebrate with some fruit!";
  const diff = newKg - prevKg;
  if (Math.abs(diff) < 0.05) return `Right where you were before! Steady as a well-rooted tree.${noteBit}`;
  const toward =
    state.goal == null ? diff < 0 : Math.abs(newKg - state.goal) < Math.abs(prevKg - state.goal);
  const amt = formatDelta(diff, state.unit);
  return toward
    ? `That's ${amt} closer to where you want to be! I'm doing a happy little hop for you!${noteBit}`
    : `${amt} the other way this time, but that's okay! Ups and downs are part of island life.${noteBit}`;
}

function onLog({ date, kg, note }: { date: string; kg: number; note: string }) {
  const prev = logWeight(date, kg, note);
  tap();
  message.value = reaction(prev?.kg ?? null, kg, note);
}

function onGoal(kg: number | null) {
  setGoal(kg);
  message.value =
    kg != null
      ? `A goal of ${formatWeight(kg, state.unit)}! I'll cheer you on every step of the way!`
      : 'Goal cleared! We can just enjoy the island breeze for now.';
}

async function confirmRemove(entry: WeighIn) {
  const alert = await alertController.create({
    cssClass: 'cozy-alert',
    header: 'Remove entry?',
    message: `${prettyDate(entry.date)} · ${formatWeight(entry.kg, state.unit)}`,
    buttons: [
      { text: 'Keep it', role: 'cancel' },
      {
        text: 'Remove',
        role: 'destructive',
        cssClass: 'danger',
        handler: () => {
          removeEntry(entry.date);
          message.value = 'Poof! That entry floated away like a balloon.';
        },
      },
    ],
  });
  await alert.present();
}

async function onEdit(entry: WeighIn) {
  const alert = await alertController.create({
    cssClass: 'cozy-alert',
    header: prettyDate(entry.date, { weekday: 'long', month: 'long', day: 'numeric' }),
    message: formatWeight(entry.kg, state.unit),
    inputs: [
      {
        name: 'note',
        type: 'textarea',
        value: entry.note ?? '',
        placeholder: 'Add a note about this weigh-in…',
        attributes: { maxlength: 280 },
      },
    ],
    buttons: [
      {
        text: 'Remove',
        cssClass: 'danger',
        // Open the confirmation only once this dialog has fully closed (avoids stacked dialogs).
        handler: () => {
          alert.onDidDismiss().then(() => confirmRemove(entry));
        },
      },
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Save',
        handler: (data: { note: string }) => {
          const had = !!entry.note;
          setNote(entry.date, data.note ?? '');
          message.value = data.note?.trim()
            ? 'Note saved! Little memories make the journey sweeter.'
            : had
              ? 'Note cleared, clean as a fresh page!'
              : message.value;
        },
      },
    ],
  });
  await alert.present();
}

const onRemove = confirmRemove;

ready.then(() => (message.value = greeting()));
</script>

<style scoped lang="scss">
.island {
  --background: #{$grass};
}

.scene {
  position: relative;
  min-height: 100%;
  background:
    radial-gradient(circle at 15% 70px, rgba($white, 0.6) 0 40px, transparent 41px),
    radial-gradient(circle at 22% 60px, rgba($white, 0.6) 0 30px, transparent 31px),
    radial-gradient(circle at 80% 50px, rgba($white, 0.55) 0 36px, transparent 37px),
    radial-gradient(circle at 86% 66px, rgba($white, 0.55) 0 26px, transparent 27px),
    linear-gradient($sky 0, $sky-2 calc(var(--ion-safe-area-top, 0px) + 260px), $grass 0);
  background-repeat: no-repeat;

  // Little grass tufts
  &::before {
    content: '';
    position: absolute;
    inset: calc(var(--ion-safe-area-top, 0px) + 261px) 0 0 0;
    background-image:
      radial-gradient(ellipse 6px 3px at 10px 10px, $grass-dark 98%, transparent),
      radial-gradient(ellipse 6px 3px at 40px 34px, $grass-dark 98%, transparent);
    background-size: 60px 48px;
    opacity: 0.55;
    pointer-events: none;
  }
}

.wrap {
  position: relative;
  max-width: 760px;
  margin: 0 auto;
  padding: calc(var(--ion-safe-area-top, 0px) + 24px) 16px calc(var(--ion-safe-area-bottom, 0px) + 40px);
}

header {
  text-align: center;
  margin-bottom: 18px;
}

.title-sign {
  display: inline-block;
  background: $cream;
  border: 4px solid $brown-soft;
  border-radius: $radius-pill;
  padding: 8px 28px 4px;
  box-shadow: $shadow-card;

  h1 {
    font-family: $font-display;
    font-weight: 800;
    font-size: clamp(28px, 6vw, 42px);
    margin: 0;
    letter-spacing: 0.5px;
    color: $leaf-dark;

    span {
      color: $orange;
    }
  }
}

.date-pill {
  margin-top: 10px;
  display: inline-block;
  background: $leaf;
  color: $white;
  font-weight: 800;
  border-radius: $radius-pill;
  padding: 4px 16px;
  box-shadow: 0 3px 0 $leaf-dark;
}

footer {
  text-align: center;
  color: $white;
  font-weight: 800;
  text-shadow: 0 2px 0 $grass-dark;
  margin-top: 10px;
}
</style>
