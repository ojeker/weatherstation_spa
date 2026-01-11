<script setup lang="ts">
defineProps<{
  stationAbbr: string;
  timestamp: string | null;
}>();
</script>

<template>
  <header class="station-header">
    <span class="station">{{ stationAbbr }}</span>
    <span v-if="timestamp" class="separator">•</span>
    <span v-if="timestamp" class="time">{{ timestamp }}</span>
  </header>
</template>

<style scoped>
.station-header {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #666;
}

.station {
  font-weight: 600;
  color: #333;
}

.separator {
  color: #ccc;
}

.time {
  font-variant-numeric: tabular-nums;
}
</style>
