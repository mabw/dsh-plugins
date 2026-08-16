---
name: tasknav-workflow
description: Manage operational workflows with the task_tree tool and the task navigation dock for multi-step business processes (e.g. content operations - material selection, media processing, showcase arrangement, config publishing). Use when the session has the task_tree tool available and the work involves a multi-node workflow the user should see, click into, and make decisions on - especially when decisions must survive long conversations or compaction, or when pending user decisions need visible tracking.
---

# Tasknav Workflow: task_tree Conventions

## When to use task_tree (NOT todo_write)

- The workflow is a **business process the user operates on** (multi-node, possibly nested) — not your internal execution steps.
- The user should **see the flow, click a node, and focus the conversation** on it.
- **Decisions** must be recorded and never re-litigated (compaction-proof).
- **Pending decisions** need visible tracking (dashed badge) until the user rules.

Use todo_write for your own internal step tracking; use task_tree when the workflow belongs to the user.

## Hard rules

1. **Create the tree at workflow start**: `create` the root (the workflow name), then `add` each process step under it. Nested steps (e.g. 改标题/选海报 under 媒资加工) are `add` with `parentId`.
2. **Record EVERY user decision immediately**: the moment the user rules on anything (chose option B, approved a title, picked a poster), call `decide` with `taskId` + the decision text. Never re-ask a decided question — the tool's `context` return reminds you what is settled.
3. **Register open questions with `pend`** before asking the user (e.g. "海报二选一：官方竖版 vs 自制横版"). The dashed badge on the node tracks it; after the user answers, `decide` on the same node (pend entries are cleared on decide).
4. **Attach CLI commands**: every node that maps to a backend operation gets `cliCommand` (and `cliResult` after execution). This is the node's operational fingerprint.
5. **Keep statuses honest**: `active` when working on it, `running` while a CLI is executing, `done` when complete, `blocked` when stopped by a problem.
6. **Focus is topic lock**: when the user clicks a node in the dock (or names a task), treat that node as the conversation topic; call `task_tree action=tree` if you need the current focus and full state.
7. **The `context` field in every tool return is your anti-forgetting channel** — it carries the focused task's details and the full tree summary. Trust it over your memory of earlier turns, especially after compaction.

## Node data model

| Field | Meaning |
|---|---|
| id | stable id (create/add assign; readable ids recommended: step-1, step-2-1) |
| title / note | display name / progress notes |
| status | pending ○ · active ◆ · running ⟳ · done ✓ · blocked ✗ |
| decisions[] | {at, text} — user decisions, immutable once written |
| pendingQuestions[] | open questions awaiting user ruling |
| cliCommand / cliResult | the backend CLI this node maps to, and its result summary |
| children[] | nested sub-tasks (tree, not list) |

## Dock UI (what the user sees)

Collapsible panel above the composer: tree with status icons + colored state pills, green solid「已决策 N」badges (hover for full text), dashed pulsing「待决策 N」badges, click a node to focus (detail panel: note / CLI / decisions / pending), `N/M 完成` progress counter. Collapsed mode is one summary line.
