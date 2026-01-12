import type { Place, StationDistance, StationMetaRepository } from "@/domain";

/** Use case for computing nearest stations by planar LV95 distance. */
export class FindNearestStationsUseCase {
  constructor(private readonly stationMetaRepository: StationMetaRepository) {}

  async execute(place: Place): Promise<StationDistance[]> {
    const stations = await this.stationMetaRepository.getStations();

    const distances = stations.map((station) => ({
      station,
      distanceKm: computeDistanceKm(place, station),
    }));

    distances.sort((a, b) => {
      if (a.distanceKm !== b.distanceKm) {
        return a.distanceKm - b.distanceKm;
      }
      return a.station.name.localeCompare(b.station.name);
    });

    return distances.slice(0, 10);
  }
}

function computeDistanceKm(place: Place, station: { e: number; n: number }) {
  const dx = station.e - place.e;
  const dy = station.n - place.n;
  const distanceM = Math.sqrt(dx * dx + dy * dy);
  return distanceM / 1000;
}
