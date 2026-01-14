<script setup lang="ts">
defineProps<{
  message: string;
}>();

defineEmits<{
  retry: [];
  "choose-station": [];
}>();
</script>

<template>
  <div class="error-state">
    <div class="icon">⚠</div>
    <p class="message">{{ message }}</p>
    <div class="actions">
      <button class="retry-button" @click="$emit('retry')">Try again</button>
      <button class="choose-button" @click="$emit('choose-station')">
        Choose station
      </button>
    </div>
  </div>
</template>

<style scoped>
.error-state {
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
  max-width: 280px;
}

.actions {
  margin-top: 0.5rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.retry-button {
  padding: 0.6rem 1.5rem;
  background: #4a90d9;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #3a7bc8;
}

.retry-button:active {
  background: #2d6cb5;
}

.choose-button {
  padding: 0.6rem 1.2rem;
  background: #e2e8f0;
  color: #0f172a;
  border: none;
  border-radius: 6px;
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
