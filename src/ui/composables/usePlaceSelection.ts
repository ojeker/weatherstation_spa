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
  const selectedPlace = ref<Place | null>(null);

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
    stationsState.value = { status: "idle" };
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
  };
}
