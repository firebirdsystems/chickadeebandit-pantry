import { describe, it, expect } from "vitest";
import { CATEGORIES, CAT_LABEL, statusFor, daysUntil, visibleItems, searchableFields } from "../src/logic.js";

describe("statusFor", () => {
  it("out when quantity is zero or less", () => {
    expect(statusFor(0, 2)).toBe("out");
    expect(statusFor(-1, 2)).toBe("out");
  });
  it("low at or below the low threshold", () => {
    expect(statusFor(2, 2)).toBe("low");
    expect(statusFor(1, 2)).toBe("low");
  });
  it("ok above the threshold", () => {
    expect(statusFor(5, 2)).toBe("ok");
  });
});

describe("daysUntil", () => {
  it("null for blank or invalid", () => {
    expect(daysUntil("", "2026-07-08")).toBe(null);
    expect(daysUntil("not-a-date", "2026-07-08")).toBe(null);
  });
  it("counts days ahead and behind", () => {
    expect(daysUntil("2026-07-11", "2026-07-08")).toBe(3);
    expect(daysUntil("2026-07-05", "2026-07-08")).toBe(-3);
    expect(daysUntil("2026-07-08", "2026-07-08")).toBe(0);
  });
});

describe("visibleItems", () => {
  const items = [
    { id: "1", category: "fridge", status: "ok" },
    { id: "2", category: "pantry", status: "low" },
    { id: "3", category: "freezer", status: "out" },
  ];
  it("all returns everything", () => expect(visibleItems(items, "all")).toHaveLength(3));
  it("low returns non-ok items", () => {
    expect(visibleItems(items, "low").map(i => i.id)).toEqual(["2", "3"]);
  });
  it("category views filter by category", () => {
    expect(visibleItems(items, "fridge").map(i => i.id)).toEqual(["1"]);
  });
});

describe("constants", () => {
  it("label every category", () => {
    for (const c of CATEGORIES) expect(CAT_LABEL[c]).toBeTruthy();
  });
});

describe("searchableFields", () => {
  it("matches on the note and the owner, not just the item name", () => {
    const fields = searchableFields({
      name: "Oat milk", category: "fridge", note: "barista, do not use for cereal",
      owner_name: "Sam", unit: "carton",
    });
    expect(fields).toContain("Sam");
    expect(fields).toContain("barista, do not use for cereal");
  });
});
