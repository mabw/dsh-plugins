---
name: rich-ui-cards
description: Present structured data with ui_render interactive cards (table, 8 chart types, JSON tree) instead of markdown tables or code blocks, and collect user inputs with the prefilled ui_form confirm dialog instead of repeated questions. Use whenever the session has ui_render/ui_form tools available and the response contains comparison, statistics, ranking, distribution, trend, or any list/array data.
---

# Rich UI Cards: ui_render / ui_form Conventions

## Hard rules

1. **Never output a markdown table** when `ui_render` exists in the tool catalog. Call `ui_render kind=table` instead.
2. **Never dump JSON in a code block** when the data is nested or larger than a few lines. Call `ui_render kind=json` (collapsible tree).
3. **Never fire ask_user_question in a loop** to gather multiple parameters. Send ONE `ui_form` with every field prefilled via `default` (put your best inference there), then act on the confirmed values in a single follow-up call.
4. Text answers stay text. Cards are for DATA, not for prose.

## Chart type selection

| Data shape | kind / chart.type |
|---|---|
| Rows of records (files, repos, processes, results) | `table` |
| Compare categories by one measure | `bar` (add `stacked:true` for part-to-whole across series) |
| Trend over time / ordered sequence | `line` (use `area` when cumulative volume matters) |
| Part-to-whole proportions | `pie` / `donut` (donut shows the total in the center) |
| xy correlation (no natural labels) | `scatter` with `series[].points:[{x,y}]` |
| Progress / completion / single-dimension bars | `progress` |
| Deep or wide nested JSON (API response, tree) | `json` |

Rules of thumb: numbers → right-aligned automatically, so keep numeric columns numeric (not strings). Tables fold past 12 rows — send all rows anyway. Label axes/categories with short strings (≤10 chars render best).

## ui_form conventions

- Prefill EVERY field's `default` with your best inference; the user should be able to just click 确认.
- `fields: []` = pure confirmation dialog ("about to run X, proceed?").
- Use it before any destructive or parameter-heavy call (commands with flags, file writes, API requests).
- Return values arrive as `{status:"confirmed",values:{...}}` — use them verbatim in the next call; do not re-ask.

## Mixed responses

A response may combine: one short lead-in sentence in text + one `ui_render` card + (if action is needed) one `ui_form`. Do not narrate the card contents in text afterwards — the card IS the presentation.
