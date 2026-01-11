import { describe, expect, it } from "vitest";
import { InvalidValueError, Station } from "../../src/domain";

describe("Station", () => {
  it("creates a station with normalized abbreviation", () => {
    const station = Station.create({ token: "goe", abbreviation: "GoE" });

    expect(station.token).toBe("goe");
    expect(station.abbreviation).toBe("GOE");
  });

  it("rejects empty token", () => {
    expect(() =>
      Station.create({ token: "", abbreviation: "GOE" }),
    ).toThrow(InvalidValueError);
  });

  it("rejects non-lowercase token", () => {
    expect(() =>
      Station.create({ token: "GoE", abbreviation: "GOE" }),
    ).toThrow(InvalidValueError);
  });

  it("rejects invalid abbreviation", () => {
    expect(() =>
      Station.create({ token: "goe", abbreviation: "g" }),
    ).toThrow(InvalidValueError);
  });
});
