<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { Station, type Reading, type StationMeta } from "@/domain";
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
import PlaceStationSelector from "../components/PlaceStationSelector.vue";
import { stationProvider, stationMetaRepository } from "../di";

const SPARK_BAR_COUNT = 8;

const { state, load, getErrorMessage } = useWeather();
const selectedStation = ref<StationMeta | null>(null);
const isRefreshing = ref(false);

async function handleRefresh() {
  isRefreshing.value = true;
  await load();
  isRefreshing.value = false;
}

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

const currentWindSpeed = computed(() => {
  if (state.value.status !== "success" || !state.value.data.current) {
    return null;
  }
  return state.value.data.current.windSpeedKmh;
});

const currentWindDirection = computed(() => {
  if (state.value.status !== "success" || !state.value.data.current) {
    return null;
  }
  return state.value.data.current.windDirectionDeg;
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

const stationName = computed(() => selectedStation.value?.name ?? "");

function handleStationSelected(station: StationMeta) {
  selectedStation.value = station;
  stationProvider.setStation(
    Station.create({ abbreviation: station.abbreviation })
  );
  load();
}

function handleChangeStation() {
  selectedStation.value = null;
}

onMounted(async () => {
  const abbreviation = stationProvider.getStation().abbreviation;
  selectedStation.value = {
    abbreviation,
    name: abbreviation,
    heightM: 0,
    e: 0,
    n: 0,
  };
  await load();

  try {
    const stations = await stationMetaRepository.getStations();
    const station = stations.find((s: StationMeta) => s.abbreviation === abbreviation);
    if (station) {
      selectedStation.value = station;
    }
  } catch {
    // Keep the fallback station meta when station list fails to load.
  }
});
</script>

<template>
  <main class="dashboard">
    <PlaceStationSelector
      v-if="!selectedStation"
      @station-selected="handleStationSelected"
    />

    <template v-else>
      <LoadingSpinner v-if="state.status === 'loading' && !isRefreshing" />

      <ErrorState
        v-else-if="state.status === 'error'"
        :message="getErrorMessage(state.error)"
        @retry="load"
        @choose-station="handleChangeStation"
      />

      <template v-else-if="state.status === 'success' || isRefreshing">
        <EmptyState v-if="isEmpty" :station-name="stationName" />

        <template v-else>
          <StationHeader
            :station-name="stationName"
            :timestamp="currentTimestamp"
            :loading="isRefreshing"
            @change="handleChangeStation"
            @refresh="handleRefresh"
          />

          <div class="content">
            <CurrentReading
              :temperature="currentTemp"
              :sunshine="currentSunshine"
              :precipitation="currentPrecip"
              :wind-speed-kmh="currentWindSpeed"
              :wind-direction-deg="currentWindDirection"
            />

            <HourlyChart
              v-if="hourlyReadings.length > 0"
              :readings="hourlyReadings"
            />
          </div>
        </template>
      </template>
    </template>
  </main>
</template>

<style scoped>
.dashboard {
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
