import { describe, expect, it } from "vitest";
import { InvalidValueError, Timestamp } from "../../src/domain";

describe("Timestamp", () => {
  it("creates a timestamp from a valid string", () => {
    const timestamp = Timestamp.fromString("11.01.2026 13:20");

    expect(timestamp.toISOString()).toContain("2026-01-11T13:20:00.000Z");
  });

  it("rejects invalid format", () => {
    expect(() => Timestamp.fromString("2026-01-11 13:20")).toThrow(
      InvalidValueError,
    );
  });

  it("rejects invalid date values", () => {
    expect(() => Timestamp.fromString("40.01.2026 13:20")).toThrow(
      InvalidValueError,
    );
  });
});
