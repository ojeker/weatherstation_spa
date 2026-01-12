import type { Place } from "@/domain";

export function normalizeQuery(input: string): string {
  return input.trim().toLowerCase();
}

export function isNumericQuery(query: string): boolean {
  return /^[0-9]/.test(query);
}

export function filterPlaces(places: readonly Place[], query: string): Place[] {
  const normalized = normalizeQuery(query);
  if (!normalized) return [];

  if (isNumericQuery(normalized)) {
    return dedupePlaces(
      places.filter((place) => place.plz.startsWith(normalized))
    );
  }

  return dedupePlaces(
    places.filter((place) =>
      place.placeName.toLowerCase().startsWith(normalized)
    )
  );
}

function dedupePlaces(places: readonly Place[]): Place[] {
  const seen = new Set<string>();
  const unique: Place[] = [];

  for (const place of places) {
    const key = `${place.plz}::${place.placeName}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(place);
  }

  return unique;
}
