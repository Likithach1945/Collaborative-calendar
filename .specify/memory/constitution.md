<!--
  SYNC IMPACT REPORT:
  Version change: Initial → 1.0.0
  Added principles:
  - I. Responsive-First Design (mobile-first approach mandatory)
  - II. Progressive Web App Features (PWA capabilities required)
  - III. Accessibility Standards (WCAG compliance non-negotiable)
  - IV. Performance Standards (core web vitals compliance)
  - V. Component-Based Architecture (reusable component design)
  Added sections:
  - Web Standards Compliance
  - Development Workflow
  Templates requiring updates: ✅ All templates reviewed and aligned
  Follow-up TODOs: None - all placeholders filled
-->

# Calendar Application Constitution

## Core Principles

### I. Responsive-First Design
All features MUST be designed mobile-first with progressive enhancement for larger screens. Breakpoints MUST be defined for mobile (320px+), tablet (768px+), and desktop (1024px+). Touch targets MUST be minimum 44px for mobile compatibility. Fluid layouts using CSS Grid and Flexbox are required.

### II. Progressive Web App Features
Application MUST support offline functionality, service workers for caching, and installable PWA capabilities. Web app manifest MUST be present with appropriate icons and metadata. Critical functionality MUST work offline with appropriate fallback states.

### III. Accessibility Standards (NON-NEGOTIABLE)
WCAG 2.1 AA compliance is mandatory for all UI components. Semantic HTML MUST be used. All interactive elements MUST be keyboard navigable. Color contrast ratios MUST meet 4.5:1 minimum. Screen reader compatibility is required with proper ARIA labels and roles.

### IV. Performance Standards
Core Web Vitals MUST meet Google's recommended thresholds: LCP < 2.5s, FID < 100ms, CLS < 0.1. Images MUST be optimized with WebP format and lazy loading. JavaScript bundles MUST be code-split and tree-shaken. Critical CSS MUST be inlined.

### V. Component-Based Architecture
All UI elements MUST be built as reusable components with clear interfaces. Components MUST be self-contained with minimal external dependencies. Styling MUST be scoped to components. State management MUST follow unidirectional data flow patterns.

## Web Standards Compliance

Modern web standards MUST be followed including HTML5 semantic elements, CSS3 features with appropriate fallbacks, and ES6+ JavaScript with transpilation for older browsers. Browser support MUST include last 2 versions of major browsers (Chrome, Firefox, Safari, Edge).

## Development Workflow

Feature development MUST follow mobile-first responsive design principles. All features MUST be tested across target breakpoints and devices. Performance audits MUST be conducted using Lighthouse. Accessibility testing MUST be performed with automated tools and manual keyboard navigation.

## Governance

This constitution supersedes all other development practices. All pull requests MUST verify compliance with responsive design, PWA capabilities, accessibility standards, performance requirements, and component architecture. Any exceptions MUST be documented with technical justification. Updates to this constitution require team approval and impact assessment.

**Version**: 1.0.0 | **Ratified**: 2025-10-16 | **Last Amended**: 2025-10-16