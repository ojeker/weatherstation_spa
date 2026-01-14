import { Station, type StationProvider } from "@/domain";

const STORAGE_KEY = "weatherstation_lastStation";

/** Default station provider with localStorage persistence. */
export class DefaultStationProvider implements StationProvider {
  private station: Station;

  constructor() {
    this.station = this.loadStation();
  }

  getStation(): Station {
    return this.station;
  }

  setStation(station: Station): void {
    this.station = station;
    this.saveStation(station);
  }

  hasStoredStation(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }

  private loadStation(): Station {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return Station.create({ abbreviation: saved });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return Station.create({ abbreviation: "GOE" });
  }

  private saveStation(station: Station): void {
    localStorage.setItem(STORAGE_KEY, station.abbreviation);
  }
}
