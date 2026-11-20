<template>
  <section class="dialogue" aria-live="polite">
    <svg class="critter" viewBox="0 0 100 100" aria-hidden="true" :class="{ hop: hopping }">
      <ellipse cx="50" cy="92" rx="30" ry="5" fill="#000" opacity=".12" />
      <ellipse cx="50" cy="64" rx="34" ry="28" fill="#8fd16a" />
      <circle cx="32" cy="36" r="14" fill="#8fd16a" />
      <circle cx="68" cy="36" r="14" fill="#8fd16a" />
      <circle cx="32" cy="35" r="9" fill="#fff" />
      <circle cx="68" cy="35" r="9" fill="#fff" />
      <circle cx="34" cy="36" r="4.5" fill="#4a3a2a" />
      <circle cx="66" cy="36" r="4.5" fill="#4a3a2a" />
      <circle cx="35.5" cy="34.5" r="1.5" fill="#fff" />
      <circle cx="67.5" cy="34.5" r="1.5" fill="#fff" />
      <ellipse cx="28" cy="60" rx="6" ry="4" fill="#f79fb3" opacity=".8" />
      <ellipse cx="72" cy="60" rx="6" ry="4" fill="#f79fb3" opacity=".8" />
      <path d="M40 60 Q50 70 60 60" stroke="#4a3a2a" stroke-width="3" fill="none" stroke-linecap="round" />
      <ellipse cx="50" cy="78" rx="18" ry="10" fill="#c9eeb0" />
      <path d="M48 14 q6 -10 14 -6 q-4 8 -14 6z" fill="#3fb56a" />
    </svg>
    <div class="bubble" @click="finish">
      <span class="name-tag">Pip</span>
      <span>{{ shown }}</span>
      <span class="next" aria-hidden="true">▼</span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps<{ message: string }>();

const shown = ref('');
const hopping = ref(false);
let timer: ReturnType<typeof setInterval> | undefined;

function type(text: string) {
  clearInterval(timer);
  shown.value = '';
  hopping.value = false;
  requestAnimationFrame(() => (hopping.value = true));
  let i = 0;
  timer = setInterval(() => {
    shown.value = text.slice(0, ++i);
    if (i >= text.length) clearInterval(timer);
  }, 22);
}

/** Tapping the bubble skips the typewriter animation. */
function finish() {
  clearInterval(timer);
  shown.value = props.message;
}

watch(() => props.message, type, { immediate: true });
onBeforeUnmount(() => clearInterval(timer));
</script>

<style scoped lang="scss">
.dialogue {
  display: flex;
  gap: 14px;
  align-items: flex-end;
  margin: 18px 0 22px;
}

.critter {
  width: 92px;
  flex: none;

  &.hop {
    animation: hop 0.5s ease-out;
  }

  @include small-screen {
    width: 66px;
  }
}

@keyframes hop {
  30% {
    transform: translateY(-12px);
  }
  60% {
    transform: translateY(0);
  }
}

.bubble {
  flex: 1;
  position: relative;
  background: $cream;
  border-radius: 40px / 32px;
  padding: 26px 26px 20px;
  box-shadow: $shadow-card;
  font-size: 18px;
  line-height: 1.5;
  min-height: 92px;

  &::after {
    content: '';
    position: absolute;
    left: -12px;
    bottom: 22px;
    border: 12px solid transparent;
    border-right-color: $cream;
    border-left: 0;
  }

  @include small-screen {
    font-size: 16px;
    padding: 24px 18px 18px;
  }
}

.name-tag {
  position: absolute;
  top: -14px;
  left: 26px;
  background: $orange;
  color: $white;
  font-family: $font-display;
  font-weight: 800;
  padding: 2px 16px;
  border-radius: $radius-pill;
  transform: rotate(-4deg);
  box-shadow: 0 3px 0 $orange-dark;
}

.next {
  position: absolute;
  right: 22px;
  bottom: 8px;
  color: $orange;
  font-size: 14px;
  animation: bob 1s ease-in-out infinite;
}

@keyframes bob {
  50% {
    transform: translateY(3px);
  }
}
</style>
