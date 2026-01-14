# Weatherstation

## Overview
Vue 3 single-page app that shows MeteoSwiss station weather for the current day:
- Current reading (latest 10-minute measurement)
- Hourly charts for all passed hours today

Data comes from public CSV endpoints and is parsed, validated, and mapped into domain models. The UI emphasizes clear loading, error, and empty-data states.

## Architecture
Layered structure with strict dependency direction:
- `src/domain`: models, value objects, ports, typed errors (no imports from other layers)
- `src/application`: use cases (imports from domain only)
- `src/infrastructure`: CSV parsing, validation, repositories, HTTP client (imports from domain)
- `src/ui`: Vue components/pages/composables (imports from domain/application)

Composition root:
- `src/ui/di/container.ts` wires concrete repositories/providers
- `src/main.ts` mounts the app

Key ports:
- `WeatherRepository`
- `StationProvider`
- `StationMetaRepository`

## Data Flow & Domain Model
CSV ingestion:
1) Fetch CSVs for current (10-minute) and hourly datasets.
2) Parse semicolon-delimited rows.
3) Validate required columns (only `reference_timestamp` is required).
4) Map rows to domain `Reading` models.
5) Filter readings for “today” in Europe/Zurich and build `TodayWeather`.

Reading fields are optional (nullable) except timestamps. Empty numeric values map to `null`, non-numeric values raise typed errors.

## Error Handling
Typed errors are used throughout the domain and infrastructure layers (e.g., network, parse, schema mismatch, invalid values). UI surfaces a friendly message and provides retry/choose-station actions via an error toast overlay.

## Demo Mode
Demo mode lets you use station-agnostic fixtures without touching the business layer. When enabled, all MeteoSwiss CSV requests are redirected to local fixture files and their dates are rewritten to “today” in Europe/Zurich.

Fixture layout:
```
public/
  fixtures/
    demo/
      <mode>/
        t.csv
        h.csv
```

Run with any `<mode>` (e.g., `sun`, `rain`, `mixed`):
```bash
VITE_DEMO_MODE=mixed npm run dev
```

The app will load:
- `public/fixtures/demo/mixed/t.csv`
- `public/fixtures/demo/mixed/h.csv`

## Development Setup
```bash
npm install
npm run dev
```

Build & preview:
```bash
npm run build
npm run preview
```

## Testing
Unit tests:
```bash
npm run test:unit
```

E2E tests:
```bash
npm run test:e2e
```

All tests:
```bash
npm run test:all
```
