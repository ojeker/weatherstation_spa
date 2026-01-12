import {
  FindNearestStationsUseCase,
  LoadPlacesUseCase,
  LoadTodayWeatherUseCase,
} from "@/application";
import {
  DefaultStationProvider,
  MeteoSwissStationMetaRepository,
  MeteoSwissWeatherRepository,
  SwissTopoPlaceRepository,
} from "@/infrastructure";

const stationProvider = new DefaultStationProvider();
const weatherRepository = new MeteoSwissWeatherRepository();
const placeRepository = new SwissTopoPlaceRepository();
const stationMetaRepository = new MeteoSwissStationMetaRepository();

export const loadTodayWeatherUseCase = new LoadTodayWeatherUseCase(
  stationProvider,
  weatherRepository
);
export const loadPlacesUseCase = new LoadPlacesUseCase(placeRepository);
export const findNearestStationsUseCase = new FindNearestStationsUseCase(
  stationMetaRepository
);

export { stationProvider };
