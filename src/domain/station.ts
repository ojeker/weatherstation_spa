import { InvalidValueError } from "./errors";

const ABBR_PATTERN = /^[A-Z0-9]{2,10}$/;

/** Identifies a weather station by its display abbreviation. */
export class Station {
  private constructor(readonly abbreviation: string) {}

  static create(params: { abbreviation: string }): Station {
    const abbreviation = params.abbreviation?.trim();

    if (!abbreviation) {
      throw new InvalidValueError("Station abbreviation is required.");
    }

    const normalizedAbbreviation = abbreviation.toUpperCase();
    if (!ABBR_PATTERN.test(normalizedAbbreviation)) {
      throw new InvalidValueError(
        "Station abbreviation must be 2-10 uppercase alphanumeric characters.",
      );
    }

    return new Station(normalizedAbbreviation);
  }
}
