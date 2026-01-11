import { Station, type StationProvider } from "@/domain";

/** Default station provider returning GOE (Zurich-Fluntern). */
export class DefaultStationProvider implements StationProvider {
  private readonly station = Station.create({
    token: "goe",
    abbreviation: "GOE",
  });

  getStation(): Station {
    return this.station;
  }
}
