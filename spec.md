# Specification (v1.0)

## Product intent
A Vue SPA displays weather information for a chosen MeteoSwiss station for the current day:
- Current reading (latest 10-minute measurement)
- Charts for hourly values from 00:00 up to the latest available hour today

v1.0 starts with a default station (GOE) but must be extensible to support selecting another station. v1.1 will add "choose closest station".

## User story
As a user, I want to:
1) Open the app and immediately see the current weather values for today for the default station.
2) See charts of temperature, sunshine duration, and precipitation for each hour that has already passed today.
3) Understand when data is missing or unavailable via clear error messages.

## Data source contract

### Station token
Each station has its own CSV file. The station identifier used to select a file is embedded in the filename as a lowercase token.

Example:
- Station GOE uses token `goe`
- Files:
  - `ogd-smn_goe_t_now.csv`
  - `ogd-smn_goe_h_now.csv`

The CSV includes a `station_abbr` column (e.g. `GOE`) but station selection is driven by the filename token.

### Current (10-minute) dataset
- File: `ogd-smn_<token>_t_now.csv`
- CSV delimiter: `;`
- Required columns:
  - `reference_timestamp` (format: `DD.MM.YYYY HH:mm`)
  - `tre200s0` temperature current (°C)
  - `sre000z0` sunshine duration last 10 minutes
  - `rre150z0` precipitation sum last 10 minutes (mm)
  - `station_abbr` (recommended for validation)
- Current reading is the latest row for "today" in Europe/Zurich.

### Hourly dataset
- File: `ogd-smn_<token>_h_now.csv`
- CSV delimiter: `;`
- Required columns:
  - `reference_timestamp` (format: `DD.MM.YYYY HH:mm`)
  - `tre200h0` hourly average temperature (°C)
  - `sre000h0` hourly sunshine duration
  - `rre150h0` hourly precipitation sum (mm)
  - `station_abbr` (recommended for validation)
- Hourly chart series consists of all rows for "today" in Europe/Zurich, sorted by timestamp ascending.
- The app does NOT compute hourly aggregates from the 10-minute dataset.

### Timestamp rules
- Timestamp format: `DD.MM.YYYY HH:mm` (e.g. `11.01.2026 13:20`)
- "Today" is defined in timezone: Europe/Zurich
- Filtering by day must use Zurich day boundaries (00:00–23:59 local time)

### Numeric parsing rules
- Empty string => `null` (treated as missing)
- Non-empty value must parse as a finite number:
  - If not parseable => error (typed exception)

### Station validation rules
- If `station_abbr` exists in the CSV:
  - It must match the expected station abbreviation for the chosen token (case-insensitive)
  - If it does not match => error (typed exception)

## UI requirements (v1.0)
- Single page dashboard:
  - Current reading card:
    - temperature: `tre200s0`
    - sunshine (10-min): `sre000z0`
    - precipitation (10-min): `rre150z0`
    - show timestamp for the current reading
  - Hourly charts:
    - temperature hourly: `tre200h0`
    - sunshine hourly: `sre000h0`
    - precipitation hourly: `rre150h0`

- UI must adapt to smartphone, tablet and desktop screen size and orientation.
- Loading state:
  - shows a spinner/skeleton while loading
- Error state:
  - friendly message
  - retry button
  - must not crash the app
- Empty-data state:
  - If no rows exist for today in either dataset, show:
    - "No data available for today for station <X>."

## Architecture requirements
- Must follow the layer rules described in `ARCHITECTURE.md`
- Must expose a `StationProvider` port so v1.1 can swap station selection without refactoring:
  - v1.0 implementation returns the default station (GOE)

## Acceptance criteria (v1.0)
Data & logic:
- [x] App loads the default station via StationProvider (GOE).
- [x] App fetches `t_now` and `h_now` CSV files for the station token.
- [x] App validates required columns for each file and throws a typed error if missing.
- [x] App parses timestamps `DD.MM.YYYY HH:mm` and filters for "today" in Europe/Zurich.
- [x] App selects the latest `t_now` row for the current reading.
- [x] App builds hourly series from all `h_now` rows for today, sorted ascending.
- [x] No hourly aggregation fallback is implemented.

UI:
- [x] Current card renders values and timestamp.
- [x] Charts render hourly series for today (implemented as spark bars per user preference).
- [x] Loading, error, and empty-data states are clear and user-friendly.
- [x] Retry triggers a re-fetch.

Testing:
- [x] Unit tests cover CSV parsing, schema validation, timestamp parsing, Zurich "today" filtering, current selection, and hourly ordering.
- [x] Unit tests do not hit the network (mock HttpClient / use fixtures).
- [x] E2E tests intercept network calls and test:
  - happy path
  - schema mismatch
  - network error
- [x] `npm run test:unit` and `npm run test:e2e` pass.

## Out of scope for v1.0
- Choosing closest station (v1.1)
- Any fallback aggregation logic
- Historical day navigation beyond today
- Offline mode
