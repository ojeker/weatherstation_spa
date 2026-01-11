import { describe, expect, it } from "vitest";
import { CsvParseError } from "@/domain";
import { parseCsv } from "@/infrastructure";

describe("parseCsv", () => {
  it("parses semicolon-delimited CSV correctly", () => {
    const csv = `name;value;count
foo;10;1
bar;20;2`;

    const rows = parseCsv(csv);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({ name: "foo", value: "10", count: "1" });
    expect(rows[1]).toEqual({ name: "bar", value: "20", count: "2" });
  });

  it("trims whitespace from headers and values", () => {
    const csv = ` name ; value
 foo ; 10 `;

    const rows = parseCsv(csv);

    expect(rows[0]).toEqual({ name: "foo", value: "10" });
  });

  it("handles Windows line endings (CRLF)", () => {
    const csv = "name;value\r\nfoo;10\r\nbar;20";

    const rows = parseCsv(csv);

    expect(rows).toHaveLength(2);
  });

  it("skips empty lines", () => {
    const csv = `name;value

foo;10

bar;20
`;

    const rows = parseCsv(csv);

    expect(rows).toHaveLength(2);
  });

  it("throws CsvParseError for empty content", () => {
    expect(() => parseCsv("")).toThrow(CsvParseError);
  });

  it("throws CsvParseError for empty header row", () => {
    expect(() => parseCsv(";;;")).toThrow(CsvParseError);
  });

  it("returns empty array for header-only CSV", () => {
    const csv = "name;value;count";

    const rows = parseCsv(csv);

    expect(rows).toHaveLength(0);
  });

  it("handles missing values in rows", () => {
    const csv = `a;b;c
1;2`;

    const rows = parseCsv(csv);

    expect(rows[0]).toEqual({ a: "1", b: "2", c: "" });
  });
});
