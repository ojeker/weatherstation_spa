<script setup lang="ts">
defineProps<{
  stationName: string;
}>();
</script>

<template>
  <div class="empty-state">
    <div class="icon">📭</div>
    <p class="message">
      No data available for today for station {{ stationName }}.
    </p>
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
</style>
