# Architecture

## Goals
Build a small Vue 3 SPA that displays MeteoSwiss station weather for the current day:
- Current reading (latest 10-minute measurement)
- Hourly charts for all passed hours of the current day

The codebase must follow SOLID principles, have good test coverage where applicable, and throw understandable, typed exceptions.

## Key constraints
- Data comes from public CSV files, one file per station and dataset kind.
- Station is selected by a station token embedded in the filename (e.g. `goe` in `ogd-smn_goe_t_now.csv`).
- Version 1.0 uses a default station (GOE) but must be extensible to support choosing other stations.
- Version 1.1 will add functionality to choose the closest station.

## Layers & dependency direction (strict)
We use a layered architecture with explicit dependency direction:

- `src/domain` (core)
  - Pure TypeScript only
  - Contains: domain models, value objects, domain errors, and ports (interfaces)
  - MUST NOT import from any other layer

- `src/application`
  - Contains: use-cases and application-level mapping
  - May import from `domain` only
  - MUST NOT import from `ui` or `infrastructure`

- `src/infrastructure`
  - Implements domain ports (repositories/providers)
  - Contains: HTTP client, CSV parsing, schema validation, mapping from CSV rows to domain
  - May import from `domain` (ports/types/errors)
  - MUST NOT import from `ui`

- `src/ui`
  - Vue components, pages, composables, router, optional Pinia store
  - May import from `domain` and `application`
  - MUST NOT import from `infrastructure` directly

### Composition root / Dependency injection
Only the composition root wires implementations to interfaces:
- `src/main.ts` or `src/ui/di/container.ts`

Example: UI depends on `LoadTodayWeatherUseCase`, which depends on a `WeatherRepository` interface. The concrete repository is instantiated only in the composition root.

## SOLID guidelines
- **Single Responsibility**
  - Parsing CSV, validating schema, mapping to domain, and fetching over HTTP are separate responsibilities.
- **Open/Closed**
  - Adding a new station selection strategy (v1.1 closest station) must not require changing UI or repository interfaces.
- **Liskov Substitution**
  - Test fakes must be valid substitutes for real implementations (ports).
- **Interface Segregation**
  - Ports should be small and focused (e.g. `WeatherRepository`, `StationProvider`).
- **Dependency Inversion**
  - Application and UI depend on ports, not on concrete implementations.

## Station selection design (v1.0 extensible)
Introduce a `StationProvider` port in `domain`:

- v1.0: `DefaultStationProvider` returns GOE
- v1.1: replace with `ClosestStationProvider` that uses user location

Weather logic remains unchanged: station selection is separate from weather retrieval.

## Error handling (typed, understandable)
Never throw strings. Use typed errors derived from a shared base error.

Examples:
- `NetworkError` (HTTP failures)
- `CsvParseError` (CSV parsing failures)
- `SchemaMismatchError` (missing required columns or station mismatch)
- `NoDataForTodayError` (no rows for today)
- `InvalidValueError` (non-empty non-numeric values where numeric required)

UI must:
- Display friendly messages
- Keep error details available for logging/debugging (e.g. `error.name`, `error.message`, optional `cause`)

## Time handling
- "Today" is defined in timezone: **Europe/Zurich**
- CSV timestamps are `DD.MM.YYYY HH:mm`
- Do not rely on `Date.parse()` for these strings.
- Filtering “today” must use Europe/Zurich day boundaries.

## Data sources
Two datasets are used; NO fallback aggregation logic:

1) **Current (10-minute) dataset**
- File: `ogd-smn_<stationToken>_t_now.csv`
- Required columns:
  - `reference_timestamp`
  - `tre200s0` (temperature current)
  - `sre000z0` (sunshine duration, last 10 minutes)
  - `rre150z0` (precipitation sum, last 10 minutes)
  - `station_abbr` recommended for validation

2) **Hourly dataset**
- File: `ogd-smn_<stationToken>_h_now.csv`
- Required columns:
  - `reference_timestamp`
  - `tre200h0` (hourly average temperature)
  - `sre000h0` (hourly sunshine duration)
  - `rre150h0` (hourly precipitation sum)
  - `station_abbr` recommended for validation

Station validation:
- If `station_abbr` exists, it must match the expected station (case-insensitive). Mismatch is an error.

## Repository contract (recommended)
`WeatherRepository.getTodayWeather(station, date)` returns a domain model that includes:
- `current`: latest 10-minute reading for today
- `hourly`: ordered hourly series for today

The repository implementation fetches both CSV files and composes the result.
No fallback is implemented if one file fails—UI shows an error state.

## Testing strategy
### Unit tests (Vitest)
Focus on pure logic and mapping:
- delimiter `;`
- timestamp parsing `DD.MM.YYYY HH:mm`
- Europe/Zurich "today" filtering
- schema validation (missing columns)
- station mismatch validation
- numeric parsing rules (empty -> null, invalid -> error)
- ordering of hourly series

### Component tests (Vitest + Testing Library)
- Render states (loading / error / data)
- `CurrentReadingCard` formatting and missing values handling

### E2E tests (Cypress)
- Use fixtures and intercept network calls
- Test happy path + schema mismatch + network error states
