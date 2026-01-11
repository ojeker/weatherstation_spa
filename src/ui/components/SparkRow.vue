<script setup lang="ts">
defineProps<{
  label: string;
  bars: string;
  summary: string;
}>();
</script>

<template>
  <div class="spark-row">
    <span class="label">{{ label }}</span>
    <span class="bars">{{ bars }}</span>
    <span class="summary">{{ summary }}</span>
  </div>
</template>

<style scoped>
.spark-row {
  display: grid;
  grid-template-columns: 3rem 1fr auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.95rem;
}

.label {
  color: #666;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.bars {
  font-family: monospace;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
  color: #4a90d9;
}

.summary {
  color: #888;
  font-size: 0.85rem;
  text-align: right;
  white-space: nowrap;
}
</style>
