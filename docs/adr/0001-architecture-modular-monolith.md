# ADR 0001: Modular Monolith Architecture with Go, SQLite, and React

## Status
Accepted

## Context
Per the Functional Design Requirements (FDR v0.1):
- The product is a **Personal Goal Execution System** based on the loop: `Define → Plan → Execute → Review → Adjust`.
- The system must prioritize **correct product behaviour > distributed architecture** (FDR §20: "The initial implementation SHOULD prefer: Modular Monolith over Microservices").
- The architecture must enforce a strict separation of concerns:
  - The Core Domain Model (`Area → Goal → Milestone → Action → Review`) must be completely testable independently of UI and infrastructure (FDR §19, §22).
  - The frontend is an independent presentation layer consuming versioned APIs (`/api/v1`) without containing domain/business validation logic (FDR §21, §23).
  - The application must support desktop and mobile browser responsive viewports with seamless touch interactions (FDR §3).

## Decision
1. **Backend**:
   - Written in Go 1.25+ organized as a Clean Architecture Modular Monolith:
     - `internal/domain`: Pure entities, value objects, goal lifecycle transitions (`Draft → Active → Paused → Completed → Abandoned`), 4-question goal contracts, progress calculation algorithms, weekly review aggregates, and commitment capacity rules. Zero external dependencies.
     - `internal/application`: Use cases, orchestrators, input validation, repository interfaces, and sample dataset seeding.
     - `internal/infrastructure/persistence/sqlite`: Pure Go SQLite persistence (`modernc.org/sqlite`) for zero-friction local execution, portability, and reliable relational integrity.
     - `internal/interfaces/http`: REST API with `go-chi/chi/v5` providing versioned `/api/v1` endpoints with standard JSON error contracts.
2. **Frontend**:
   - Modern React with TypeScript and Vite.
   - Design System built with bespoke modern Vanilla CSS (design tokens, dark/light themes, CSS variables, fluid responsive typography, glassmorphism card surfaces, and accessible touch targets >= 44px).
   - Core interactive views mapped directly to product lifecycle:
     - `Daily Focus` ("What should I focus on today?"): Instant action completion, overdue reminders, goal context badges.
     - `Goals & Planning` ("Define & Plan"): 4-question goal definition (What, Why, By When, How will I know), milestone breakdown, and transparent progress.
     - `Weekly Review` ("Review & Adjust"): 4-step guided weekly reflection workflow.
     - `Capacity & Balance`: Visual trade-off monitoring across life areas to prevent overcommitment.
3. **Database**:
   - SQLite with WAL mode enabled and foreign keys enforced, providing single-file zero-config persistence and high reliability for local and small-to-medium server deployments.

## Consequences
- **Positive**:
  - Extremely fast startup (<50ms for Go backend, instant Vite HMR for frontend).
  - No CGO required for SQLite on Apple Silicon/Linux/Windows.
  - Complete domain testability with standard `go test ./...`.
  - Zero external database services needed to clone and run the repo.
  - Clear module boundaries make future extraction or mobile client integration straightforward without changing domain rules.
- **Negative / Trade-offs**:
  - SQLite concurrent writes are serialized via WAL; sufficient for personal/single-user goal systems, but scaling to large multi-tenant cloud services would require swapping the persistence adapter to PostgreSQL (which is decoupled behind repository interfaces).
