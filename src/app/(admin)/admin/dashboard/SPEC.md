# Dispatch Table — Design Spec

Design decisions agreed on during the /critique session. This is the source of
truth for the admin dispatch table; update it when the design changes.

## Columns (left to right)

`Account` · `Stream` · `Est. Lbs` · `Pref. Date` · `Scheduled` · `Status` · `Action`

Removed: `Age`, `Win.` (folded into Scheduled).

## Time windows

Vocabulary is **Morning / Afternoon** everywhere — admin table, customer
request form, anywhere a window is shown. No Evening tier (this operation
doesn't run evening pickups).

Hours are revealed on hover:
- Morning · 7am–12pm
- Afternoon · 12pm–5pm

Same vocabulary end-to-end. No translation layer between customer-facing and
admin-facing copy.

## Status

Only two statuses exist:
- `under_review` — request received, not yet scheduled. (Old `submitted` state
  is gone; new requests land directly in under review.)
- `scheduled` — committed to a date/time window.

`completed` still exists but is filtered out of the default Open view.

## Urgency coloring

### Pref. Date cell — only colored on `under_review` rows

| Days until preferred date | Color |
|---|---|
| Today or past (`≤ 0`) | red |
| 1–2 days out | yellow |
| 3+ days out | blank |

On `scheduled` rows the Pref Date is historical reference only and stays
neutral.

### Scheduled cell — only colored on `scheduled` rows

| Days until scheduled date | Color |
|---|---|
| Past 2+ days (`≤ −2`) | super red (missed pickup) |
| Yesterday or today (`−1` or `0`) | red |
| 1–3 days out | yellow |
| 4+ days out | blank |

On `under_review` rows the Scheduled cell is blank — and the blankness is the
signal that the row needs a decision.

## Smart sort (default order)

One unified ranking across all statuses, worst at top:

| Tier | Rule | Color |
|---|---|---|
| 1 | Scheduled, past 2+ days | super red |
| 2 | Under review, pref today or past | red |
| 3 | Scheduled, yesterday or today | red |
| 4 | Under review, pref 1–2 days out | yellow |
| 5 | Scheduled, 1–3 days out | yellow |
| 6 | Under review, 3+ days out | blank |
| 7 | Scheduled, 4+ days out | blank |

Within a tier, secondary sort is by the relevant date ascending:
- Under-review rows: by `preferredDate`
- Scheduled rows: by `scheduledDate`

The admin can override by clicking any column header (normal ascending/
descending sort). When a non-smart sort is active, a refresh icon appears in
the table header area — clicking it resets back to smart sort. The icon is
hidden when smart sort is already active.

## Row actions

- **Under review** → `Schedule` button (ghost style). Opens the Schedule modal.
- **Scheduled** → `Mark loaded` button (primary / filled) + a kebab (`⋯`)
  menu. Kebab menu options:
  - `Reschedule` → opens the Schedule modal pre-filled with current values
  - `Delete` → same confirm flow as the modal's Delete button
- **Shift+click `Mark loaded`** → power-user shortcut that opens Reschedule
  directly, bypassing the kebab.

## Schedule / Reschedule modal

- Pick date + time window (Morning / Afternoon).
- Two buttons:
  - **Apply** — primary, filled, dominant.
  - **Delete** — demoted (ghost/text), visually separated from Apply, deletes
    the request entirely. Triggers a confirm step ("Delete this request? This
    can't be undone.") before committing.

The visual demotion + confirm step exist because Delete and Apply sitting as
equal siblings is how someone accidentally nukes a customer's request at 4:55
on a Friday.
