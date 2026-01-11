const ZURICH_TIMEZONE = "Europe/Zurich";

/** Returns the start of today (00:00:00) in Europe/Zurich as a UTC Date. */
export function getZurichTodayStart(now: Date = new Date()): Date {
  const zurichDateStr = now.toLocaleDateString("en-CA", {
    timeZone: ZURICH_TIMEZONE,
  });
  const [year, month, day] = zurichDateStr.split("-").map(Number);

  const zurichMidnight = new Date(
    new Date(year, month - 1, day).toLocaleString("en-US", {
      timeZone: ZURICH_TIMEZONE,
    })
  );

  const utcOffset = getZurichUtcOffset(new Date(year, month - 1, day));
  return new Date(Date.UTC(year, month - 1, day, -utcOffset));
}

/** Returns the end of today (23:59:59.999) in Europe/Zurich as a UTC Date. */
export function getZurichTodayEnd(now: Date = new Date()): Date {
  const start = getZurichTodayStart(now);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

/** Gets the UTC offset for Zurich in hours (positive means ahead of UTC). */
function getZurichUtcOffset(date: Date): number {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const zurichDate = new Date(
    date.toLocaleString("en-US", { timeZone: ZURICH_TIMEZONE })
  );
  return (zurichDate.getTime() - utcDate.getTime()) / (60 * 60 * 1000);
}

/** Checks if a UTC date falls within "today" in Europe/Zurich. */
export function isZurichToday(utcDate: Date, now: Date = new Date()): boolean {
  const start = getZurichTodayStart(now);
  const end = getZurichTodayEnd(now);
  const timestamp = utcDate.getTime();
  return timestamp >= start.getTime() && timestamp <= end.getTime();
}

/** Filters readings to only those from "today" in Europe/Zurich. */
export function filterTodayReadings<T extends { timestamp: { toDate(): Date } }>(
  readings: T[],
  now: Date = new Date()
): T[] {
  return readings.filter((r) => isZurichToday(r.timestamp.toDate(), now));
}
