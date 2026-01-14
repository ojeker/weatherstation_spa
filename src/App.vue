<script setup lang="ts">
import { ref } from "vue";
import Dashboard from "./ui/pages/Dashboard.vue";
import AboutModal from "./ui/components/AboutModal.vue";

const aboutOpen = ref(false);
</script>

<template>
  <Dashboard />
  <footer class="app-footer">
    <button class="about-button" type="button" @click="aboutOpen = true">
      About this page
    </button>
    <span class="footer-note">Datasources: MeteoSwiss, ©swisstopo</span>
  </footer>
  <AboutModal :open="aboutOpen" @close="aboutOpen = false" />
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  color: #888;
  border-top: 1px solid #e5e7eb;
}

.footer-note {
  color: #6b7280;
}

.about-button {
  background: #e2e8f0;
  border: none;
  color: #0f172a;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.35rem 0.8rem;
  border-radius: 8px;
  font-weight: 500;
}

.about-button:hover {
  background: #cbd5f5;
}

.about-button:active {
  background: #b4c6ee;
}
</style>
