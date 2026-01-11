<script setup lang="ts">
import { onMounted, computed } from "vue";
import type { Reading } from "@/domain";
import { useWeather } from "../composables";
import {
  formatTemperature,
  formatSunshinePercent,
  formatPrecipitation,
  formatTime,
  getLastNReadings,
} from "../utils";
import StationHeader from "../components/StationHeader.vue";
import CurrentReading from "../components/CurrentReading.vue";
import HourlyChart from "../components/HourlyChart.vue";
import LoadingSpinner from "../components/LoadingSpinner.vue";
import ErrorState from "../components/ErrorState.vue";
import EmptyState from "../components/EmptyState.vue";

const SPARK_BAR_COUNT = 8;

const { state, station, load, getErrorMessage } = useWeather();

onMounted(() => {
  load();
});

const currentTimestamp = computed(() => {
  if (state.value.status !== "success" || !state.value.data.current) {
    return null;
  }
  return formatTime(state.value.data.current.timestamp.toDate());
});

const currentTemp = computed(() => {
  if (state.value.status !== "success" || !state.value.data.current) {
    return "—";
  }
  return formatTemperature(state.value.data.current.temperatureC);
});

const currentSunshine = computed(() => {
  if (state.value.status !== "success" || !state.value.data.current) {
    return "—";
  }
  return formatSunshinePercent(
    state.value.data.current.sunshineMinutes,
    state.value.data.current.kind
  );
});

const currentPrecip = computed(() => {
  if (state.value.status !== "success" || !state.value.data.current) {
    return "—";
  }
  return formatPrecipitation(state.value.data.current.precipitationMm);
});

const hourlyReadings = computed(() => {
  if (state.value.status !== "success") {
    return [] as Reading[];
  }
  return getLastNReadings(state.value.data.hourly as Reading[], SPARK_BAR_COUNT);
});

const isEmpty = computed(() => {
  if (state.value.status !== "success") return false;
  return !state.value.data.current && state.value.data.hourly.length === 0;
});
</script>

<template>
  <main class="dashboard">
    <LoadingSpinner v-if="state.status === 'loading'" />

    <ErrorState
      v-else-if="state.status === 'error'"
      :message="getErrorMessage(state.error)"
      @retry="load"
    />

    <template v-else-if="state.status === 'success'">
      <EmptyState v-if="isEmpty" :station-abbr="station.abbreviation" />

      <template v-else>
        <StationHeader
          :station-abbr="station.abbreviation"
          :timestamp="currentTimestamp"
        />

        <div class="content">
          <CurrentReading
            :temperature="currentTemp"
            :sunshine="currentSunshine"
            :precipitation="currentPrecip"
          />

          <HourlyChart
            v-if="hourlyReadings.length > 0"
            :readings="hourlyReadings"
          />
        </div>
      </template>
    </template>
  </main>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  min-height: 100dvh;
  background: #fafafa;
}

.content {
  display: flex;
  flex-direction: column;
}

@media (orientation: landscape) and (min-width: 560px) {
  .content {
    flex-direction: row;
    align-items: stretch;
  }

  .content > :first-child {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-right: 1px solid #eee;
  }

  .content > :last-child {
    flex: 1;
    border-top: none;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
