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

/**
 * Fields the in-app search matches against (see hub-sdk `searchMatch`).
 * The note and the owner's name count as well as the item name — a
 * pantry is searched for "Sam's oat milk" as often as for "milk".
 */
export function searchableFields(item) {
  return [item.name, item.category, item.note, item.owner_name, item.unit];
}

/**
 * The line a failed write shows. "Try again" only where retrying can work: a
 * refusal or a gone row says what happened. `e.status` / `e.code` come from the
 * request helper; `e.outcome` is set by a caller that re-read after a write
 * changed nothing: "removed" (no row), "refused" (an unguarded `WHERE id = ?`
 * write whose row is still there: the row policy narrowed it), or "changed"
 * (a guarded write whose row moved). No outcome (the re-read failed) asks for a
 * retry. The hub's own text is never shown.
 */
export function failureLine(e, { action, thing }) {
  if (e?.code === "UNIQUE_CONSTRAINT" || /UNIQUE constraint failed/i.test(e?.message ?? "")) return `That ${thing} already exists.`;
  if (e?.status === 403 || e?.outcome === "refused") return `You don’t have permission to ${action}.`;
  if (e?.status === 507) return "The household’s storage is full — free up space first.";
  if (e?.outcome === "removed" || e?.status === 404) return `This ${thing} has been removed.`;
  if (e?.outcome === "changed" || e?.status === 409) return `This ${thing} was changed by someone else — check it first.`;
  return `Couldn’t ${action} — try again.`;
}
