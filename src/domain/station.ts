import { InvalidValueError } from "./errors";

const TOKEN_PATTERN = /^[a-z0-9]+$/;
const ABBR_PATTERN = /^[A-Z0-9]{2,10}$/;

/** Identifies a weather station by its unique token and display abbreviation. */
export class Station {
  private constructor(
    readonly token: string,
    readonly abbreviation: string,
  ) {}

  static create(params: { token: string; abbreviation: string }): Station {
    const token = params.token?.trim();
    const abbreviation = params.abbreviation?.trim();

    if (!token) {
      throw new InvalidValueError("Station token is required.");
    }

    if (!abbreviation) {
      throw new InvalidValueError("Station abbreviation is required.");
    }

    if (!TOKEN_PATTERN.test(token)) {
      throw new InvalidValueError(
        "Station token must be lowercase alphanumeric characters.",
      );
    }

    const normalizedAbbreviation = abbreviation.toUpperCase();
    if (!ABBR_PATTERN.test(normalizedAbbreviation)) {
      throw new InvalidValueError(
        "Station abbreviation must be 2-10 uppercase alphanumeric characters.",
      );
    }

    return new Station(token, normalizedAbbreviation);
  }
}

export const stationTokenPattern = TOKEN_PATTERN;
