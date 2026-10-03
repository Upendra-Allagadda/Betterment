# Goal Operating System

## Functional Design Requirements (FDR)

**Document status:** Proposed  
**Version:** 0.1  
**Product form:** Responsive Web Application  
**Primary audience:** General consumers  
**Document purpose:** Define the product contract for what the system accepts, what it does, what it explicitly does not do, and the principles that govern future development.

---

# 1. Product Intent

The product is a **personal goal execution system**.

Its purpose is not merely to store goals or tasks.

It should help a person answer:

> **What am I trying to achieve, why does it matter, what should I do next, and am I actually making progress?**

The core product loop is:

**Define → Plan → Execute → Review → Adjust**

The system should connect everyday actions to meaningful outcomes.

---

# 2. Product Thesis

Most productivity applications optimize for:

**“What tasks do I have?”**

This product optimizes for:

**“What outcomes am I trying to create, and is my daily behaviour moving me toward them?”**

Therefore:

### The system IS

* Goal-oriented
* Outcome-oriented
* Action-oriented
* Progress-aware
* Review-driven
* Designed for ordinary users
* Simple enough for daily use
* Extensible enough to support AI later

### The system IS NOT

* A generic Jira clone
* A generic Todo application
* A project-management application for enterprises
* A calendar replacement
* A habit-tracking-only application
* A note-taking application
* A social network
* An AI chatbot with a productivity UI attached

---

# 3. Platform Contract

## Accepted

The first product will be a **web application**.

It MUST:

* Work in modern desktop browsers.
* Work on mobile browsers.
* Use responsive UI.
* Support touch interaction on small screens.
* Preserve a consistent experience across desktop and mobile browsers.

The architecture SHOULD allow a future mobile application to consume the same backend APIs.

## Not Accepted for MVP

Native Android application.

Native iOS application.

Separate mobile backend.

Desktop application.

Browser extensions.

These may be considered later without changing the core domain model.

---

# 4. Core User

The primary user is a normal individual who wants to improve something in their life.

Examples:

* Career
* Health
* Learning
* Finance
* Personal projects
* Relationships
* Travel
* Creative work
* General self-development

The system MUST NOT assume that the user is a software engineer.

Technical concepts such as:

* sprint
* backlog
* epic
* story
* velocity
* burndown

must not be required to use the product.

---

# 5. Core Domain Model

The initial domain MUST be intentionally small.

The core hierarchy is:

**Area → Goal → Milestone → Action**

Where:

### Area

A broad area of life.

Examples:

* Career
* Health
* Learning
* Finance

An Area provides organization but does not represent achievement.

### Goal

A meaningful outcome the user wants to achieve.

A goal SHOULD contain:

* Title
* Description
* Area
* Start date
* Target date
* Success definition
* Progress
* Status

A goal must represent an **outcome**, not merely an activity.

Bad:

> Learn Go

Better:

> Become capable of building production-grade Go services

### Milestone

A meaningful checkpoint toward the goal.

Example:

Goal:

> Become capable of building production-grade Go services

Milestones:

* Learn Go fundamentals
* Build concurrent service
* Build gRPC service
* Build Kafka integration
* Deploy a production-style service

### Action

A concrete thing the user can do.

Example:

> Implement a Kafka consumer using Sarama

Actions are the execution layer.

---

# 6. Goal Contract

A goal MUST answer four questions:

1. **What?**
2. **Why?**
3. **By when?**
4. **How will I know I succeeded?**

A goal SHOULD have a measurable success definition whenever measurement makes sense.

The system MUST allow qualitative goals where strict numeric measurement is inappropriate.

Example:

> Read 20 books this year.

is measurable.

But:

> Become more confident communicating at work.

may require qualitative review rather than a numeric score.

The product MUST NOT force every aspect of human improvement into artificial numbers.

---

# 7. Progress Contract

Progress must represent meaningful advancement.

The system SHOULD support:

* Percentage progress
* Milestone completion
* Action completion
* Target-based progress
* Manual progress adjustment where necessary

The system MUST distinguish:

**Activity**

from

**Outcome**

Example:

Completing 10 study sessions does not automatically mean the user achieved mastery.

Therefore the system MUST NOT blindly equate:

`tasks completed = goal achieved`

Progress aggregation must remain transparent.

---

# 8. Daily Execution

The system MUST provide a simple daily view.

The user should be able to answer:

> **What should I focus on today?**

The daily experience SHOULD surface:

* Today's actions
* Overdue actions
* Important milestones
* Goals needing attention

The user SHOULD be able to complete an action with minimal interaction.

The product MUST avoid forcing users through a complex workflow for simple task completion.

