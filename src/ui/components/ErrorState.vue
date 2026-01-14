<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<template>
  <div class="error-state">
    <div class="icon">⚠</div>
    <p class="message">{{ message }}</p>
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

</style>
