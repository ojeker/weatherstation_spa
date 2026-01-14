<script setup lang="ts">
defineProps<{
  stationName: string;
}>();

defineEmits<{
  "choose-station": [];
}>();
</script>

<template>
  <div class="empty-state">
    <div class="icon">📭</div>
    <p class="message">
      No data available for today for station {{ stationName }}.
    </p>
    <button class="choose-button" type="button" @click="$emit('choose-station')">
      Choose station
    </button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  gap: 0.75rem;
  text-align: center;
}

.icon {
  font-size: 2.5rem;
}

.message {
  color: #666;
  font-size: 0.95rem;
}

.choose-button {
  margin-top: 0.25rem;
  padding: 0.6rem 1.2rem;
  background: #e2e8f0;
  color: #0f172a;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.choose-button:hover {
  background: #cbd5f5;
}

.choose-button:active {
  background: #b4c6ee;
}
</style>
