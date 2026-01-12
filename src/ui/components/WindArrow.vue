<script setup lang="ts">
import { computed } from "vue";
import { getWindSpeedColor, formatWindSpeed } from "../utils";

const props = defineProps<{
  directionDeg: number;
  speedKmh: number;
}>();

const arrowColor = computed(() => getWindSpeedColor(props.speedKmh));

const rotationStyle = computed(() => ({
  transform: `rotate(${props.directionDeg}deg)`,
}));

const speedLabel = computed(() => formatWindSpeed(props.speedKmh));
</script>

<template>
  <div class="wind-arrow" :title="`${speedLabel}`">
    <svg
      class="arrow-svg"
      :style="rotationStyle"
      viewBox="0 0 48 48"
      width="48"
      height="48"
      aria-label="Wind direction arrow"
    >
      <!-- Compass circle -->
      <circle cx="24" cy="24" r="22" fill="none" stroke="#e5e7eb" stroke-width="1" />
      <!-- Cardinal direction markers -->
      <line x1="24" y1="4" x2="24" y2="8" stroke="#ccc" stroke-width="1" />
      <line x1="44" y1="24" x2="40" y2="24" stroke="#ccc" stroke-width="1" />
      <line x1="24" y1="44" x2="24" y2="40" stroke="#ccc" stroke-width="1" />
      <line x1="4" y1="24" x2="8" y2="24" stroke="#ccc" stroke-width="1" />
      <!-- Arrow pointing up (north) at 0 degrees -->
      <path d="M24 8L20 22h3v12h2V22h3L24 8z" :fill="arrowColor" />
    </svg>
    <span class="wind-speed">{{ speedLabel }}</span>
  </div>
</template>

<style scoped>
.wind-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.arrow-svg {
  transition: transform 0.3s ease;
}

.wind-speed {
  font-size: 0.9rem;
  color: #555;
  font-variant-numeric: tabular-nums;
}
</style>
