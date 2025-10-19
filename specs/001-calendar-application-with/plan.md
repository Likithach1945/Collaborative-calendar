# Implementation Plan: Calendar Application Core

**Branch**: `001-calendar-application-with` | **Date**: 2025-10-16 | **Spec**: `specs/001-calendar-application-with/spec.md`
**Input**: Feature specification from `specs/001-calendar-application-with/spec.md`

## Summary
Deliver a responsive, accessible calendar application enabling Google OAuth 2.0 authentication, day/week event views with timezone normalization, event creation & invitations, availability checking with intelligent time suggestions, ICS import, recipient response tracking, and propose-new-time workflow. Frontend: React + Vite (JavaScript) with PWA/service worker, component-driven architecture. Backend: Java 17 + Spring Boot, REST APIs, MySQL persistence, timezone & ICS parsing libraries. Non-functional goals: WCAG 2.1 AA, Core Web Vitals (LCP <2.5s, CLS <0.1, FID/INP <100ms), suggestion latency <3s for <=10 participants, ICS import 500 events <8s, response propagation <2s.

## Technical Context

**Language/Version**: Frontend: JavaScript (ES2023) / React 18; Backend: Java 17 (Spring Boot)  
**Primary Dependencies**: Frontend: React, React Router, TanStack Query (data fetching), date-fns (time operations), i18next (intl), service worker tooling (Workbox). Backend: Spring Boot (web, security, data JPA), Spring Security OAuth2 Client (Google), MySQL Connector/J, Flyway (migrations), Jackson, ical4j (ICS parsing), JSR-310 (java.time), MapStruct (DTO mapping).  
**Storage**: MySQL 8 (events, invitations, users, availability cache). Redis (optional future for suggestion caching) NOT in MVP.  
**Testing**: Frontend: Vitest + React Testing Library + Playwright (later). Backend: JUnit 5, Spring Boot Test, Testcontainers (MySQL) for integration, RestAssured for contract tests.  
**Target Platform**: Web (desktop/tablet/mobile) + JVM backend on Linux container (Docker).  
**Project Type**: Web application (separate frontend + backend).  
**Performance Goals**: Suggestion generation <3s (<=10 participants), ICS import 500 events <8s, day/week view initial render <1.5s (<=200 events/week), login <5s (95%); API p95 latency <300ms for core endpoints under nominal load (50 RPS).  
**Constraints**: Must operate offline for viewing previously cached events; PWA installable; accessibility WCAG 2.1 AA; Core Web Vitals thresholds; memory footprint backend <512MB container; avoid vendor lock-in beyond Google OAuth.  
**Scale/Scope**: MVP target: 5k users, events per user average 1k/year, concurrent active users 200, participants per scheduling action <=10.

## Constitution Check (Pre-Design Gate)
| Principle | Requirement Translation | Current Plan Compliance | Status |
|-----------|-------------------------|-------------------------|--------|
| Responsive-First | Mobile-first layouts, breakpoints (320/768/1024), touch targets >=44px | React component library with CSS Grid/Flex + design tokens | PASS |
| PWA Features | Service worker, offline cache for events, manifest, install prompt | Vite build with Workbox; events cached via IndexedDB | PASS |
| Accessibility WCAG 2.1 AA | Semantic HTML, keyboard nav, aria, contrast checks | Adopt RTL tests + axe; design tokens enforce contrast | PASS |
| Performance Standards | Core Web Vitals thresholds, code-splitting, image optimization | Vite splitting, lazy routes, WebP pipeline | PASS |
| Component Architecture | Reusable components, scoped styles, unidirectional data flow | React + hooks + TanStack Query; module boundaries | PASS |

Gate Result: PROCEED (no violations).

## Project Structure

### Documentation (this feature)
```
specs/001-calendar-application-with/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md            # (to be generated later by /speckit.tasks)
```

### Source Code (repository root - planned)
```
backend/
├── src/main/java/com/example/calendar/
│   ├── config/
│   ├── auth/
│   ├── events/
│   ├── invitations/
│   ├── availability/
│   ├── suggestion/
│   ├── ics/
│   ├── shared/
│   └── CalendarApplication.java
├── src/main/resources/
│   ├── application.yml
│   └── db/migration/   # Flyway scripts
└── tests/ (JUnit + Testcontainers)

frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── calendar/
│   │   ├── events/
│   │   ├── invitations/
│   │   └── accessibility/
│   ├── pages/
│   │   ├── DayViewPage.tsx
│   │   ├── WeekViewPage.tsx
│   │   ├── EventDetailPage.tsx
│   │   └── LoginCallbackPage.tsx
│   ├── services/       # API clients (TanStack Query hooks)
│   ├── store/          # Lightweight state (if needed)
│   ├── assets/         # Icons, images (WebP)
│   ├── sw/             # Service worker source
│   └── index.tsx
├── public/manifest.json
└── tests/ (Vitest + RTL)

contracts/              # Generated OpenAPI spec & schema artifacts
infrastructure/         # Dockerfiles, docker-compose, k8s (future)
scripts/                # Dev/setup scripts
```

**Structure Decision**: Adopt dual-project web app (frontend + backend) for clear separation of concerns, enabling independent deploy/release cadences, aligning with constitution's component architecture and performance optimization. Shared contracts reside under `contracts/` consumed by both sides.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | N/A | Single monorepo sections adequate; no extra repos created |

## Phase 1 Outputs
Artifacts generated:
- `research.md` (D-001..D-014 decisions)
- `data-model.md` (entities, relationships, state machines)
- `contracts/openapi.yaml` (OpenAPI 3.1 spec v0.1.0)
- `quickstart.md` (setup & run instructions)

## Constitution Check (Post-Design)
| Principle | Verification Post-Design | Status |
|-----------|--------------------------|--------|
| Responsive-First | Data model unaffected; quickstart emphasizes multi-device; UI components planned with breakpoints | PASS |
| PWA Features | quickstart documents service worker + offline caching scope | PASS |
| Accessibility | Testing strategy includes axe + keyboard nav; semantic component planning | PASS |
| Performance | Targets codified in summary & quickstart; suggestion algo scoped (<10 participants) | PASS |
| Component Architecture | Frontend structure modular; backend package segmentation defined | PASS |

Gate Result After Design: PROCEED (Ready for tasks generation).

