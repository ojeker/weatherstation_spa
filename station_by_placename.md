# AI Coding Agent Requirements — “Select nearest station by placename”

---

## 1) Goal
Implement a SPA feature where a user:
1. Types a **place name** or **PLZ**.
2. Sees a **live-filtered list** of matching places on every keypress.
3. Confirms a place.
4. Sees the **nearest 10 MeteoSwiss stations**, computed using **Swiss planar coordinates**, showing:
   - station name
   - station height
   - distance to the selected place

Only **PLZ + place name** are shown for places.

---

## 2) Data Sources & Fixed Schema

### 2.1 Places & cities dataset  
**File:** `ortschaftenverzeichnis_plz_2056.csv.zip`

**Coordinate system**
- EPSG:2056 (CH1903+ / LV95)
- Units: meters

**Required columns**
- `PLZ` – postal code
- `ORTSCHAFTSNAME` – place name
- `E` – LV95 Easting (meters)
- `N` – LV95 Northing (meters)

**Notes**
- Each row represents one PLZ–place combination.
- Multiple rows may share the same `ORTSCHAFTSNAME` with different `PLZ`.

---

### 2.2 Station metadata dataset  
**File:** `ogd-smn_meta_stations.csv`

**Coordinate system**
- EPSG:2056 (CH1903+ / LV95)
- Units: meters

**Required columns**
- `station_name` – station name
- `station_height_m` – altitude in meters
- `station_coordinates_lv95_east` – LV95 Easting
- `station_coordinates_lv95_north` – LV95 Northing

---

## 3) Coordinate System Assumptions
- Both datasets are guaranteed to use Swiss projected coordinates (EPSG:2056).
- No CRS detection or fallback logic is required.
- All distance calculations must be planar.

---

## 4) User Story — Stepwise Flow

### Step A — Typing & live filtering
1. User types characters into a single input field.
2. On every keypress:
   - Normalize input (lowercase, trim).
   - Filter places by:
     - **PLZ prefix match** if input starts with a digit.
     - **Place name prefix match** otherwise.
3. The result list shrinks monotonically as input grows.
4. Each result is displayed as:  
   `<PLZ> <ORTSCHAFTSNAME>`

---

### Step B — Place confirmation
5. User selects a place.
6. Store:
   - `plz`
   - `placeName`
   - `E`
   - `N`

---

### Step C — Nearest stations
7. Load the station dataset (or use a cached version).
8. Compute distance from the selected place to every station using planar coordinates.
9. Sort stations by ascending distance.
10. Select the nearest 10 stations.
11. Display for each station:
    - station name
    - station height (m)
    - distance (km)

---

## 5) Filtering Logic

### 5.1 Normalization
- Convert to lowercase
- Trim whitespace
- No fuzzy matching
- No diacritic normalization

### 5.2 Matching rules
- Numeric input → `PLZ.startsWith(query)`
- Alphabetic input → `ORTSCHAFTSNAME.startsWith(query)`

---

## 6) Distance Computation

### 6.1 Formula
Use planar Euclidean distance on LV95 coordinates:

```pseudocode
dx = station_E - place_E
dy = station_N - place_N
distance_m = sqrt(dx² + dy²)
distance_km = distance_m / 1000
```

### 6.2 Sorting
1. Distance ascending
2. Station name (stable tie-breaker)

---

## 7) Distance Formatting
- `< 10 km` → 1 decimal place (e.g. `3.4 km`)
- `≥ 10 km` → no decimals (e.g. `27 km`)

---

## 8) Acceptance Criteria
- Live filtering updates on every keypress.
- Only PLZ and place name are displayed.
- Distances are computed using LV95 planar coordinates only.
- Exactly 10 nearest stations are shown.
- Each station entry shows:
  - name
  - height (m)
  - distance (km)
- Results are deterministic and correctly sorted.

---

## 9) Definition of Done
- The application successfully loads `ortschaftenverzeichnis_plz_2056.csv.zip`.
- Station distances are computed using planar math on LV95 coordinates.
- No geographic (Haversine) calculations are present.
- Feature passes unit and integration tests.
- No unused metadata or optional columns are exposed in the UI.