---

# 9. Planning

A user MUST be able to convert a goal into actionable work.

Minimum flow:

**Goal → Milestones → Actions**

The system SHOULD allow actions to have:

* Due date
* Priority
* Estimated effort
* Status
* Notes

Actions MUST remain traceable to their parent milestone and goal.

This traceability is a core product requirement.

---

# 10. Review

The product MUST have a review mechanism.

At minimum:

### Weekly Review

The user should be able to see:

* What was completed
* What was not completed
* Goal progress
* Missed commitments
* Important changes
* User reflection

The system SHOULD encourage the user to identify:

> What worked?

> What did not work?

> What should change next week?

Review is a first-class feature, not an analytics page.

---

# 11. Goal Lifecycle

A goal MUST have a lifecycle.

Recommended states:

`Draft → Active → Paused → Completed → Abandoned`

Rules:

* Draft goals are not part of active execution.
* Active goals appear in planning and daily execution.
* Paused goals remain preserved but should not dominate daily work.
* Completed goals become historical records.
* Abandoned goals remain available for historical learning.

The system MUST NOT delete completed history simply because a goal is no longer active.

---

# 12. User Experience Principles

The system MUST follow these principles:

### Principle 1 — Start simple

A new user should be able to create their first meaningful goal without needing to configure a complex workspace.

### Principle 2 — Progressive complexity

Advanced functionality should appear only when needed.

### Principle 3 — Action over administration

Users should spend more time doing than maintaining the system.

### Principle 4 — Context everywhere

An action should be traceable back to the reason it exists.

### Principle 5 — Reflection matters

The system is not successful merely because users complete tasks.

It should help users understand whether their actions are producing meaningful progress.

---

# 13. AI Boundary

AI is **not a prerequisite for the MVP**.

The domain model MUST remain useful without AI.

AI may later assist with:

* Goal clarification
* Breaking goals into milestones
* Generating action suggestions
* Detecting unrealistic plans
* Weekly reviews
* Identifying stalled goals
* Recommending next actions
* Summarizing progress
* Detecting conflicts between goals

AI MUST initially remain an assistant.

AI MUST NOT silently:

* Change user goals
* Delete actions
* Change commitments
* Mark achievements
* Make consequential decisions for the user

AI-generated changes SHOULD require user review/approval.

---

# 14. Notifications

Notifications are secondary to execution.

MVP SHOULD avoid notification overload.

Accepted:

* Important deadline reminders
* Overdue action reminders
* Review reminders

Not accepted initially:

* Gamified notification spam
* Artificial engagement notifications
* Continuous productivity nudging
* Notifications designed primarily to maximize app usage

The product should improve productivity rather than maximize screen time.

---

# 15. Gamification Boundary

Gamification is not part of the MVP.

Not accepted initially:

* Leaderboards
* Public rankings
* Competitive scoring
* Streak obsession
* Rewards designed to manipulate engagement

Possible future experimentation may exist, but it must not compromise the core product philosophy.

---

# 16. Multi-Goal Management

Users will often have multiple goals.

The system MUST support multiple active goals.

However, the product SHOULD help users avoid uncontrolled goal accumulation.

The system SHOULD make trade-offs visible.

Example:

A user may have:

* Career goal
* Fitness goal
* Learning goal
* Financial goal

The system should help identify whether the user has created more commitments than they can realistically execute.

This is an important differentiator from ordinary task managers.

---

# 17. Data Ownership

User-created data is fundamental.

The system SHOULD provide:

* Exportability
* Clear ownership semantics
* Reliable persistence
* No destructive action without explicit user intent

Deleting a goal should not unexpectedly destroy unrelated history.

---

# 18. Security & Privacy

The product MUST:

* Authenticate users securely.
* Authorize access to user-owned resources.
* Prevent cross-user data access.
* Protect sensitive user data.
* Avoid exposing personal data through APIs.
* Log security-relevant events appropriately.

Privacy SHOULD be considered a product feature, not merely an infrastructure concern.

---

# 19. Non-Functional Requirements

The application SHOULD target:

### Performance

Typical user interactions should feel immediate.

### Reliability

Persisted user data must not be casually lost.

### Scalability

The initial architecture should comfortably support the expected MVP scale without premature distributed-system complexity.

### Observability

Important backend operations SHOULD produce sufficient logs and metrics for diagnosis.

### Testability

Core domain rules MUST be testable independently of UI and infrastructure.

### Accessibility

The web application SHOULD follow modern accessibility practices and avoid relying exclusively on color or visual cues.

---

# 20. Architecture Boundary

The initial implementation SHOULD prefer:

**Modular Monolith over Microservices**

