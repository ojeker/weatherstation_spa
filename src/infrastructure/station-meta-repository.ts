import {
  InvalidValueError,
  type StationMeta,
  type StationMetaRepository,
} from "@/domain";
import { fetchArrayBuffer } from "./http-client";
import { parseCsv } from "./csv-parser";
import {
  STATION_META_COLUMNS,
  validateRequiredColumns,
} from "./schema-validator";

const STATION_META_URL =
  "https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn/ogd-smn_meta_stations.csv";

/** Loads station metadata from MeteoSwiss with caching. */
export class MeteoSwissStationMetaRepository implements StationMetaRepository {
  private cached: StationMeta[] | null = null;

  async getStations(): Promise<StationMeta[]> {
    if (this.cached) return this.cached;

    const buffer = await fetchArrayBuffer(STATION_META_URL);
    const content = decodeCsvContent(buffer);
    const rows = parseCsv(content);

    validateRequiredColumns(rows, STATION_META_COLUMNS);

    const stations = rows.map((row) => ({
      abbreviation: readRequiredString(row["station_abbr"], "station_abbr").toUpperCase(),
      name: readRequiredString(row["station_name"], "station_name"),
      heightM: parseRequiredNumber(row["station_height_masl"], "station_height_masl"),
      e: parseRequiredNumber(
        row["station_coordinates_lv95_east"],
        "station_coordinates_lv95_east"
      ),
      n: parseRequiredNumber(
        row["station_coordinates_lv95_north"],
        "station_coordinates_lv95_north"
      ),
    }));

    this.cached = stations;
    return stations;
  }
}

function readRequiredString(value: string | undefined, label: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new InvalidValueError(`${label} is required.`);
  }
  return trimmed;
}

function parseRequiredNumber(value: string | undefined, label: string): number {
  const trimmed = value?.trim() ?? "";
  if (trimmed === "") {
    throw new InvalidValueError(`${label} is required.`);
  }

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) {
    throw new InvalidValueError(`${label} must be a finite number.`);
  }

  return parsed;
}

function decodeCsvContent(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const utf8Content = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (!utf8Content.includes("\uFFFD")) {
    return utf8Content;
  }
  return new TextDecoder("iso-8859-1", { fatal: false }).decode(bytes);
}
