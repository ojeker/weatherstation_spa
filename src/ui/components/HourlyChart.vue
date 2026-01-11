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

const chartData = computed(() => {
  const readings = props.readings;

  const labels = readings.map((r) =>
    r.timestamp.toDate().toLocaleTimeString("de-CH", {
      hour: "2-digit",
      timeZone: "Europe/Zurich",
    })
  );

  const temperatures = readings.map((r) => r.temperatureC);

  // Sunshine as percentage (positive)
  const maxSunMinutes = readings[0]?.kind === "hourly" ? 60 : 10;
  const sunshinePercent = readings.map((r) =>
    r.sunshineMinutes !== null ? (r.sunshineMinutes / maxSunMinutes) * 100 : 0
  );

  // Precipitation as negative values
  const precipNegative = readings.map((r) =>
    r.precipitationMm !== null ? -r.precipitationMm : 0
  );

  // Calculate axis bounds
  const maxSun = Math.max(...sunshinePercent, 100);
  const minPrecip = Math.min(...precipNegative, 0);
  const maxPrecipAbs = Math.abs(minPrecip);

  return {
    labels,
    temperatures,
    sunshinePercent,
    precipNegative,
    maxSun,
    minPrecip,
    maxPrecipAbs,
  };
});

function createChart() {
  if (!canvasRef.value) return;

  const data = chartData.value;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

  // Calculate y-axis range to accommodate both sunshine and precip
  const yMax = Math.max(data.maxSun, 100);
  const yMin = data.minPrecip < 0 ? Math.min(data.minPrecip * 1.2, -10) : -10;

  // Temperature range for secondary axis
  const tempMin = Math.min(...data.temperatures) - 2;
  const tempMax = Math.max(...data.temperatures) + 2;

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
          data: data.precipNegative,
          backgroundColor: "rgba(52, 152, 219, 0.7)",
          borderColor: "#3498db",
          borderWidth: 1,
          yAxisID: "yBars",
          datalabels: {
            anchor: "end",
            align: "end",
            formatter: (value: number) =>
              value < 0 ? `${Math.abs(value).toFixed(1)}` : "",
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
              const value = context.raw as number;
              if (label === "Temperature") return `${label}: ${value.toFixed(1)}°C`;
              if (label === "Sunshine") return `${label}: ${Math.round(value)}%`;
              if (label === "Precipitation") return `${label}: ${Math.abs(value).toFixed(1)}mm`;
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
