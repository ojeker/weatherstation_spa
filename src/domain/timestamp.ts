import { InvalidValueError } from "./errors";

const TIMESTAMP_PATTERN = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/;

/** Immutable UTC timestamp parsed from DD.MM.YYYY HH:mm format. */
export class Timestamp {
  private constructor(private readonly value: Date) {}

  static fromDate(date: Date): Timestamp {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
      throw new InvalidValueError("Timestamp requires a valid Date instance.");
    }

    return new Timestamp(new Date(date.getTime()));
  }

  static fromString(raw: string): Timestamp {
    if (typeof raw !== "string" || raw.trim().length === 0) {
      throw new InvalidValueError("Timestamp string is required.");
    }

    const match = TIMESTAMP_PATTERN.exec(raw.trim());
    if (!match) {
      throw new InvalidValueError(
        "Timestamp must match format DD.MM.YYYY HH:mm.",
      );
    }

    const [, day, month, year, hour, minute] = match;
    const numericDay = Number(day);
    const numericMonth = Number(month);
    const numericYear = Number(year);
    const numericHour = Number(hour);
    const numericMinute = Number(minute);

    if (
      numericMonth < 1 ||
      numericMonth > 12 ||
      numericDay < 1 ||
      numericDay > 31 ||
      numericHour < 0 ||
      numericHour > 23 ||
      numericMinute < 0 ||
      numericMinute > 59
    ) {
      throw new InvalidValueError("Timestamp contains out-of-range values.");
    }

    const utcDate = new Date(
      Date.UTC(
        numericYear,
        numericMonth - 1,
        numericDay,
        numericHour,
        numericMinute,
      ),
    );

    if (Number.isNaN(utcDate.getTime())) {
      throw new InvalidValueError("Timestamp string is not a valid date.");
    }

    return new Timestamp(utcDate);
  }

  toDate(): Date {
    return new Date(this.value.getTime());
  }

  toISOString(): string {
    return this.value.toISOString();
  }
}