Reason:

The product is still discovering its domain.

The initial engineering priority is:

**correct product behaviour > distributed architecture**

The system SHOULD have clear internal boundaries so that modules can later be extracted if justified.

The architecture MUST NOT introduce microservices merely because the application contains multiple domains.

---

# 21. Frontend Contract

The frontend is a separate presentation layer.

It MUST NOT contain business rules that need to be trusted for correctness.

The UI SHOULD consume backend contracts through well-defined APIs.

The UI SHOULD remain replaceable.

Therefore:

**React/Next.js/etc. is an implementation decision, not a domain decision.**

The FDR defines behaviour, not framework preference.

---

# 22. Backend Contract

The backend owns:

* Authentication
* Authorization
* Goal rules
* Progress rules
* Goal lifecycle
* Milestone relationships
* Action relationships
* Review data
* Persistence

Business rules SHOULD live in the domain/application layer rather than controllers.

APIs MUST be versionable.

---

# 23. API Contract

APIs MUST:

* Have explicit request/response contracts.
* Return predictable error structures.
* Validate input.
* Enforce authorization.
* Avoid leaking implementation details.

Breaking API changes MUST be explicitly reviewed.

---

# 24. Definition of Done

A feature is NOT considered complete merely because:

* Code compiles.
* UI exists.
* API returns 200.
* Happy-path demo works.

A feature is complete only when:

**Requirement → Implementation → Test → Documentation**

are aligned.

For user-facing functionality, acceptance criteria MUST exist.

For architecturally significant changes, an ADR SHOULD exist.

For significant behavioural changes, this FDR or an associated requirement MUST be updated.

---

# 25. Change Control

This document is the **product boundary contract**.

A developer MUST NOT introduce a feature simply because:

> “It would be useful.”

A proposed change must answer:

1. Which user problem does this solve?
2. Is it consistent with the product thesis?
3. Does it belong in the current product scope?
4. What existing behaviour does it affect?
5. Does it introduce significant complexity?
6. Does it require an architectural decision?

Changes that alter architectural direction SHOULD be captured in an ADR.

Accepted architectural decisions should not be silently rewritten; a new decision should supersede the old one when the direction changes.

---

# 26. Explicit MVP Exclusions

The following are OUT OF SCOPE for the first product version:

* Native mobile applications
* Social features
* Team collaboration
* Enterprise administration
* Public goal sharing
* Leaderboards
* Complex habit systems
* Calendar replacement
* Full project management
* Time tracking as a primary feature
* AI agents performing autonomous actions
* Marketplace
* Integrations with dozens of external services
* Microservice decomposition solely for architectural appearance

---

# 27. MVP Success Criteria

The MVP should answer one fundamental question:

> **Can a normal person define a meaningful goal, turn it into actionable work, execute that work, and understand whether they are making progress?**

The MVP succeeds when a user can complete this loop:

**Create Goal**

↓

**Define Success**

↓

**Create Milestones**

↓

**Create Actions**

↓

**Execute Actions**

↓

**Review Progress**

↓

**Adjust Plan**

That loop is more important than the number of features.

---

# 28. Engineering Rule

When deciding between:

**more features**

and

**a simpler product that users can consistently use**

prefer the simpler product.

When deciding between:

**architectural sophistication**

and

**faster validation of the domain**

prefer faster validation.

When deciding between:

**convenience**

and

**correctness of the goal/progress model**

prefer correctness.

---

# 29. Initial Product Architecture Direction

The initial system should conceptually contain:

```text
                ┌───────────────────┐
                │   Web Application  │
                └─────────┬─────────┘
                          │
                    HTTP / API
                          │
                ┌─────────▼─────────┐
                │    Application     │
                │      Backend      │
                ├───────────────────┤
                │ Identity           │
                │ Goals              │
                │ Milestones         │
                │ Actions            │
                │ Reviews            │
                └─────────┬─────────┘
                          │
                ┌─────────▼─────────┐
                │     Database       │
                └───────────────────┘
```

This is intentionally simple.

The architecture can evolve after actual product usage reveals real boundaries.

---

# 30. Contract Summary

The product is fundamentally:

> **A system that helps people translate meaningful goals into realistic actions and continuously learn whether those actions are producing the intended outcomes.**

Anything that strengthens that loop is a candidate.

Anything that distracts from that loop requires strong justification.

The system must remain:

**Simple enough to use.  
Structured enough to be useful.  
Measurable without becoming mechanical.  
Intelligent without becoming autonomous.  
Extensible without becoming over-engineered.**

---

**FDR status:** PROPOSED

This document becomes the baseline against which future product and architectural decisions are evaluated.
