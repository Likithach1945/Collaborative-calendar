# Research & Decision Log

Date: 2025-10-16
Feature: Calendar Application Core
Branch: 001-calendar-application-with

## Overview
This document captures architectural and technology decisions for the MVP, resolving any potential ambiguities. Each decision includes rationale and alternatives considered.

## Decisions

### D-001: Frontend Framework -> React + Vite
- Decision: Use React 18 with Vite build tooling.
- Rationale: Fast dev server (ESBuild/Rollup), native TS/JS support, easy code-splitting, strong ecosystem for accessibility and performance tooling.
- Alternatives Considered:
  - Next.js: SSR/ISR benefits not required for authenticated calendar views; adds complexity.
  - Angular: Heavier runtime and opinionated structure; slower iteration for MVP.
  - SvelteKit: Smaller ecosystem for enterprise integrations (OAuth libs, complex date libs).

### D-002: Backend Platform -> Spring Boot (Java 17)
- Decision: Use Spring Boot for REST API + OAuth2 client integration.
- Rationale: Mature ecosystem, robust OAuth2 support, data access simplicity via Spring Data JPA, production-ready metrics/actuator.
- Alternatives Considered:
  - Quarkus/Micronaut: Faster startup, smaller memory but team familiarity lower.
  - Node.js (Express/Nest): Would unify language but weaker static typing without TS and less robust ICS/timezone libs server-side.

### D-003: Authentication -> Google OAuth 2.0
- Decision: Implement Google OAuth 2.0 using Spring Security OAuth2 client; frontend initiates flow, backend handles token exchange.
- Rationale: User requirement; reduces password management; widely adopted.
- Alternatives Considered: Generic email/password (security overhead), other IdPs (Okta/Auth0) introduce cost complexity.

### D-004: Database -> MySQL 8
- Decision: Persist events, invitations, users in MySQL with Flyway migrations.
- Rationale: Relational model suits event/invitation relationships; widely available; team familiarity.
- Alternatives Considered: PostgreSQL (solid choice; parity; selection based on existing infra), MongoDB (weak relational integrity for invitations and proposals).

### D-005: Timezone Handling -> java.time + IANA tz + date-fns client-side
- Decision: Normalize server times to UTC, store user/event timezone strings (IANA), convert on display using date-fns (frontend) and java.time (backend).
- Rationale: Ensures consistency; avoids DST errors; widely supported.
- Alternatives Considered: Moment.js (deprecated), Luxon (larger bundle), custom logic (risk-prone).

### D-006: ICS Parsing -> ical4j Library
- Decision: Use ical4j for robust RFC 5545 compliance.
- Rationale: Mature ICS handling (recurrence expansion, validation).
- Alternatives Considered: Custom parser (time intensive), other Java libs less maintained.

### D-007: Suggestion Algorithm -> Constraint-based Slot Intersections
- Decision: Generate suggestions by intersecting free-busy windows across participants, applying duration & working-hour filters, sorted by earliest start.
- Rationale: Deterministic, predictable, low complexity for <=10 participants.
- Alternatives Considered: Heuristic scoring (complex), ML-based predictions (overkill for MVP).

### D-008: Video Conferencing -> Google Meet Only (MVP)
- Decision: Provide meet link generation/insertion only for Google Meet.
- Rationale: Simplifies integration; aligns with Google OAuth context.
- Alternatives Considered: Zoom/MS Teams (additional OAuth flows), generic link input (less automation).

### D-009: Reminder Strategy -> Single 10-Minute Pre-Event Reminder
- Decision: One reminder scheduled server-side (or via client push) 10 minutes before start.
- Rationale: Minimal complexity; meets MVP requirement.
- Alternatives Considered: Multi-layer customizable reminders (UI complexity), notification providers (cost/integration overhead).

### D-010: Recurring Suggestions -> Deferred
- Decision: Exclude recurring meeting suggestion logic from MVP; only handle recurrence on import.
- Rationale: Complexity vs value; foundation needed first.
- Alternatives Considered: Implement recurrence grid search now (risks schedule slip).

### D-011: Offline Capability -> Cached Events & Manifest
- Decision: Cache recent events (next/previous 7 days) in IndexedDB + service worker for offline read; disable writes offline.
- Rationale: Meets PWA responsive requirement; minimal complexity.
- Alternatives Considered: Full sync engine (complex state reconciliation), no offline (violates constitution).

### D-012: API Spec Format -> OpenAPI 3.1
- Decision: Define REST endpoints in a single OpenAPI 3.1 document used for code generation (future) and contract tests.
- Rationale: Interoperability, tooling support (Swagger UI, generators).
- Alternatives Considered: GraphQL (could unify data retrieval but adds schema negotiation; overkill early), gRPC (not needed for browser).

### D-013: Deployment Packaging -> Docker Images
- Decision: Containerize backend (JDK 17 distroless or alpine) and serve frontend as static assets behind CDN / reverse proxy.
- Rationale: Standard portability; easy local dev with docker-compose.
- Alternatives Considered: Serverless (cold starts for Java), monolithic jar only (harder horizontal scaling).

### D-014: Caching Strategy -> Application-Level In-Memory (MVP)
- Decision: Use simple in-memory caching for availability windows during suggestion computation; consider Redis later.
- Rationale: Low complexity; small participant count.
- Alternatives Considered: Redis cluster (premature), no caching (potential repeated heavy queries).

## Open Questions (None)
All initial clarifications resolved per spec (FR-013..FR-015). No NEEDS CLARIFICATION items remain.

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| ICS recurrence expansion performance | Slow import on large files | Stream parse + batch DB writes; measure with profiling |
| OAuth token misuse | Security vulnerability | Use Spring Security defaults, store minimal session state, short-lived tokens |
| Timezone DST edge cases | Incorrect meeting times | Rely strictly on IANA database, unit tests around DST transitions |
| Suggestion algorithm scalability | Slow for >10 participants | Cap participants; add Redis + optimization later |
| Offline cache staleness | User sees outdated events offline | Display "Last synced" timestamp; disable editing offline |

## Summary of Architecture
Frontend SPA (React + Vite) communicating with Spring Boot REST API; events & invitations stored in MySQL; ICS import handled server-side; suggestion engine intersects normalized availability; service worker enables offline read caching; OpenAPI contracts drive integration tests.

## Next Phase
Proceed to Phase 1: data-model.md generation, API contracts creation, quickstart.md.
