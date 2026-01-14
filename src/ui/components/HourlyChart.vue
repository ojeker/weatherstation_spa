<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import type { Reading } from "@/domain";
import nIcon from "@/ui/assets/wind-directions/n.svg";
import nneIcon from "@/ui/assets/wind-directions/nne.svg";
import neIcon from "@/ui/assets/wind-directions/ne.svg";
import eneIcon from "@/ui/assets/wind-directions/ene.svg";
import eIcon from "@/ui/assets/wind-directions/e.svg";
import eseIcon from "@/ui/assets/wind-directions/ese.svg";
import seIcon from "@/ui/assets/wind-directions/se.svg";
import sseIcon from "@/ui/assets/wind-directions/sse.svg";
import sIcon from "@/ui/assets/wind-directions/s.svg";
import sswIcon from "@/ui/assets/wind-directions/ssw.svg";
import swIcon from "@/ui/assets/wind-directions/sw.svg";
import wswIcon from "@/ui/assets/wind-directions/wsw.svg";
import wIcon from "@/ui/assets/wind-directions/w.svg";
import wnwIcon from "@/ui/assets/wind-directions/wnw.svg";
import nwIcon from "@/ui/assets/wind-directions/nw.svg";
import nnwIcon from "@/ui/assets/wind-directions/nnw.svg";

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Legend,
  ChartDataLabels
);

const props = defineProps<{
  readings: Reading[];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const WIND_ICONS = [
  { key: "n", label: "N", url: nIcon },
  { key: "nne", label: "NNE", url: nneIcon },
  { key: "ne", label: "NE", url: neIcon },
  { key: "ene", label: "ENE", url: eneIcon },
  { key: "e", label: "E", url: eIcon },
  { key: "ese", label: "ESE", url: eseIcon },
  { key: "se", label: "SE", url: seIcon },
  { key: "sse", label: "SSE", url: sseIcon },
  { key: "s", label: "S", url: sIcon },
  { key: "ssw", label: "SSW", url: sswIcon },
  { key: "sw", label: "SW", url: swIcon },
  { key: "wsw", label: "WSW", url: wswIcon },
  { key: "w", label: "W", url: wIcon },
  { key: "wnw", label: "WNW", url: wnwIcon },
  { key: "nw", label: "NW", url: nwIcon },
  { key: "nnw", label: "NNW", url: nnwIcon },
] as const;

const windIconCache = new Map<string, HTMLImageElement>();

function getWindIcon(directionDeg: number | null): HTMLImageElement | null {
  if (directionDeg === null) return null;
  const normalized = ((directionDeg % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % WIND_ICONS.length;
  const entry = WIND_ICONS[index];
  const cached = windIconCache.get(entry.key);
  if (cached) return cached;
  const image = new Image();
  image.src = entry.url;
  windIconCache.set(entry.key, image);
  return image;
}

function getWindLabel(directionDeg: number | null): string | null {
  if (directionDeg === null) return null;
  const normalized = ((directionDeg % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % WIND_ICONS.length;
  return WIND_ICONS[index].label;
}

const windGridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.readings.length}, minmax(0, 1fr))`,
}));

const chartData = computed(() => {
  const readings = props.readings;

  const labels = readings.map((r) =>
    r.timestamp.toDate().toLocaleTimeString("de-CH", {
      hour: "2-digit",
      timeZone: "Europe/Zurich",
    })
  );

  const temperatures = readings.map((r) => r.temperatureC ?? null);

  // Wind speed in km/h
  const windSpeeds = readings.map((r) => r.windSpeedKmh ?? 0);
  const windDirections = readings.map((r) => r.windDirectionDeg ?? null);

  // Sunshine as percentage (positive)
  const maxSunMinutes = readings[0]?.kind === "hourly" ? 60 : 10;
  const sunshinePercent = readings.map((r) =>
    r.sunshineMinutes !== null ? (r.sunshineMinutes / maxSunMinutes) * 100 : 0
  );

  // Precipitation as positive values
  const precipValues = readings.map((r) =>
    r.precipitationMm !== null ? r.precipitationMm : 0
  );

  // Calculate axis bounds
  const maxSun = Math.max(...sunshinePercent, 100);
  const maxPrecip = Math.max(...precipValues, 0);

  return {
    labels,
    temperatures,
    windSpeeds,
    windDirections,
    sunshinePercent,
    precipValues,
    maxSun,
    maxPrecip,
  };
});

function createChart() {
  if (!canvasRef.value) return;

  const data = chartData.value;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

  // Calculate y-axis range to accommodate both sunshine and precip
  const yMax = Math.max(data.maxSun, 100);
  const yMin = 0;

  // Temperature range for secondary axis
  const numericTemps = data.temperatures.filter(
    (value): value is number => value !== null
  );
  const tempMin = numericTemps.length > 0 ? Math.min(...numericTemps) - 2 : 0;
  const tempMax = numericTemps.length > 0 ? Math.max(...numericTemps) + 2 : 1;

  // Wind speed range for left axis
  const windMin = 0;
  const windMax = Math.max(...data.windSpeeds, 20) * 1.1;

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.labels,
      datasets: [
        {
          type: "line",
          label: "Temperature",
          data: data.temperatures,
          borderColor: "#e74c3c",
          backgroundColor: "rgba(231, 76, 60, 0.1)",
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#e74c3c",
          tension: 0.3,
          yAxisID: "yTemp",
          datalabels: {
            display: false,
          },
          order: 0,
        },
        {
          type: "line",
          label: "Wind",
          data: data.windSpeeds,
          borderColor: "#22c55e",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          borderWidth: 2,
          pointRadius: (context) =>
            data.windDirections[context.dataIndex] === null ? 0 : 8,
          pointHoverRadius: 10,
          pointStyle: (context) => {
            const direction = data.windDirections[context.dataIndex];
            return getWindIcon(direction) ?? "circle";
          },
          pointBackgroundColor: "#000",
          pointBorderColor: "#000",
          showLine: true,
          tension: 0.3,
          yAxisID: "yWind",
          datalabels: {
            display: false,
          },
          order: 0,
        },
        {
          type: "bar",
          label: "Sunshine",
          data: data.sunshinePercent,
          backgroundColor: "rgba(241, 196, 15, 0.7)",
          borderColor: "#f1c40f",
          borderWidth: 1,
          yAxisID: "yBars",
          datalabels: {
            anchor: "end",
            align: "end",
            formatter: (value: number) => (value > 0 ? `${Math.round(value)}%` : ""),
            color: "#866d0d",
            font: { size: 10, weight: "bold" },
          },
          order: 1,
        },
        {
          type: "bar",
          label: "Precipitation",
          data: data.precipValues,
          backgroundColor: "rgba(52, 152, 219, 0.7)",
          borderColor: "#3498db",
          borderWidth: 1,
          yAxisID: "yBars",
          datalabels: {
            anchor: "end",
            align: "end",
            formatter: (value: number) =>
              value > 0 ? `${value.toFixed(1)}` : "",
            color: "#1a5276",
            font: { size: 10, weight: "bold" },
          },
          order: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            padding: 12,
            font: { size: 11 },
          },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || "";
              const value = context.raw as number | null;
              if (value === null) return `${label}: —`;
              if (label === "Temperature") return `${label}: ${value.toFixed(1)}°C`;
              if (label === "Wind") {
                const direction = data.windDirections[context.dataIndex];
                const directionLabel = getWindLabel(direction);
                return `${label}: ${Math.round(value)} km/h${directionLabel ? ` · ${directionLabel}` : ""}`;
              }
              if (label === "Sunshine") return `${label}: ${Math.round(value)}%`;
              if (label === "Precipitation") return `${label}: ${value.toFixed(1)}mm`;
              return `${label}: ${value}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: { size: 11 },
          },
        },
        yBars: {
          type: "linear",
          position: "left",
          min: yMin,
          max: yMax,
          grid: {
            color: (context) => (context.tick.value === 0 ? "#333" : "#eee"),
            lineWidth: (context) => (context.tick.value === 0 ? 2 : 1),
          },
          ticks: {
            display: false,
          },
        },
        yTemp: {
          type: "linear",
          position: "right",
          min: tempMin,
          max: tempMax,
          grid: {
            display: false,
          },
          ticks: {
            callback: (value) => `${value}°`,
            font: { size: 10 },
            color: "#e74c3c",
          },
        },
        yWind: {
          type: "linear",
          position: "left",
          min: windMin,
          max: windMax,
          grid: {
            display: false,
          },
          ticks: {
            callback: (value) => `${value}`,
            font: { size: 10 },
            color: "#22c55e",
          },
        },
      },
    },
  });
}

function destroyChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

function updateChart() {
  destroyChart();
  createChart();
}

onMounted(() => {
  createChart();
});

onUnmounted(() => {
  destroyChart();
});

watch(() => props.readings, updateChart, { deep: true });
</script>

<template>
  <section class="hourly-chart">
    <div class="chart-container">
      <canvas ref="canvasRef"></canvas>
    </div>
    <div
      v-if="props.readings.length > 0"
      class="wind-direction-row"
      :style="windGridStyle"
      aria-label="Wind direction for the last 8 hours"
    >
      <span
      v-for="(reading, index) in props.readings"
        :key="`${reading.timestamp.toDate().toISOString()}-${index}`"
        class="wind-direction-cell"
      >
        <span
          v-if="reading.windDirectionDeg !== null"
          class="wind-direction-arrow"
          role="img"
          :aria-label="`Wind direction ${Math.round(reading.windDirectionDeg)} degrees`"
          :style="{ transform: `rotate(${reading.windDirectionDeg}deg)` }"
        >
          ▲
        </span>
        <span v-else class="wind-direction-missing">—</span>
      </span>
    </div>
    <div class="legend-hint">
      <span class="hint"><span class="icon-sun">☀</span> %</span>
      <span class="hint"><span class="icon-precip">💧</span> mm</span>
    </div>
  </section>
</template>

<style scoped>
.hourly-chart {
  padding: 0.75rem;
  border-top: 1px solid #eee;
}

.chart-container {
  position: relative;
  height: 220px;
  width: 100%;
}

.wind-direction-row {
  display: grid;
  align-items: center;
  margin-top: 0.35rem;
  font-size: 0.75rem;
  color: #64748b;
}

.wind-direction-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 1.2rem;
}

.wind-direction-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #22c55e;
  transform-origin: center;
  transition: transform 0.2s ease;
}

.wind-direction-missing {
  color: #cbd5f5;
}

.legend-hint {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #888;
}

.icon-sun {
  color: #f1c40f;
}

.icon-precip {
  color: #3498db;
}

@media (orientation: landscape) and (min-width: 560px) {
  .chart-container {
    height: 180px;
  }
}
</style>
