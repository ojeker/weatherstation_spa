<script setup lang="ts">
import SparkRow from "./SparkRow.vue";
import type { SparkData } from "../utils";

defineProps<{
  temp: SparkData;
  sun: SparkData;
  rain: SparkData;
  hourLabels: string[];
}>();
</script>

<template>
  <section class="hourly-overview">
    <SparkRow label="Temp" :bars="temp.bars" :summary="temp.summary" />
    <SparkRow label="Sun" :bars="sun.bars" :summary="sun.summary" />
    <SparkRow label="Rain" :bars="rain.bars" :summary="rain.summary" />
    <div v-if="hourLabels.length > 0" class="hour-axis">
      <span class="hour-label">{{ hourLabels[0] }}</span>
      <span class="hour-label">{{ hourLabels[Math.floor(hourLabels.length / 2)] }}</span>
      <span class="hour-label">{{ hourLabels[hourLabels.length - 1] }}</span>
    </div>
  </section>
</template>

<style scoped>
.hourly-overview {
  padding: 1rem;
  border-top: 1px solid #eee;
}

.hour-axis {
  display: flex;
  justify-content: space-between;
  margin-top: 0.25rem;
  padding-left: 3.5rem;
  padding-right: 0.25rem;
}

.hour-label {
  font-size: 0.7rem;
  color: #aaa;
  font-variant-numeric: tabular-nums;
}
</style>
