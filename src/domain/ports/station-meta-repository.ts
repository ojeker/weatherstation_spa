import type { StationMeta } from "../station-meta";

/** Port for loading station metadata for nearest-station selection. */
export interface StationMetaRepository {
  getStations(): Promise<StationMeta[]>;
}
