import { CsvParseError, InvalidValueError, type Place, type PlaceRepository } from "@/domain";
import { fetchArrayBuffer } from "./http-client";
import { parseCsv } from "./csv-parser";
import { PLACE_COLUMNS, validateRequiredColumns } from "./schema-validator";
import { unzipSync } from "fflate";

const PLACES_URL =
  "https://data.geo.admin.ch/ch.swisstopo-vd.ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz_2056.csv.zip";

/** Loads places from the swisstopo ZIP dataset with caching. */
export class SwissTopoPlaceRepository implements PlaceRepository {
  private cached: Place[] | null = null;

  async getPlaces(): Promise<Place[]> {
    if (this.cached) return this.cached;

    const buffer = await fetchArrayBuffer(PLACES_URL);
    const csvContent = extractCsvContent(buffer);
    const rows = parseCsv(csvContent);

    validateRequiredColumns(rows, PLACE_COLUMNS);

    const places = rows.map((row) => {
      const plz = row["PLZ4"]?.trim() ?? "";
      const placeName = row["Ortschaftsname"]?.trim() ?? "";
      const e = parseRequiredNumber(row["E"], "E");
      const n = parseRequiredNumber(row["N"], "N");

      if (!plz) {
        throw new InvalidValueError("PLZ4 is required.");
      }

      if (!placeName) {
        throw new InvalidValueError("Ortschaftsname is required.");
      }

      return {
        plz,
        placeName,
        e,
        n,
      };
    });

    this.cached = places;
    return places;
  }
}

function extractCsvContent(buffer: ArrayBuffer): string {
  const files = unzipSync(new Uint8Array(buffer));
  const csvEntry = Object.entries(files).find(([name]) =>
    name.toLowerCase().endsWith(".csv")
  );

  if (!csvEntry) {
    throw new CsvParseError("ZIP archive does not contain a CSV file.");
  }

  const csvBytes = csvEntry[1];
  const utf8Content = new TextDecoder("utf-8", { fatal: false }).decode(
    csvBytes
  );
  if (!utf8Content.includes("\uFFFD")) {
    return utf8Content;
  }

  return new TextDecoder("iso-8859-1", { fatal: false }).decode(csvBytes);
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
