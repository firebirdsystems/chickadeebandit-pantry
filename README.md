# Pantry Inventory

A [Chickadee Bandit](https://chickadeebandit.com/app-library/pantry) app.

Track what's in the fridge, freezer, and pantry — quantities, expiration dates,
and what's running low. One tap pushes a depleted item straight to the **Grocery
List**. Reduces duplicate purchases and food waste.

This single app covers both the **household** use case (a family fridge/pantry
that feeds the Grocery List) and the **shared/communal** use case (a house or
org kitchen where items carry an owner label).

---

## Grocery integration

Marking an item **low** or **out** reveals a **→ Grocery** button — the single
"we need more of this" action. It appends `{ name, addedBy: "Pantry" }` to the
Grocery app's `pending_items` inbox via `crossWrite` (declared in
`data_access.writes`). The Grocery app drains that inbox on load. Requires the
Grocery app to be installed.

## Data model

- `app_pantry__items` — the communal inventory. Intentionally household/house-wide
  readable and writable (like the Grocery list); `owner_name` is an informational
  label, **not** an access boundary, so no `row_policies` are declared.

`status` (`ok`/`low`/`out`) and `category` are on the encryption skip-list;
`expiry_date` is declared plaintext so "expiring soon" can be computed in SQL.

## Quick start

```bash
npm run dev     # preview at http://localhost:3001
npm run build   # produce dist/bundle.json
npm test        # manifest + ai_access validation
```
