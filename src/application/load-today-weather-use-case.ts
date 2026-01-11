import type {
  StationProvider,
  TodayWeather,
  WeatherRepository,
} from "@/domain";

/** Use case for loading today's weather for the current station. */
export class LoadTodayWeatherUseCase {
  constructor(
    private readonly stationProvider: StationProvider,
    private readonly weatherRepository: WeatherRepository
  ) {}

  async execute(): Promise<TodayWeather> {
    const station = this.stationProvider.getStation();
    return this.weatherRepository.getTodayWeather(station);
  }
}
