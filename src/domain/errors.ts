/** Base error class for all domain-level errors. */
export class DomainError extends Error {
  readonly cause?: unknown;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = this.constructor.name;
    this.cause = options?.cause;
  }
}

/** Thrown when a value fails domain validation rules. */
export class InvalidValueError extends DomainError {}

/** Thrown when an HTTP request fails. */
export class NetworkError extends DomainError {}

/** Thrown when CSV content cannot be parsed. */
export class CsvParseError extends DomainError {}

/** Thrown when CSV schema is invalid (missing columns or station mismatch). */
export class SchemaMismatchError extends DomainError {}

/** Thrown when no data exists for the requested day. */
export class NoDataForTodayError extends DomainError {}
