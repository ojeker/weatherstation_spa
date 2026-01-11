import { LoadTodayWeatherUseCase } from "@/application";
import {
  DefaultStationProvider,
  MeteoSwissWeatherRepository,
} from "@/infrastructure";

const stationProvider = new DefaultStationProvider();
const weatherRepository = new MeteoSwissWeatherRepository();

export const loadTodayWeatherUseCase = new LoadTodayWeatherUseCase(
  stationProvider,
  weatherRepository
);

export { stationProvider };
