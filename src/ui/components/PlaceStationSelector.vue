<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  ref,
  watch,
  type ComponentPublicInstance,
} from "vue";
import { usePlaceSelection } from "@/ui/composables";
import { formatDistanceKm } from "@/ui/utils";
import LoadingSpinner from "@/ui/components/LoadingSpinner.vue";
import ErrorState from "@/ui/components/ErrorState.vue";
import SplitLayout from "@/ui/components/SplitLayout.vue";

import type { StationMeta } from "@/domain";

const emit = defineEmits<{
  "station-selected": [station: StationMeta];
}>();

const {
  query,
  normalizedQuery,
  filteredPlaces,
  placesState,
  stationsState,
  selectedPlace,
  loadPlaces,
  selectPlace,
  clearSelection,
} = usePlaceSelection();

const activeIndex = ref(-1);
const optionRefs = ref<Element[]>([]);

onMounted(() => {
  loadPlaces();
});

const hasQuery = computed(() => normalizedQuery.value.length > 0);

const placeStatusMessage = computed(() => {
  if (placesState.value.status === "loading") return "Loading places...";
  if (placesState.value.status === "error") return "Failed to load places.";
  if (!hasQuery.value) return "Type a place name or PLZ to search.";
  if (filteredPlaces.value.length === 0) return "No matches.";
  return null;
});

function setOptionRef(
  el: Element | ComponentPublicInstance | null,
  index: number
) {
  if (!el) return;
  const element = el instanceof Element ? el : (el.$el as Element | null);
  if (element) {
    optionRefs.value[index] = element;
  }
}

function updateActiveIndex(nextIndex: number) {
  if (filteredPlaces.value.length === 0) {
    activeIndex.value = -1;
    return;
  }

  const clamped = Math.max(0, Math.min(filteredPlaces.value.length - 1, nextIndex));
  activeIndex.value = clamped;

  nextTick(() => {
    const el = optionRefs.value[clamped];
    if (el) {
      el.scrollIntoView({ block: "nearest" });
    }
  });
}

function onInputKeydown(event: KeyboardEvent) {
  if (filteredPlaces.value.length === 0) return;

  if (event.key === "ArrowDown") {
    updateActiveIndex(activeIndex.value + 1);
    event.preventDefault();
  } else if (event.key === "ArrowUp") {
    updateActiveIndex(activeIndex.value - 1);
    event.preventDefault();
  } else if (event.key === "Enter") {
    const selected = filteredPlaces.value[activeIndex.value];
    if (selected) {
      selectPlace(selected);
    }
  } else if (event.key === "Escape") {
    if (query.value) {
      query.value = "";
    } else if (selectedPlace.value) {
      clearSelection();
    }
    activeIndex.value = -1;
  }
}

watch(filteredPlaces, (places) => {
  optionRefs.value = [];
  if (places.length === 0) {
    activeIndex.value = -1;
    return;
  }
  if (activeIndex.value === -1) {
    activeIndex.value = 0;
  } else if (activeIndex.value >= places.length) {
    activeIndex.value = places.length - 1;
  }
});
</script>

