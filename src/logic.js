// Pure, testable logic extracted from index.html.
// No DOM, no network — safe to import from Node for unit tests.

export const CATEGORIES = ["fridge", "freezer", "pantry", "other"];
export const CAT_LABEL = { fridge: "Fridge", freezer: "Freezer", pantry: "Pantry", other: "Other" };

export function statusFor(quantity, low) {
  const q = Number(quantity) || 0;
  if (q <= 0) return "out";
  if (q <= (Number(low) || 0)) return "low";
  return "ok";
}

// Whole days from `todayStr` (YYYY-MM-DD) until `dateStr`, or null if unparseable.
export function daysUntil(dateStr, todayStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T12:00:00`);
  if (isNaN(d)) return null;
  return Math.round((d - new Date(`${todayStr}T12:00:00`)) / 86400000);
}

export function visibleItems(items, view) {
  if (view === "low") return items.filter(i => i.status !== "ok");
  if (view === "all") return items;
  return items.filter(i => i.category === view);
}
