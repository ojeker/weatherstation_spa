<script setup lang="ts">
defineProps<{
  temperature: string;
  sunshine: string;
  precipitation: string;
}>();
</script>

<template>
  <section class="current-reading">
    <div class="temperature">{{ temperature }}</div>
    <div class="details">
      <span class="detail">
        <span class="icon">☀</span>
        <span class="value">{{ sunshine }}</span>
      </span>
      <span class="detail">
        <span class="icon">💧</span>
        <span class="value">{{ precipitation }}</span>
      </span>
    </div>
  </section>
</template>

<style scoped>
.current-reading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
}

.temperature {
  font-size: 4rem;
  font-weight: 300;
  line-height: 1;
  color: #222;
}

.details {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.75rem;
  font-size: 1.1rem;
  color: #555;
}

.detail {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.icon {
  font-size: 1rem;
}

.value {
  font-variant-numeric: tabular-nums;
}
</style>
