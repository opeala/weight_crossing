<template>
  <section class="card">
    <h2>
      <span class="icon" :style="{ background: color }" aria-hidden="true">{{ icon }}</span>
      {{ title }}
      <span v-if="$slots.hint" class="hint"><slot name="hint" /></span>
    </h2>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; icon: string; color: string }>();
</script>

<style scoped lang="scss">
.card {
  @include card;
  margin-bottom: 20px;
}

h2 {
  font-family: $font-display;
  font-weight: 800;
  font-size: 22px;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: $white;
  font-size: 16px;
}

.hint {
  margin-left: auto;
  font-family: $font-body;
  font-weight: 600;
  font-size: 13px;
  color: $brown-soft;
}
</style>
