<script setup lang="ts">
import Dashboard from "./ui/pages/Dashboard.vue";
</script>

<template>
  <Dashboard />
  <footer class="app-footer">
    Datasources: MeteoSwiss, ©swisstopo
  </footer>
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background: #fafafa;
}

.app-footer {
  margin-top: 0.8rem;
  padding: 0.4rem;
  text-align: center;
  font-size: 0.8rem;
  color: #888;
  border-top: 1px solid #e5e7eb;
}
</style>
