import { describe, it, expect } from "vitest";
import { CATEGORIES, CAT_LABEL, statusFor, daysUntil, visibleItems, searchableFields, failureLine } from "../src/logic.js";

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

describe("failureLine", () => {
  const words = { action: "save the item", thing: "item" };
  const err = (props, message = "hub text") => Object.assign(new Error(message), props);

  it("names a duplicate by its code, or by the hub's text where production lags", () => {
    expect(failureLine(err({ status: 400, code: "UNIQUE_CONSTRAINT" }), words)).toBe("That item already exists.");
    expect(failureLine(err({ status: 400 }, "UNIQUE constraint failed: x.id"), words)).toBe("That item already exists.");
  });
  it("says a refusal is a refusal", () => {
    expect(failureLine(err({ status: 403 }), words)).toBe("You don’t have permission to save the item.");
  });
  it("says storage is full", () => {
    expect(failureLine(err({ status: 507 }), words)).toBe("The household’s storage is full — free up space first.");
  });
  it("says a gone row is gone", () => {
    expect(failureLine(err({ status: 404 }), words)).toBe("This item has been removed.");
    expect(failureLine(err({ outcome: "removed" }), words)).toBe("This item has been removed.");
  });
  it("says a row someone else changed was changed", () => {
    expect(failureLine(err({ status: 409 }), words)).toBe("This item was changed by someone else — check it first.");
    expect(failureLine(err({ outcome: "changed" }), words)).toBe("This item was changed by someone else — check it first.");
  });
  it("says an unguarded write whose row is still there was refused, not changed", () => {
    expect(failureLine(err({ outcome: "refused" }), words)).toBe("You don’t have permission to save the item.");
  });
  it("asks for a retry when the re-read after changed: 0 failed", () => {
    expect(failureLine(new Error("write changed nothing"), words)).toBe("Couldn’t save the item — try again.");
  });
  it("asks for a retry only when retrying can work, never showing the hub's text", () => {
    for (const props of [{}, { status: 400 }, { status: 500 }, { status: 503 }, { status: 200 }]) {
      expect(failureLine(err(props, "Database request failed (503)"), words)).toBe("Couldn’t save the item — try again.");
    }
    expect(failureLine(new TypeError("Failed to fetch"), words)).toBe("Couldn’t save the item — try again.");
    expect(failureLine(undefined, words)).toBe("Couldn’t save the item — try again.");
  });
});
