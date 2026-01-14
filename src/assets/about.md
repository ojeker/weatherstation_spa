# Weather Station

A web application for viewing Swiss weather station data. 

It shows temperature, precipitation, wind (speed and direction) and sunshine duration:
* of the last 10 minutes as current weather.
* of the summarized hourly values for the last 8 hours (or the hours since midnight).

## Author

[Oliver Jeker](https://github.com/ojeker)

## Data Sources

This application uses open data - many thanks to the agencies for providing it:
* [Stations and weather measurements](https://opendatadocs.meteoswiss.ch/a-data-groundbased/a1-automatic-weather-stations) from the [Swiss Federal Office of Meteorology and Climatology](https://www.meteoswiss.admin.ch).
* [Place names with postal codes](https://www.swisstopo.admin.ch/en/official-directory-of-towns-and-cities) from the [Federal Office of Topography swisstopo](https://www.swisstopo.admin.ch/en).

## AI Coding

The source code of this web application was written in [vue](https://vuejs.org/) assisted by the ai agents [Claude Code](https://claude.com/product/claude-code) and [Codex](https://chatgpt.com/codex).

## Version

1.0

Todo:
- Blatten bug
- Windrichtungen: Pfeile oder SW, NW. Wo dies platzieren, wird in mehreren ui-komponenten gebraucht
- Layouting: Eggishorn
