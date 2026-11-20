import { computed, reactive, watch } from 'vue';
import { Preferences } from '@capacitor/preferences';
import type { Unit } from '@/utils/units';

export interface WeighIn {
  /** YYYY-MM-DD; one weigh-in per day. */
  date: string;
  kg: number;
  note?: string;
}

interface WeightState {
  entries: WeighIn[];
  goal: number | null;
  unit: Unit;
}

const STORAGE_KEY = 'weight-crossing';
/** Key used by the original single-file web version, migrated on first launch. */
const LEGACY_KEY = 'weight-crossing-v1';

const state = reactive<WeightState>({ entries: [], goal: null, unit: 'kg' });
let loaded: Promise<void> | null = null;

function isValid(data: unknown): data is Partial<WeightState> & { entries: WeighIn[] } {
  return !!data && Array.isArray((data as WeightState).entries);
}

async function load() {
  try {
    let raw = (await Preferences.get({ key: STORAGE_KEY })).value;
    if (!raw) {
      try {
        raw = localStorage.getItem(LEGACY_KEY);
      } catch {
        raw = null;
      }
    }
    const data = raw ? JSON.parse(raw) : null;
    if (isValid(data)) {
      state.entries = data.entries.filter((e) => e && typeof e.date === 'string' && e.kg > 0);
      state.goal = typeof data.goal === 'number' ? data.goal : null;
      if (data.unit === 'kg' || data.unit === 'lb' || data.unit === 'st') state.unit = data.unit;
    }
  } catch (e) {
    console.warn('Could not load saved weigh-ins', e);
  }

  watch(
    state,
    () => {
      Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(state) }).catch((e) =>
        console.warn('Could not save weigh-ins', e),
      );
    },
    { deep: true },
  );
}

export function useWeights() {
  if (!loaded) loaded = load();

  const sorted = computed(() => [...state.entries].sort((a, b) => a.date.localeCompare(b.date)));
  const first = computed(() => sorted.value[0]);
  const latest = computed(() => sorted.value[sorted.value.length - 1]);

  /** Adds or replaces the weigh-in for a date. Returns the previous weigh-in before that date. */
  function logWeight(date: string, kg: number, note?: string): WeighIn | undefined {
    const before = sorted.value.filter((e) => e.date < date);
    const existing = state.entries.find((e) => e.date === date);
    const cleanNote = note?.trim() || existing?.note;
    state.entries = state.entries.filter((e) => e.date !== date);
    state.entries.push({ date, kg, ...(cleanNote ? { note: cleanNote } : {}) });
    return before[before.length - 1];
  }

  function setNote(date: string, note: string) {
    const entry = state.entries.find((e) => e.date === date);
    if (!entry) return;
    const clean = note.trim();
    if (clean) entry.note = clean;
    else delete entry.note;
  }

  function removeEntry(date: string) {
    state.entries = state.entries.filter((e) => e.date !== date);
  }

  function setGoal(kg: number | null) {
    state.goal = kg;
  }

  function setUnit(unit: Unit) {
    state.unit = unit;
  }

  return {
    state,
    ready: loaded,
    sorted,
    first,
    latest,
    logWeight,
    setNote,
    removeEntry,
    setGoal,
    setUnit,
  };
}
