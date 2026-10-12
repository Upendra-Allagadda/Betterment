## Summary of Changes

<!-- Briefly describe the outcome this pull request achieves and the rationale behind the change. -->

## Goal / Epic Reference
- **Parent Goal / Epic:** <!-- e.g., "Goals as Jira-Style Epics & Task Progress Traceability" -->
- **Life Area:** <!-- e.g., Career, Health, Learning, Finance -->

## Type of Change
- [ ] 🚀 New Feature (non-breaking change which adds functionality)
- [ ] 🎨 UI / Design Enhancement (clean state boundaries, typography, accessibility)
- [ ] 🐛 Bug Fix (non-breaking fix resolving an issue)
- [ ] 📚 Documentation Update (FDR, README, ADRs)
- [ ] ⚙️ CI / Tooling / Repository Configuration

---

## State Boundary & UI Verification (Jira Epic Model)
- [ ] **Clear State Boundaries:** States (`Draft`, `Active/In Progress`, `Paused`, `Completed`) have unambiguous visual badges and state transition triggers.
- [ ] **Goal Progress on Tasks:** Each child task explicitly displays its parent goal's progress percentage (e.g. `80% Goal Progress`).
- [ ] **Clickable Goals:** Goals behave like Epics—clickable anywhere to inspect detailed roadmap, contract, and child tasks.
- [ ] **Calm & Structured Design:** No visual clutter, excessive neon effects, or cognitive overload; clear borders and structured alignment.

---

## Verification & Testing Checklist
- [ ] `go test -v ./...` passes with zero errors
- [ ] `npm run build` compiles cleanly with zero TypeScript errors
- [ ] Manual smoke testing in browser on both desktop and mobile viewports
- [ ] All code strictly adheres to clean architecture (domain independence, SQLite WAL persistence)

---

> **Merge Policy Reminder:** Direct pushes to `main` are prohibited. All code merges must happen exclusively through reviewed Pull Requests.
