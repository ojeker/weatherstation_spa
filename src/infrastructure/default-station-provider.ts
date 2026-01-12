import { Station, type StationProvider } from "@/domain";

/** Default station provider returning GOE (Zurich-Fluntern). */
export class DefaultStationProvider implements StationProvider {
  private station = Station.create({
    abbreviation: "GOE",
  });

  getStation(): Station {
    return this.station;
  }

  setStation(station: Station): void {
    this.station = station;
  }
}
