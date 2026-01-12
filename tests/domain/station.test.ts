import { describe, expect, it } from "vitest";
import { InvalidValueError, Station } from "../../src/domain";

describe("Station", () => {
  it("creates a station with normalized abbreviation", () => {
    const station = Station.create({ abbreviation: "GoE" });

    expect(station.abbreviation).toBe("GOE");
  });

  it("rejects empty abbreviation", () => {
    expect(() =>
      Station.create({ abbreviation: "" }),
    ).toThrow(InvalidValueError);
  });

  it("rejects invalid abbreviation", () => {
    expect(() =>
      Station.create({ abbreviation: "g" }),
    ).toThrow(InvalidValueError);
  });
});
