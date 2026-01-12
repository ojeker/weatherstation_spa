import { describe, expect, it } from "vitest";
import { formatDistanceKm } from "@/ui/utils";

describe("formatDistanceKm", () => {
  it("formats distances under 10km with one decimal", () => {
    expect(formatDistanceKm(3.44)).toBe("3.4 km");
  });

  it("formats distances of 10km or more without decimals", () => {
    expect(formatDistanceKm(10)).toBe("10 km");
    expect(formatDistanceKm(27.2)).toBe("27 km");
  });
});
