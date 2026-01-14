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
  Title,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import type { Reading } from "@/domain";
import type { ChartDataset } from "chart.js";
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

const props = defineProps<{
  readings: Reading[];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const PRECIP_CAP_MM = 6;

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

const PRECIP_DATASET_LABEL = "Precipitation";

type PrecipDataset = ChartDataset<"bar", number[]> & {
  rawValues?: number[];
};

const precipZigzagPlugin = {
  id: "precipZigzag",
  afterDatasetsDraw(chart: Chart) {
    const datasetIndex = chart.data.datasets.findIndex(
      (dataset) => dataset.label === PRECIP_DATASET_LABEL
    );
    if (datasetIndex === -1) return;

    const meta = chart.getDatasetMeta(datasetIndex);
    const dataset = chart.data.datasets[datasetIndex] as PrecipDataset;
    const rawValues = dataset.rawValues ?? [];

    meta.data.forEach((element, index) => {
      const rawValue = rawValues[index] ?? 0;
      if (rawValue <= PRECIP_CAP_MM) return;

      const bar = element as unknown as { x: number; y: number; width?: number };
      const width = Math.max(6, (bar.width ?? 10) - 4);
      const startX = bar.x - width / 2;
      const endX = bar.x + width / 2;
      const y = bar.y + 1;

      const ctx = chart.ctx;
      ctx.save();
      ctx.strokeStyle = "#0b2a3d";
      ctx.lineWidth = 1.5;
      ctx.lineJoin = "round";
      ctx.beginPath();

      const segments = 5;
      const step = (endX - startX) / segments;
      for (let i = 0; i <= segments; i++) {
        const x = startX + i * step;
        const offset = i % 2 === 0 ? -3 : 3;
        if (i === 0) ctx.moveTo(x, y + offset);
        else ctx.lineTo(x, y + offset);
      }
      ctx.stroke();
      ctx.restore();
    });
  },
};

Chart.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  BarController,
  LineController,
  Tooltip,
  Title,
  Legend,
  ChartDataLabels,
  precipZigzagPlugin
);

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

  // Precipitation as positive values (with capping for display)
  const precipValuesRaw = readings.map((r) =>
    r.precipitationMm !== null ? r.precipitationMm : 0
  );
  const precipValuesCapped = precipValuesRaw.map((value) =>
    Math.min(value, PRECIP_CAP_MM)
  );
  const precipValuesScaled = precipValuesCapped.map(
    (value) => (value / PRECIP_CAP_MM) * 100
  );

  // Calculate axis bounds
  const maxSun = Math.max(...sunshinePercent, 100);

  return {
    labels,
    temperatures,
    windSpeeds,
    windDirections,
    sunshinePercent,
    precipValuesRaw,
    precipValuesCapped,
    precipValuesScaled,
    maxSun,
  };
});

function createChart() {
  if (!canvasRef.value) return;

  const data = chartData.value;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

  // Calculate y-axis range to accommodate both sunshine and precip
  const yMax = 100;
  const yMin = 0;

  // Temperature range for secondary axis
  const numericTemps = data.temperatures.filter(
    (value): value is number => value !== null
  );
  const tempMin = numericTemps.length > 0 ? Math.min(...numericTemps) - 2 : 0;
  const tempMax = numericTemps.length > 0 ? Math.max(...numericTemps) + 2 : 1;

  // Wind speed range for left axis
  const numericWindSpeeds = data.windSpeeds.filter(
    (value): value is number => Number.isFinite(value)
  );
  const windMinRaw = numericWindSpeeds.length > 0 ? Math.min(...numericWindSpeeds) : 0;
  const windMaxRaw = numericWindSpeeds.length > 0 ? Math.max(...numericWindSpeeds) : 1;
  const windMin = Math.max(0, windMinRaw - 2);
  const windMax = windMaxRaw + 2;

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
          pointRadius: (context: { dataIndex: number }) =>
            data.windDirections[context.dataIndex] === null ? 0 : 8,
          pointHoverRadius: 10,
          pointStyle: (context: { dataIndex: number }) => {
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
            align: (context) => {
              const value = data.sunshinePercent[context.dataIndex] ?? 0;
              return value > 60 ? "start" : "end";
            },
            clamp: true,
            clip: false,
            formatter: (value: number) => (value > 0 ? `${Math.round(value)}%` : ""),
            color: (context) => {
              const value = data.sunshinePercent[context.dataIndex] ?? 0;
              return value > 60 ? "#3f2f00" : "#866d0d";
            },
            font: { size: 10, weight: "bold" },
          },
          order: 1,
        },
        (() => {
          const dataset: PrecipDataset = {
            type: "bar",
            label: "Precipitation",
            rawValues: data.precipValuesRaw,
            data: data.precipValuesScaled,
            backgroundColor: "rgba(52, 152, 219, 0.7)",
            borderColor: "#3498db",
            borderWidth: 1,
            yAxisID: "yBars",
            datalabels: {
              anchor: "end",
              align: (context: { dataIndex: number }) => {
                const rawValue = data.precipValuesRaw[context.dataIndex] ?? 0;
                return rawValue > PRECIP_CAP_MM * 0.6 ? "start" : "end";
              },
              formatter: (_value: number, context: { dataIndex: number }) => {
                const rawValue = data.precipValuesRaw[context.dataIndex] ?? 0;
                if (rawValue <= 0) return "";
                const suffix = rawValue > PRECIP_CAP_MM ? "!" : "";
                return `${rawValue.toFixed(1)}${suffix}`;
              },
              color: (context: { dataIndex: number }) => {
                const rawValue = data.precipValuesRaw[context.dataIndex] ?? 0;
                return rawValue > PRECIP_CAP_MM * 0.6 ? "#0b2a3d" : "#1a5276";
              },
              font: { size: 10, weight: "bold" },
            },
            order: 2,
          };
          return dataset;
        })(),
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 8,
        },
      },
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Hourly values",
          font: {
            size: 18,
            weight: 400,
          },
          color: "#555",
          padding: {
            top: 4,
            bottom: 12,
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
              if (label === "Precipitation") {
                const rawValue = data.precipValuesRaw[context.dataIndex] ?? 0;
                return `${label}: ${rawValue.toFixed(1)}mm`;
              }
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
            callback: (value) => `${Number(value).toFixed(1)}°`,
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
            callback: (value) => `${Math.round(Number(value))}`,
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
    <div class="legend-hint">
      <span class="hint"><span class="icon-temp">🌡</span> °C</span>
      <span class="hint">
        <span class="icon-wind" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="img" aria-label="Wind">
            <path
              d="M3 9h11.5a2.5 2.5 0 1 0-2.2-3.7"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3 13h14.5a2.5 2.5 0 1 1-2.2 3.7"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3 17h9"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </span>
        km/h
      </span>
      <span class="hint"><span class="icon-sun">☀</span> %</span>
      <span class="hint"><span class="icon-precip">💧</span> mm</span>
    </div>
  </section>
</template>

<style scoped>
.hourly-chart {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.75rem;
  border-top: 1px solid #eee;
}

.chart-container {
  position: relative;
  flex: 1;
  min-height: 220px;
  width: 100%;
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

.icon-temp {
  color: #e74c3c;
}

.icon-wind {
  color: #22c55e;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.95rem;
  height: 0.95rem;
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
