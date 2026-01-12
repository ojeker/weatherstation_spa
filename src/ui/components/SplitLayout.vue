<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

const props = withDefaults(
  defineProps<{
    initialRatio?: number;
    minRatio?: number;
    maxRatio?: number;
  }>(),
  {
    initialRatio: 0.45,
    minRatio: 0.25,
    maxRatio: 0.75,
  }
);

const containerRef = ref<HTMLElement | null>(null);
const ratio = ref(props.initialRatio);
const dragging = ref(false);
const isLandscape = ref(false);

function clampRatio(value: number) {
  return Math.min(props.maxRatio, Math.max(props.minRatio, value));
}

function updateOrientation() {
  isLandscape.value = window.matchMedia("(orientation: landscape)").matches;
}

function startDrag(event: PointerEvent) {
  if (!containerRef.value) return;
  dragging.value = true;
  (event.target as HTMLElement).setPointerCapture(event.pointerId);
}

function stopDrag(event: PointerEvent) {
  if (!dragging.value) return;
  dragging.value = false;
  try {
    (event.target as HTMLElement).releasePointerCapture(event.pointerId);
  } catch {
    // No-op if capture was not set.
  }
}

function onDrag(event: PointerEvent) {
  if (!dragging.value || !containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();

  if (isLandscape.value) {
    const position = (event.clientX - rect.left) / rect.width;
    ratio.value = clampRatio(position);
  } else {
    const position = (event.clientY - rect.top) / rect.height;
    ratio.value = clampRatio(position);
  }
}

function onKeydown(event: KeyboardEvent) {
  const step = 0.05;
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    ratio.value = clampRatio(ratio.value - step);
    event.preventDefault();
  }
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    ratio.value = clampRatio(ratio.value + step);
    event.preventDefault();
  }
}

const layoutClass = computed(() =>
  isLandscape.value ? "split-layout landscape" : "split-layout portrait"
);

const layoutStyle = computed(() => ({
  "--split-ratio": ratio.value.toString(),
}));

onMounted(() => {
  updateOrientation();
  window.addEventListener("resize", updateOrientation);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateOrientation);
});
</script>

<template>
  <section ref="containerRef" :class="layoutClass" :style="layoutStyle">
    <div class="pane primary">
      <slot name="primary" />
    </div>

    <div
      class="divider"
      role="separator"
      :aria-orientation="isLandscape ? 'vertical' : 'horizontal'"
      :aria-valuenow="Math.round(ratio * 100)"
      tabindex="0"
      @pointerdown="startDrag"
      @pointermove="onDrag"
      @pointerup="stopDrag"
      @pointercancel="stopDrag"
      @keydown="onKeydown"
    >
      <span class="grip" aria-hidden="true"></span>
    </div>

    <div class="pane secondary">
      <slot name="secondary" />
    </div>
  </section>
</template>

<style scoped>
.split-layout {
  display: grid;
  width: 100%;
  min-height: 360px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
}

.split-layout.portrait {
  grid-template-rows: calc(var(--split-ratio) * 100%) 12px auto;
}

.split-layout.landscape {
  grid-template-columns: calc(var(--split-ratio) * 100%) 12px auto;
}

.pane {
  padding: 1rem 1.25rem;
  overflow: auto;
}

.divider {
  background: #e2e8f0;
  position: relative;
  cursor: row-resize;
}

.split-layout.landscape .divider {
  cursor: col-resize;
}

.grip {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 42px;
  height: 4px;
  border-radius: 999px;
  background: #94a3b8;
}

.split-layout.landscape .grip {
  width: 4px;
  height: 42px;
}

.divider:focus-visible {
  outline: 2px solid #0f172a;
  outline-offset: -2px;
}
</style>