<template>
  <SplitLayout class="selector">
    <template #primary>
      <div class="panel-header">
        <div>
          <p class="eyebrow">Place selection</p>
          <h2>Choose a place</h2>
        </div>
        <button
          v-if="selectedPlace"
          class="clear-button"
          type="button"
          @click="clearSelection"
        >
          Change
        </button>
      </div>

      <label class="search-field">
        <span class="sr-only">Place name or PLZ</span>
        <input
          v-model="query"
          class="search-input"
          type="text"
          inputmode="search"
          placeholder="Place name or PLZ"
          autocomplete="off"
          :aria-activedescendant="
            activeIndex >= 0 ? `place-option-${activeIndex}` : undefined
          "
          aria-controls="place-results"
          @keydown="onInputKeydown"
        />
      </label>

      <div v-if="selectedPlace" class="selected-chip">
        <span>{{ selectedPlace.plz }} {{ selectedPlace.placeName }}</span>
      </div>

      <div id="place-results" class="results" role="listbox">
        <LoadingSpinner v-if="placesState.status === 'loading'" />
        <ErrorState
          v-else-if="placesState.status === 'error'"
          :message="placeStatusMessage ?? 'Failed to load places.'"
          @retry="loadPlaces"
        />
        <p v-else-if="placeStatusMessage" class="hint">
          {{ placeStatusMessage }}
        </p>
        <button
          v-for="(place, index) in filteredPlaces"
          :key="`${place.plz}-${place.placeName}-${place.e}-${place.n}`"
          :id="`place-option-${index}`"
          :ref="(el) => setOptionRef(el, index)"
          class="result-item"
          type="button"
          role="option"
          :aria-selected="index === activeIndex"
          :class="{ active: index === activeIndex }"
          @click="selectPlace(place)"
          @mousemove="updateActiveIndex(index)"
        >
          <span class="result-text bold">{{ place.plz }}</span>
          <span class="result-text">{{ place.placeName }}</span>
        </button>
      </div>
    </template>

    <template #secondary>
      <div class="panel-header">
        <div>
          <p class="eyebrow">Nearest stations</p>
          <h2>Closest 10 stations</h2>
        </div>
      </div>

      <LoadingSpinner v-if="stationsState.status === 'loading'" />
      <ErrorState
        v-else-if="stationsState.status === 'error'"
        message="Failed to load stations."
        @retry="selectedPlace && selectPlace(selectedPlace)"
      />
      <p v-else-if="stationsState.status === 'idle'" class="hint">
        Select a place to see the nearest stations.
      </p>

      <div v-else class="results" role="listbox">
        <button
          v-for="entry in stationsState.data"
          :key="`${entry.station.name}-${entry.station.e}-${entry.station.n}`"
          class="result-item station-row"
          type="button"
          role="option"
          @click="emit('station-selected', entry.station)"
        >
          <div class="station-info">
            <span class="result-text bold">{{ entry.station.name }}</span>
            <span class="result-text">{{ Math.round(entry.station.heightM) }} m</span>
          </div>
          <span class="result-text bold">{{ formatDistanceKm(entry.distanceKm) }}</span>
        </button>
      </div>
    </template>
  </SplitLayout>
</template>

<style scoped>
.selector {
  margin: 1rem 0 1.5rem;
  --ui-font-body: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  --ui-font-display: "Georgia", "Times New Roman", serif;
  font-family: var(--ui-font-body);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.7rem;
  color: #64748b;
}

h2 {
  font-size: 1.1rem;
  color: #0f172a;
  margin-top: 0.2rem;
  font-family: var(--ui-font-display);
}

.search-field {
  display: block;
  margin-bottom: 0.75rem;
}

.search-input {
  width: 100%;
  border: 1px solid #cbd5f5;
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  font-size: 1rem;
  background: #fff;
}

.search-input:focus {
  outline: 2px solid #0f172a;
  outline-offset: 2px;
}

.selected-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.7rem;
  background: #0f172a;
  color: #f8fafc;
  border-radius: 999px;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
}

.clear-button {
  border: none;
  background: #e2e8f0;
  color: #0f172a;
  border-radius: 999px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-size: 0.85rem;
}

.results {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 320px;
  overflow: auto;
}

.result-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.6rem;
  align-items: center;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  text-align: left;
  font-size: 0.95rem;
}

.result-item:hover {
  border-color: #0f172a;
}

.result-item.active {
  border-color: #0f172a;
  background: #f1f5f9;
}

.result-text {
  color: #334155;
  font-weight: 400;
}

.result-text.bold {
  font-weight: 600;
  color: #0f172a;
}

.hint {
  color: #64748b;
  font-size: 0.9rem;
}

.station-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.6rem;
  align-items: center;
}

.station-info {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
}


.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
