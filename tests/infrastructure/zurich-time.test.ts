import { describe, expect, it } from "vitest";
import { Timestamp } from "@/domain";
import {
  getZurichTodayStart,
  getZurichTodayEnd,
  isZurichToday,
  filterTodayReadings,
} from "@/infrastructure";

describe("getZurichTodayStart", () => {
  it("returns midnight in Zurich as UTC", () => {
    // January 11, 2026 14:00 UTC = 15:00 Zurich (CET, UTC+1)
    const now = new Date("2026-01-11T14:00:00Z");

    const start = getZurichTodayStart(now);

    // Midnight Zurich on Jan 11 = 23:00 UTC on Jan 10
    expect(start.toISOString()).toBe("2026-01-10T23:00:00.000Z");
  });

  it("handles summer time (CEST, UTC+2)", () => {
    // July 15, 2026 14:00 UTC = 16:00 Zurich (CEST, UTC+2)
    const now = new Date("2026-07-15T14:00:00Z");

    const start = getZurichTodayStart(now);

    // Midnight Zurich on Jul 15 = 22:00 UTC on Jul 14
    expect(start.toISOString()).toBe("2026-07-14T22:00:00.000Z");
  });
});

describe("getZurichTodayEnd", () => {
  it("returns 23:59:59.999 in Zurich as UTC", () => {
    const now = new Date("2026-01-11T14:00:00Z");

    const end = getZurichTodayEnd(now);

    // 23:59:59.999 Zurich on Jan 11 = 22:59:59.999 UTC on Jan 11
    expect(end.toISOString()).toBe("2026-01-11T22:59:59.999Z");
  });
});

describe("isZurichToday", () => {
  it("returns true for timestamps within Zurich today", () => {
    const now = new Date("2026-01-11T14:00:00Z");
    const timestamp = new Date("2026-01-11T10:00:00Z"); // 11:00 Zurich

    expect(isZurichToday(timestamp, now)).toBe(true);
  });

  it("returns false for timestamps from yesterday in Zurich", () => {
    const now = new Date("2026-01-11T14:00:00Z");
    const timestamp = new Date("2026-01-10T10:00:00Z"); // yesterday in Zurich

    expect(isZurichToday(timestamp, now)).toBe(false);
  });

  it("handles edge case: just before midnight Zurich", () => {
    const now = new Date("2026-01-11T14:00:00Z");
    // 22:59 UTC on Jan 11 = 23:59 Zurich on Jan 11 (still today)
    const justBeforeMidnight = new Date("2026-01-11T22:59:00Z");

    expect(isZurichToday(justBeforeMidnight, now)).toBe(true);
  });

  it("handles edge case: just after midnight Zurich", () => {
    const now = new Date("2026-01-11T14:00:00Z");
    // 23:01 UTC on Jan 11 = 00:01 Zurich on Jan 12 (tomorrow)
    const justAfterMidnight = new Date("2026-01-11T23:01:00Z");

    expect(isZurichToday(justAfterMidnight, now)).toBe(false);
  });
});

describe("filterTodayReadings", () => {
  it("filters readings to only those from today in Zurich", () => {
    const now = new Date("2026-01-11T14:00:00Z");

    const readings = [
      { timestamp: Timestamp.fromString("11.01.2026 13:20") }, // today
      { timestamp: Timestamp.fromString("10.01.2026 13:20") }, // yesterday
      { timestamp: Timestamp.fromString("11.01.2026 09:00") }, // today
    ];

    const filtered = filterTodayReadings(readings, now);

    expect(filtered).toHaveLength(2);
    expect(filtered[0].timestamp.toISOString()).toContain("2026-01-11");
    expect(filtered[1].timestamp.toISOString()).toContain("2026-01-11");
  });

  it("returns empty array when no readings match today", () => {
    const now = new Date("2026-01-12T14:00:00Z");

    const readings = [
      { timestamp: Timestamp.fromString("11.01.2026 13:20") },
      { timestamp: Timestamp.fromString("10.01.2026 13:20") },
    ];

    const filtered = filterTodayReadings(readings, now);

    expect(filtered).toHaveLength(0);
  });
});
