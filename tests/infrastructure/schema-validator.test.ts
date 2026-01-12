import { describe, expect, it } from "vitest";
import { SchemaMismatchError } from "@/domain";
import {
  validateRequiredColumns,
  validateStationAbbreviation,
  CURRENT_READING_COLUMNS,
} from "@/infrastructure";

describe("validateRequiredColumns", () => {
  it("passes when all required columns exist", () => {
    const rows = [
      {
        reference_timestamp: "11.01.2026 13:20",
        tre200s0: "12.3",
        sre000z0: "8",
        rre150z0: "0.5",
        fkl010z0: "5.0",
        dkl010z0: "180",
        pp0qnhs0: "1013.25",
      },
    ];

    expect(() =>
      validateRequiredColumns(rows, CURRENT_READING_COLUMNS)
    ).not.toThrow();
  });

  it("throws SchemaMismatchError when column is missing", () => {
    const rows = [
      {
        reference_timestamp: "11.01.2026 13:20",
        tre200s0: "12.3",
        sre000z0: "8",
      },
    ];

    expect(() =>
      validateRequiredColumns(rows, CURRENT_READING_COLUMNS)
    ).toThrow(SchemaMismatchError);
  });

  it("includes missing column names in error message", () => {
    const rows = [{ reference_timestamp: "11.01.2026 13:20" }];

    expect(() =>
      validateRequiredColumns(rows, CURRENT_READING_COLUMNS)
    ).toThrow(/tre200s0/);
  });

  it("does not throw for empty rows array", () => {
    expect(() =>
      validateRequiredColumns([], CURRENT_READING_COLUMNS)
    ).not.toThrow();
  });
});

describe("validateStationAbbreviation", () => {
  it("passes when station_abbr matches expected (case-insensitive)", () => {
    const rows = [
      { station_abbr: "GOE" },
      { station_abbr: "goe" },
      { station_abbr: "Goe" },
    ];

    expect(() => validateStationAbbreviation(rows, "GOE")).not.toThrow();
  });

  it("throws SchemaMismatchError when station_abbr does not match", () => {
    const rows = [{ station_abbr: "ABC" }];

    expect(() => validateStationAbbreviation(rows, "GOE")).toThrow(
      SchemaMismatchError
    );
  });

  it("includes both expected and actual in error message", () => {
    const rows = [{ station_abbr: "ABC" }];

    expect(() => validateStationAbbreviation(rows, "GOE")).toThrow(/GOE.*ABC/);
  });

  it("skips rows without station_abbr column", () => {
    const rows = [{ other_column: "value" }];

    expect(() => validateStationAbbreviation(rows, "GOE")).not.toThrow();
  });
});
