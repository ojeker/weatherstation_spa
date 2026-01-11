import type { Station } from "../station";

/** Port for obtaining the current station to display. */
export interface StationProvider {
  getStation(): Station;
}
