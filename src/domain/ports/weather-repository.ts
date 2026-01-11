import type { Station } from "../station";
import type { TodayWeather } from "../today-weather";

/** Port for fetching weather data for a station. */
export interface WeatherRepository {
  getTodayWeather(station: Station): Promise<TodayWeather>;
}
