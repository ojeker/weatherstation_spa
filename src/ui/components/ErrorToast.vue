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
  <div class="toast-overlay" role="alert" aria-live="assertive">
    <div class="toast">
      <div class="toast-message">{{ message }}</div>
      <div class="toast-actions">
        <button class="retry-button" type="button" @click="$emit('retry')">
          Try again
        </button>
        <button class="choose-button" type="button" @click="$emit('choose-station')">
          Choose station
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.toast-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding: 1rem;
  pointer-events: none;
  z-index: 30;
}

.toast {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  background: #111827;
  color: #f9fafb;
  padding: 0.9rem 1.1rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.2);
  max-width: 360px;
  width: 100%;
}

.toast-message {
  font-size: 0.9rem;
  line-height: 1.4;
}

.toast-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.retry-button {
  padding: 0.45rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-button:hover {
  background: #2563eb;
}

.retry-button:active {
  background: #1d4ed8;
}

.choose-button {
  padding: 0.45rem 0.9rem;
  background: #e2e8f0;
  color: #0f172a;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}

.choose-button:hover {
  background: #cbd5f5;
}

.choose-button:active {
  background: #b4c6ee;
}
@media (min-width: 720px) {
  .toast {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    max-width: 520px;
  }
}
</style>
