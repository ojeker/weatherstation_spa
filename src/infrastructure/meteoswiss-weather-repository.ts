import type {
  Reading,
  Station,
  TodayWeather,
  WeatherRepository,
} from "@/domain";
import { fetchText } from "./http-client";
import { parseCsv } from "./csv-parser";
import {
  CURRENT_READING_COLUMNS,
  HOURLY_READING_COLUMNS,
  validateRequiredColumns,
  validateStationAbbreviation,
} from "./schema-validator";
import { mapCurrentReading, mapHourlyReading } from "./row-mapper";
import { filterTodayReadings } from "./zurich-time";

const BASE_URL = "https://data.geo.admin.ch/ch.meteoschweiz.ogd-smn";

function buildCurrentUrl(token: string): string {
  return `${BASE_URL}/${token}/ogd-smn_${token}_t_now.csv`;
}

function buildHourlyUrl(token: string): string {
  return `${BASE_URL}/${token}/ogd-smn_${token}_h_now.csv`;
}

/** MeteoSwiss implementation of WeatherRepository. */
export class MeteoSwissWeatherRepository implements WeatherRepository {
  constructor(private readonly now: Date = new Date()) {}

  async getTodayWeather(station: Station): Promise<TodayWeather> {
    const [currentData, hourlyData] = await Promise.all([
      this.fetchCurrentReadings(station),
      this.fetchHourlyReadings(station),
    ]);

    const todayCurrent = filterTodayReadings(currentData, this.now);
    const todayHourly = filterTodayReadings(hourlyData, this.now);

    const sortedHourly = [...todayHourly].sort(
      (a, b) => a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime()
    );

    const current =
      todayCurrent.length > 0
        ? todayCurrent.reduce((latest, reading) =>
            reading.timestamp.toDate().getTime() >
            latest.timestamp.toDate().getTime()
              ? reading
              : latest
          )
        : null;

    return {
      current,
      hourly: sortedHourly,
    };
  }

  private async fetchCurrentReadings(station: Station): Promise<Reading[]> {
    const url = buildCurrentUrl(station.token);
    const content = await fetchText(url);
    const rows = parseCsv(content);

    validateRequiredColumns(rows, CURRENT_READING_COLUMNS);
    validateStationAbbreviation(rows, station.abbreviation);

    return rows.map(mapCurrentReading);
  }

  private async fetchHourlyReadings(station: Station): Promise<Reading[]> {
    const url = buildHourlyUrl(station.token);
    const content = await fetchText(url);
    const rows = parseCsv(content);

    validateRequiredColumns(rows, HOURLY_READING_COLUMNS);
    validateStationAbbreviation(rows, station.abbreviation);

    return rows.map(mapHourlyReading);
  }
}
