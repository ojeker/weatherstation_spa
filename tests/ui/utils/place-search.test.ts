import { describe, expect, it } from "vitest";
import { filterPlaces, isNumericQuery, normalizeQuery } from "@/ui/utils";

const places = [
  { plz: "8001", placeName: "Zurich", e: 0, n: 0 },
  { plz: "3011", placeName: "Bern", e: 0, n: 0 },
  { plz: "8005", placeName: "Zurich West", e: 0, n: 0 },
  { plz: "8001", placeName: "Zurich", e: 1, n: 1 },
];

describe("place search utils", () => {
  it("normalizes query by trimming and lowercasing", () => {
    expect(normalizeQuery("  Zurich ")).toBe("zurich");
  });

  it("detects numeric queries", () => {
    expect(isNumericQuery("8")).toBe(true);
    expect(isNumericQuery("800")).toBe(true);
    expect(isNumericQuery("z")).toBe(false);
  });

  it("filters by PLZ prefix when numeric", () => {
    const results = filterPlaces(places, "80");
    expect(results).toHaveLength(2);
    expect(results[0].plz).toBe("8001");
  });

  it("filters by place name prefix when alphabetic", () => {
    const results = filterPlaces(places, "ber");
    expect(results).toHaveLength(1);
    expect(results[0].placeName).toBe("Bern");
  });

  it("deduplicates results by PLZ and place name", () => {
    const results = filterPlaces(places, "zur");
    expect(results).toHaveLength(2);
    expect(results[0].plz).toBe("8001");
    expect(results[1].plz).toBe("8005");
  });

  it("returns empty list for empty query", () => {
    expect(filterPlaces(places, "")).toEqual([]);
  });
});
