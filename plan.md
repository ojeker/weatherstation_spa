# Implementation Plan (v1.0)

Step-by-step plan to implement the SPA following the principles in `spec.md` and `architecture.md`.

**Status: COMPLETE**

## Phase 1: Project Foundation ✅

| Step | Name | Description | Status |
|------|------|-------------|--------|
| 1.1 | **SCAFFOLD** | Set up Vue 3 project with Vite, TypeScript, Vitest, Cypress, and folder structure | ✅ |
| 1.2 | **LINT-CONFIG** | Add ESLint + Prettier with import boundary rules to enforce layer dependencies | ✅ |

## Phase 2: Domain Layer ✅

| Step | Name | Description | Status |
|------|------|-------------|--------|
| 2.1 | **DOMAIN-ERRORS** | Extend error classes: `NetworkError`, `CsvParseError`, `SchemaMismatchError`, `NoDataForTodayError` | ✅ |
| 2.2 | **DOMAIN-STATION-PROVIDER** | Define `StationProvider` port interface | ✅ |
| 2.3 | **DOMAIN-WEATHER-REPO** | Define `WeatherRepository` port interface returning `TodayWeather` model | ✅ |
| 2.4 | **DOMAIN-TODAY-WEATHER** | Create `TodayWeather` aggregate model (current reading + hourly series) | ✅ |

## Phase 3: Infrastructure Layer ✅

| Step | Name | Description | Status |
|------|------|-------------|--------|
| 3.1 | **INFRA-HTTP** | Implement `HttpClient` wrapper with typed error handling | ✅ |
| 3.2 | **INFRA-CSV-PARSER** | Implement semicolon-delimited CSV parser | ✅ |
| 3.3 | **INFRA-SCHEMA-VALIDATOR** | Implement schema validation (required columns, station_abbr match) | ✅ |
| 3.4 | **INFRA-ZURICH-TIME** | Implement Europe/Zurich "today" boundary logic and filtering | ✅ |
| 3.5 | **INFRA-ROW-MAPPER** | Map CSV rows to `Reading` domain objects (numeric parsing rules) | ✅ |
| 3.6 | **INFRA-WEATHER-REPO** | Implement `WeatherRepository` (fetches both CSVs, composes `TodayWeather`) | ✅ |
| 3.7 | **INFRA-DEFAULT-STATION** | Implement `DefaultStationProvider` returning GOE | ✅ |

## Phase 4: Application Layer ✅

| Step | Name | Description | Status |
|------|------|-------------|--------|
| 4.1 | **APP-LOAD-WEATHER** | Create `LoadTodayWeatherUseCase` orchestrating station provider + repository | ✅ |

## Phase 5: Unit Tests (Infrastructure + Application) ✅

| Step | Name | Description | Status |
|------|------|-------------|--------|
| 5.1 | **TEST-FIXTURES** | Create CSV test fixtures (valid, missing columns, station mismatch, empty values) | ✅ |
| 5.2 | **TEST-CSV-PARSER** | Unit tests for CSV parsing with semicolon delimiter | ✅ |
| 5.3 | **TEST-SCHEMA** | Unit tests for schema validation (missing columns, station mismatch) | ✅ |
| 5.4 | **TEST-ZURICH-TIME** | Unit tests for Europe/Zurich day boundary filtering | ✅ |
| 5.5 | **TEST-ROW-MAPPER** | Unit tests for numeric parsing (empty→null, invalid→error) | ✅ |
| 5.6 | **TEST-WEATHER-REPO** | Unit tests for repository (mock HTTP, verify composition) | ✅ |
| 5.7 | **TEST-USE-CASE** | Unit tests for use case orchestration | ✅ |

## Phase 6: UI Layer ✅

| Step | Name | Description | Status |
|------|------|-------------|--------|
| 6.1 | **UI-DI-CONTAINER** | Create composition root wiring implementations to ports | ✅ |
| 6.2 | **UI-COMPOSABLE** | Create `useWeather` composable (loading/error/data states, retry) | ✅ |
| 6.3 | **UI-CURRENT-CARD** | Build `CurrentReading` component (temperature, sunshine, precipitation, timestamp) | ✅ |
| 6.4 | **UI-HOURLY-CHARTS** | Build hourly spark bars (temperature, sunshine, precipitation) - user preference | ✅ |
| 6.5 | **UI-LOADING-STATE** | Implement loading spinner | ✅ |
| 6.6 | **UI-ERROR-STATE** | Implement error display with retry button | ✅ |
| 6.7 | **UI-EMPTY-STATE** | Implement "No data for today" message | ✅ |
| 6.8 | **UI-DASHBOARD** | Compose dashboard page with all components | ✅ |
| 6.9 | **UI-RESPONSIVE** | Add responsive styles (portrait stacked, landscape side-by-side) | ✅ |

## Phase 7: Component Tests ✅

| Step | Name | Description | Status |
|------|------|-------------|--------|
| 7.1 | **TEST-CURRENT-CARD** | Component tests for CurrentReading (formatting, null values) | ✅ |
| 7.2 | **TEST-STATES** | Component tests for loading/error/empty states | ✅ |

## Phase 8: E2E Tests ✅

| Step | Name | Description | Status |
|------|------|-------------|--------|
| 8.1 | **E2E-FIXTURES** | Create Cypress fixtures for network interception | ✅ |
| 8.2 | **E2E-HAPPY-PATH** | E2E test: successful data load and display | ✅ |
| 8.3 | **E2E-SCHEMA-ERROR** | E2E test: schema mismatch shows error state | ✅ |
| 8.4 | **E2E-NETWORK-ERROR** | E2E test: network failure shows error + retry works | ✅ |

## Phase 9: Finalization ✅

| Step | Name | Description | Status |
|------|------|-------------|--------|
| 9.1 | **SCRIPTS** | Ensure `npm run test:unit` and `npm run test:e2e` work | ✅ |
| 9.2 | **ACCEPTANCE-CHECK** | Verify all acceptance criteria from spec.md | ✅ |

## Test Summary

- **Unit + Component Tests:** 73 passed
- **E2E Test Scenarios:** 6 tests across 3 describe blocks

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test:unit    # Run unit + component tests
npm run test:e2e     # Run E2E tests (requires dev server)
```
