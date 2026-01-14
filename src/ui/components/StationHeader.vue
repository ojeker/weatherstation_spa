<script setup lang="ts">
defineProps<{
  stationName: string;
  timestamp: string | null;
  loading?: boolean;
}>();

defineEmits<{
  change: [];
  refresh: [];
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
      <button
        class="refresh-button"
        type="button"
        :disabled="loading"
        @click="$emit('refresh')"
        title="Refresh data"
      >
        <svg
          :class="{ spinning: loading }"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
      </button>
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

.refresh-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: #e2e8f0;
  color: #0f172a;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 999px;
  margin-left: 0.25rem;
}

.refresh-button:hover:not(:disabled) {
  background: #cbd5f5;
}

.refresh-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.refresh-button svg.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
