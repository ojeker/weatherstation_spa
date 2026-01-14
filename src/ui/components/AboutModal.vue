<script setup lang="ts">
import { computed } from "vue";
import { marked } from "marked";
import aboutContent from "@/assets/about.md?raw";

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const htmlContent = computed(() => marked(aboutContent));

function onBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit("close");
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    emit("close");
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-title"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <div class="modal-content">
          <button
            class="close-button"
            type="button"
            aria-label="Close"
            @click="emit('close')"
          >
            &times;
          </button>
          <div class="markdown-body" v-html="htmlContent"></div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  position: relative;
  background: #fff;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.close-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.markdown-body {
  color: #334155;
  line-height: 1.6;
}

.markdown-body :deep(h1) {
  font-size: 1.5rem;
  color: #0f172a;
  margin-bottom: 0.5rem;
  padding-right: 2rem;
}

.markdown-body :deep(h2) {
  font-size: 1.1rem;
  color: #0f172a;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.25rem;
}

.markdown-body :deep(h3) {
  font-size: 1rem;
  color: #0f172a;
  margin-top: 1rem;
  margin-bottom: 0.25rem;
}

.markdown-body :deep(p) {
  margin-bottom: 0.75rem;
}

.markdown-body :deep(a) {
  color: #4a90d9;
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(ul) {
  margin-left: 1.25rem;
  margin-bottom: 0.75rem;
}

.markdown-body :deep(li) {
  margin-bottom: 0.25rem;
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
