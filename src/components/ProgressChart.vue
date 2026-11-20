<template>
  <CozyCard title="Progress path" icon="〜" color="#5cb8e6">
    <div ref="box" class="chart-box">
    <div v-if="!chart" class="empty">🌱 Log at least two weigh-ins and your path will sprout here!</div>
    <svg v-else class="chart" :viewBox="`0 0 ${W} ${H}`" role="img" aria-label="Weight over time">
      <defs>
        <linearGradient id="pathFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3fb56a" stop-opacity=".28" />
          <stop offset="1" stop-color="#3fb56a" stop-opacity="0" />
        </linearGradient>
      </defs>

      <g v-for="g in chart.grid" :key="g.y">
        <line :x1="pad.l" :x2="W - pad.r" :y1="g.y" :y2="g.y" stroke="#efe3bb" stroke-width="2" stroke-dasharray="4 6" />
        <text :x="pad.l - 8" :y="g.y + 4" text-anchor="end" class="axis">{{ g.label }}</text>
      </g>

      <template v-if="chart.goalY != null">
        <line
          :x1="pad.l"
          :x2="W - pad.r"
          :y1="chart.goalY"
          :y2="chart.goalY"
          stroke="#f5a742"
          stroke-width="3"
          stroke-dasharray="10 8"
          stroke-linecap="round"
        />
        <text :x="W - pad.r" :y="chart.goalY - 6" text-anchor="end" class="goal">goal</text>
      </template>

      <path :d="chart.area" fill="url(#pathFill)" />
      <path :d="chart.line" fill="none" stroke="#3fb56a" stroke-width="4" stroke-linecap="round" />

      <g v-for="(p, i) in chart.points" :key="p.date" :transform="`translate(${p.x},${p.y}) rotate(-35)`">
        <path
          d="M0,-9 C7,-6 7,6 0,9 C-7,6 -7,-6 0,-9Z"
          :fill="i === chart.points.length - 1 ? '#f5a742' : '#3fb56a'"
          stroke="#fff"
          stroke-width="2.5"
        />
        <title>{{ p.title }}</title>
      </g>

      <text
        v-for="(t, i) in chart.ticks"
        :key="t.date"
        :x="t.x"
        :y="H - 10"
        :text-anchor="i === 0 ? 'start' : i === chart.ticks.length - 1 ? 'end' : 'middle'"
        class="axis"
      >
        {{ t.label }}
      </text>
    </svg>
    </div>
  </CozyCard>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import CozyCard from './CozyCard.vue';
import { useWeights } from '@/composables/useWeights';
import { axisLabel, formatWeight, toScale } from '@/utils/units';
import { dayValue, prettyDate } from '@/utils/dates';

// The chart is drawn at its real pixel width so text stays readable on phones.
const W = ref(680);
const H = 240;
const box = ref<HTMLElement | null>(null);
let observer: ResizeObserver | undefined;

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    const w = Math.round(entry.contentRect.width);
    if (w > 0) W.value = w;
  });
  if (box.value) observer.observe(box.value);
});
onBeforeUnmount(() => observer?.disconnect());
const pad = { l: 58, r: 16, t: 16, b: 34 };

const { state, sorted } = useWeights();

const chart = computed(() => {
  const list = sorted.value;
  if (list.length < 2) return null;
  const unit = state.unit;
  const vals = list.map((e) => toScale(e.kg, unit));
  const goalV = state.goal != null ? toScale(state.goal, unit) : null;

  let lo = Math.min(...vals, goalV ?? Infinity);
  let hi = Math.max(...vals, goalV ?? -Infinity);
  const span = Math.max(hi - lo, unit === 'st' ? 0.15 : 1);
  lo -= span * 0.15;
  hi += span * 0.15;

  const t0 = dayValue(list[0].date);
  const t1 = dayValue(list[list.length - 1].date);
  const x = (iso: string) => pad.l + ((dayValue(iso) - t0) / Math.max(t1 - t0, 1)) * (W.value - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);

  const grid = Array.from({ length: 5 }, (_, i) => {
    const v = lo + ((hi - lo) * i) / 4;
    return { y: y(v), label: axisLabel(v, unit) };
  });

  const points = list.map((e, i) => ({
    date: e.date,
    x: x(e.date),
    y: y(vals[i]),
    title: `${prettyDate(e.date)}: ${formatWeight(e.kg, unit)}${e.note ? ` — ${e.note}` : ''}`,
  }));

  let line = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const mx = (a.x + b.x) / 2;
    line += ` C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
  }
  const last = points[points.length - 1];
  const area = `${line} L${last.x},${H - pad.b} L${points[0].x},${H - pad.b} Z`;

  const tickEntries = [list[0], list[Math.floor((list.length - 1) / 2)], list[list.length - 1]].filter(
    (e, i, a) => a.indexOf(e) === i,
  );
  const ticks = tickEntries.map((e) => ({
    date: e.date,
    x: x(e.date),
    label: prettyDate(e.date, { month: 'short', day: 'numeric' }),
  }));

  return { grid, points, line, area, ticks, goalY: goalV != null ? y(goalV) : null };
});
</script>

<style scoped lang="scss">
.chart {
  width: 100%;
  height: auto;
  display: block;
}

.axis {
  font-size: 12px;
  fill: $brown-soft;
}

.goal {
  font-size: 12px;
  font-weight: 800;
  fill: $orange;
}

.empty {
  text-align: center;
  color: $brown-soft;
  padding: 26px 0;
}
</style>
