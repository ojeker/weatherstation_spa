<script setup lang="ts">
defineProps<{
  stationName: string;
  timestamp: string | null;
}>();

defineEmits<{
  change: [];
}>();
</script>

<template>
  <header class="station-header">
    <div class="station-meta">
      <span class="station">{{ stationName }}</span>
      <button class="change-button" type="button" @click="$emit('change')">
        Change station
      </button>
    </div>
    <div v-if="timestamp" class="timestamp">
      <span class="timestamp-label">Data timestamp:</span>
      <span class="time">{{ timestamp }}</span>
    </div>
  </header>
</template>

<style scoped>
.station-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  font-size: 0.9rem;
  color: #666;
}

.station {
  font-weight: 600;
  color: #333;
}

.station-meta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.time {
  font-variant-numeric: tabular-nums;
}

.timestamp {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #64748b;
}

.timestamp-label {
  font-size: 0.85rem;
}

.change-button {
  border: none;
  background: #e2e8f0;
  color: #0f172a;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
  font-size: 0.85rem;
}

.change-button:hover {
  background: #cbd5f5;
}
</style>
