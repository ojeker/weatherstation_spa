<script setup lang="ts">
import { computed } from "vue";
import WindArrow from "./WindArrow.vue";

const props = defineProps<{
  temperature: string;
  sunshine: string;
  precipitation: string;
  windSpeedKmh: number | null;
  windDirectionDeg: number | null;
}>();

const hasWindData = computed(
  () => props.windSpeedKmh !== null && props.windDirectionDeg !== null
);
</script>

<template>
  <section class="current-reading">
    <div class="temperature">{{ temperature }}</div>
    <div class="details-row">
      <!-- Left side: wind indicator -->
      <div v-if="hasWindData" class="wind-indicator">
        <WindArrow :direction-deg="windDirectionDeg!" :speed-kmh="windSpeedKmh!" />
      </div>

      <!-- Right side: sunshine and precipitation stacked vertically -->
      <div class="weather-details">
        <span class="detail">
          <span class="icon icon-sun">☀</span>
          <span class="value">{{ sunshine }}</span>
        </span>
        <span class="detail">
          <span class="icon icon-rain">💧</span>
          <span class="value">{{ precipitation }}</span>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.current-reading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
}

.temperature {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
  color: #222;
}

.details-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  margin-top: 0.75rem;
}

.weather-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: #555;
}

.detail {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.icon {
  font-size: 1rem;
}

.icon-sun {
  color: #f1c40f;
}

.value {
  font-variant-numeric: tabular-nums;
}

.wind-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 1.5rem;
  border-right: 1px solid #eee;
}
</style>
