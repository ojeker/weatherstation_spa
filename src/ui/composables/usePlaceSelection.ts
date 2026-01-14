import { computed, ref, shallowReadonly } from "vue";
import type { Place, StationDistance } from "@/domain";
import {
  filterPlaces,
  normalizeQuery,
} from "@/ui/utils";
import {
  findNearestStationsUseCase,
  loadPlacesUseCase,
} from "@/ui/di";

const PLACE_STORAGE_KEY = "weatherstation_selectedPlace";

function savePlace(place: Place | null): void {
  if (place) {
    localStorage.setItem(PLACE_STORAGE_KEY, JSON.stringify(place));
  } else {
    localStorage.removeItem(PLACE_STORAGE_KEY);
  }
}

function loadSavedPlace(): Place | null {
  const saved = localStorage.getItem(PLACE_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved) as Place;
    } catch {
      return null;
    }
  }
  return null;
}

export type PlacesState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: Place[] };

export type StationsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: StationDistance[] };

export function usePlaceSelection() {
  const query = ref("");
  const placesState = ref<PlacesState>({ status: "idle" });
  const stationsState = ref<StationsState>({ status: "idle" });
  const savedPlace = loadSavedPlace();
  const selectedPlace = ref<Place | null>(savedPlace);

  const normalizedQuery = computed(() => normalizeQuery(query.value));

  const filteredPlaces = computed(() => {
    if (placesState.value.status !== "success") return [];
    return filterPlaces(placesState.value.data, normalizedQuery.value);
  });

  async function loadPlaces() {
    if (placesState.value.status === "loading") return;
    if (placesState.value.status === "success") return;

    placesState.value = { status: "loading" };
    try {
      const data = await loadPlacesUseCase.execute();
      placesState.value = { status: "success", data };
    } catch (error) {
      placesState.value = {
        status: "error",
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  }

  async function selectPlace(place: Place) {
    selectedPlace.value = place;
    savePlace(place);
    stationsState.value = { status: "loading" };

    try {
      const data = await findNearestStationsUseCase.execute(place);
      stationsState.value = { status: "success", data };
    } catch (error) {
      stationsState.value = {
        status: "error",
        error: error instanceof Error ? error : new Error("Unknown error"),
      };
    }
  }

  function clearSelection() {
    selectedPlace.value = null;
    savePlace(null);
    stationsState.value = { status: "idle" };
  }

  async function restoreSavedSelection() {
    if (savedPlace) {
      await selectPlace(savedPlace);
    }
  }

  return {
    query,
    normalizedQuery,
    filteredPlaces,
    placesState: shallowReadonly(placesState),
    stationsState: shallowReadonly(stationsState),
    selectedPlace,
    loadPlaces,
    selectPlace,
    clearSelection,
    restoreSavedSelection,
  };
}
