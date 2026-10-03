# Goal Operating System (GoalOS)

> **A personal goal execution system that connects everyday actions to meaningful outcomes.**

[![Go Version](https://img.shields.io/badge/Go-1.25+-00ADD8?style=flat&logo=go)](https://go.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite)](https://vite.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL-003B57?style=flat&logo=sqlite)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 1. Product Intent

Most productivity applications optimize for:
> **“What tasks do I have?”**

GoalOS optimizes for:
> **“What outcomes am I trying to create, and is my daily behaviour moving me toward them?”**

The product loop is:

```
┌─────────┐      ┌────────┐      ┌─────────┐      ┌────────┐      ┌────────┐
│ Define  ├─────►│  Plan  ├─────►│ Execute ├─────►│ Review ├─────►│ Adjust │
└─────────┘      └────────┘      └─────────┘      └────────┘      └────────┘
```

1. **Define**: Establish meaningful outcomes answering the 4 core questions (What, Why, By When, How will I know).
2. **Plan**: Deconstruct the outcome into tangible milestone checkpoints and execution actions.
3. **Execute**: Daily focus view with 1-click frictionless completion and traceability back to your "Why".
4. **Review**: First-class weekly reflection ritual examining wins, friction, and missed commitments.
5. **Adjust**: Adapt habits, schedules, and capacity based on real evidence rather than guilt.

---

## 2. Architecture & Design Principles

Built as a **Modular Monolith** in accordance with [FDR v0.1](docs/FDR.md) and [ADR 0001](docs/adr/0001-architecture-modular-monolith.md):

```
                   ┌────────────────────────────────────────┐
                   │    Web Application (React 19 + Vite)   │
                   │    Bespoke Vanilla CSS Design System   │
                   └───────────────────┬────────────────────┘
                                       │
                               HTTP REST / JSON
                                (/api/v1/...)
                                       │
                   ┌───────────────────▼────────────────────┐
                   │       Go Backend (Modular Monolith)     │
                   ├────────────────────────────────────────┤
                   │  Domain Layer (Pure Business Rules)    │
                   │  - Area, Goal, Milestone, Action       │
                   │  - Weekly Review & Reflection          │
                   │  - Capacity & Trade-off Analyzer       │
                   ├────────────────────────────────────────┤
                   │  Application Layer (Use Cases)         │
                   ├────────────────────────────────────────┤
                   │  Interfaces (Chi HTTP REST API)        │
                   ├────────────────────────────────────────┤
                   │  Infrastructure (SQLite + WAL Mode)    │
                   └───────────────────┬────────────────────┘
                                       │
                   ┌───────────────────▼────────────────────┐
                   │       SQLite Database (data/*.db)      │
                   └────────────────────────────────────────┘
```

### Key Architectural Tenets
* **Clean Domain Independence**: Core domain entities and lifecycle rules have zero dependencies on HTTP or databases and are 100% unit-tested independently.
* **Separation of Concerns**: The frontend is a pure presentation layer consuming versioned APIs (`/api/v1`).
* **Traceability Everywhere**: Every action carries its parent milestone and goal context so the user never executes in a vacuum.
* **Capacity & Balance Protection**: The system actively monitors active commitments across life areas to prevent uncontrolled goal accumulation.

---

## 3. Core Domain Hierarchy

```
Area (Life Organization)
 └─► Goal (Outcome + 4 Questions)
      └─► Milestone (Checkpoint toward goal)
           └─► Action (Concrete execution with due date, priority, effort)
```

### The 4 Goal Questions Contract (FDR §6)
Every goal must answer:
1. **What?** (e.g. *"Become capable of building production-grade Go services"*)
2. **Why?** (e.g. *"Transition to senior distributed systems engineering and lead high-throughput microservice architecture."*)
3. **By when?** (Target date)
4. **How will I know I succeeded?** (Measurable or qualitative criteria for victory)

---

## 4. Repository Structure

```
Betterment/
├── docs/
│   ├── FDR.md                           # Functional Design Requirements contract
│   └── adr/
│       └── 0001-architecture-modular-monolith.md # Architectural Decision Record
├── backend/
│   ├── cmd/server/main.go               # Go server entrypoint & graceful shutdown
│   ├── internal/
│   │   ├── domain/                      # Pure domain entities, value objects & tests
│   │   │   ├── area.go
│   │   │   ├── goal.go
│   │   │   ├── milestone.go
│   │   │   ├── action.go
│   │   │   ├── review.go
│   │   │   ├── tradeoff.go
│   │   │   └── domain_test.go
│   │   ├── application/                 # Services, orchestrators & realistic seed data
│   │   │   ├── service.go
│   │   │   ├── seed.go
│   │   │   └── service_test.go
│   │   ├── infrastructure/persistence/sqlite/ # SQLite schema, WAL pragmas & repository
│   │   │   ├── db.go
│   │   │   ├── schema.go
│   │   │   └── repository.go
│   │   └── interfaces/http/             # Chi REST router, handlers, and JSON errors
│   │       ├── router.go
│   │       └── handlers.go
│   ├── go.mod
│   └── go.sum
├── frontend/
│   ├── src/
│   │   ├── api/client.ts                # Typed client for backend /api/v1 endpoints
│   │   ├── types/index.ts               # Domain contracts matching backend models
│   │   ├── styles/index.css             # Vanilla CSS design system & dark/light tokens
│   │   ├── components/
│   │   │   ├── Layout.tsx               # Responsive layout & mobile bottom navigation
│   │   │   ├── DailyFocusView.tsx       # Daily actions, overdue banner & 1-tap toggling
│   │   │   ├── GoalsView.tsx            # Outcome cards with 4 questions snapshot
│   │   │   ├── GoalDetailModal.tsx      # Deep-dive milestones & nested actions manager
│   │   │   ├── NewGoalModal.tsx         # 4-Question goal wizard
│   │   │   ├── NewActionModal.tsx       # Action scheduler with milestone traceability
│   │   │   ├── WeeklyReviewView.tsx     # 4-Step guided weekly reflection ritual
│   │   │   └── BalanceView.tsx          # Capacity & trade-off analyzer across life areas
│   │   ├── App.tsx                      # Master application container
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts                   # Vite config with backend proxy (:8080)
│   └── index.html                       # SEO metadata & Google Fonts (Inter + Outfit)
├── Makefile                             # Orchestration commands
├── package.json                         # Root convenience scripts
└── README.md
```

---

## 5. Getting Started

### Prerequisites
* **Go** 1.25+ (`go version`)
* **Node.js** 20+ & **npm** (`node -v`)

### Quick Start (Run Both in Development)

Clone the repository and run:

```bash
make dev
```

Or using npm:
```bash
npm run dev
```

* **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
* **Backend API Server**: [http://localhost:8080/api/v1/health](http://localhost:8080/api/v1/health)

*(Note: Realistic sample goals, milestones, actions, and a past weekly review are automatically seeded on initial launch! You can also click the **Demo Data** button in the header at any time).*

### Running Services Independently

**Start Backend**:
```bash
make backend-dev
# or: cd backend && go run ./cmd/server
```

**Start Frontend**:
```bash
make frontend-dev
# or: cd frontend && npm run dev
```

---

## 6. Running Tests

Run all unit tests across both backend and frontend:

```bash
make test
```

### Backend Domain & Service Tests:
```bash
cd backend && go test -v ./...
```

### Frontend Typechecking & Production Build:
```bash
cd frontend && npm run build
```

---

## 7. API Reference (`/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service health status |
| `GET` | `/api/v1/areas` | List life areas (Career, Health, etc.) |
| `POST` | `/api/v1/areas` | Create a new life area |
| `GET` | `/api/v1/goals` | List goals (supports `?status=` and `?areaId=`) |
| `POST` | `/api/v1/goals` | Define new goal with the 4 questions |
| `GET` | `/api/v1/goals/{id}` | Goal detail with milestones & actions |
| `PATCH` | `/api/v1/goals/{id}/status` | Transition lifecycle (`Active`, `Paused`, `Completed`, etc.) |
| `PATCH` | `/api/v1/goals/{id}/progress` | Update goal progress percentage |
| `DELETE` | `/api/v1/goals/{id}` | Delete goal and cascade |
| `POST` | `/api/v1/milestones` | Create milestone checkpoint under goal |
| `PATCH` | `/api/v1/milestones/{id}/toggle` | Toggle milestone completion |
| `DELETE` | `/api/v1/milestones/{id}` | Delete milestone |
| `GET` | `/api/v1/actions/daily` | Get actions for daily focus with full context |
| `POST` | `/api/v1/actions` | Create concrete action traceable to milestone & goal |
| `PATCH` | `/api/v1/actions/{id}/toggle` | 1-click toggle action completion |
| `DELETE` | `/api/v1/actions/{id}` | Delete action |
| `GET` | `/api/v1/reviews` | List past and active weekly reviews |
| `POST` | `/api/v1/reviews/start` | Start weekly review ritual |
| `POST` | `/api/v1/reviews/{id}/complete`| Finalize review with reflection answers |
| `GET` | `/api/v1/capacity` | Multi-goal workload & trade-off metrics |
| `POST` | `/api/v1/seed` | Seed realistic demo dataset |

---

## 8. Product Philosophy & Explicit Exclusions (FDR §26)

GoalOS adheres to strict product boundaries:
* **No Jira/Backlog Bloat**: Technical sprint/velocity jargon is forbidden.
* **No Artificial Gamification**: No competitive leaderboards, streak anxiety, or manipulative notifications.
* **Activity != Outcome**: Completing 10 tasks does not automatically equal mastery; reflection is required.
* **Start Simple**: A person can create their first goal in 30 seconds without configuring complex workspaces.
