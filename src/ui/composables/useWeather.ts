import { ref, shallowReadonly } from "vue";
import type { TodayWeather } from "@/domain";
import { DomainError } from "@/domain";
import { loadTodayWeatherUseCase, stationProvider } from "../di";

export type WeatherState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: Error }
  | { status: "success"; data: TodayWeather };

export function useWeather() {
  const state = ref<WeatherState>({ status: "idle" });
  const station = stationProvider.getStation();

  async function load() {
    state.value = { status: "loading" };

    try {
      const data = await loadTodayWeatherUseCase.execute();
      state.value = { status: "success", data };
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Unknown error occurred");
      state.value = { status: "error", error };
    }
  }

  function getErrorMessage(error: Error): string {
    if (error instanceof DomainError) {
      return error.message;
    }
    return "Failed to load weather data. Please try again.";
  }

  return {
    state: shallowReadonly(state),
    station,
    load,
    getErrorMessage,
  };
}
