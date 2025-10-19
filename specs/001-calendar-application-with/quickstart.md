# Quickstart
Calendar Application Core - MVP Setup
Date: 2025-10-16

## Prerequisites
- Node.js 20.x (for frontend) & npm or pnpm
- Java 17 JDK
- Maven 3.9+ (or Gradle alternative later) – assuming Maven initially
- MySQL 8 instance (local docker or remote) with database `calendar_app`
- Google Cloud project with OAuth 2.0 credentials (Client ID & Client Secret)

## Environment Variables
Backend `.env` or OS vars:
```
DB_URL=jdbc:mysql://localhost:3306/calendar_app
DB_USERNAME=calendar_user
DB_PASSWORD=changeMe
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH_REDIRECT_URI=https://localhost:8443/auth/callback/google
JWT_SECRET=changeThisSecret
```

Frontend `.env` (Vite uses `VITE_` prefix):
```
VITE_API_BASE=https://localhost:8443/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Backend Setup
```
# Clone repo (placeholder) & enter backend directory
cd backend

# Create Flyway migration script (example)
# V1__init.sql -> tables users, events, invitations

# Run tests (after added)
mvn test

# Run service (dev)
mvn spring-boot:run
```
Backend available at `https://localhost:8443` (enable HTTPS dev config or use HTTP for local).

## Frontend Setup
```
cd frontend
npm install
npm run dev
```
Dev server default: `http://localhost:5173`

## Service Worker & PWA
- Build generates `dist/` with service worker registration.
- Manifest at `public/manifest.json` includes icons & display settings.
- Offline: Cache last/next 7 days events via IndexedDB; show offline banner when network lost.

## Running Full Stack With Docker (Future)
```
# Example docker-compose snippet (to be created):
version: '3.9'
services:
  db:
    image: mysql:8
    environment:
      MYSQL_DATABASE: calendar_app
      MYSQL_ROOT_PASSWORD: root
    ports: ['3306:3306']
  backend:
    build: ./backend
    environment:
      DB_URL: jdbc:mysql://db:3306/calendar_app
      DB_USERNAME: root
      DB_PASSWORD: root
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      JWT_SECRET: ${JWT_SECRET}
    depends_on: [db]
    ports: ['8443:8443']
  frontend:
    build: ./frontend
    environment:
      VITE_API_BASE: https://localhost:8443/v1
    ports: ['5173:80']
```

## Common Workflows
| Task | Command |
|------|---------|
| Start backend | `mvn spring-boot:run` |
| Start frontend | `npm run dev` |
| Build frontend | `npm run build` |
| Run backend tests | `mvn test` |
| Lint frontend | `npm run lint` (after config) |

## Authentication Flow
1. Frontend launches Google OAuth via `/auth/login/google` redirect.
2. User consents; Google redirects to backend `/auth/callback/google`.
3. Backend exchanges code, creates session/JWT.
4. Frontend stores token (httpOnly cookie or secure storage) and loads calendar data.

## API Contract
OpenAPI spec at `specs/001-calendar-application-with/contracts/openapi.yaml`.
Use for generating typed clients (future step).

## Validation & Testing Strategy
- Unit tests (backend): services, time conversions, ICS parsing.
- Contract tests: verify OpenAPI-defined responses for core endpoints.
- Frontend unit tests: components & accessibility (axe). 
- End-to-end (future): Playwright for auth + scheduling flow.

## Performance Profiling (MVP Targets)
- Suggestion endpoint measured with 10 participants & 200 events each.
- ICS import measured with file of 500 events including recurrence expansions.

## Accessibility Checks
Use `@axe-core/react` in dev to flag issues; ensure keyboard navigation across calendar grid and dialogs.

## Next Steps
- Implement entities & migrations.
- Implement authentication & session issuance.
- Implement event CRUD + invitation creation.
- Implement availability & suggestion algorithm.
- Implement ICS import endpoint.
- Integrate frontend pages progressively.

## Notes
Security hardening (CSRF, CORS configuration) required before production. HTTPS termination recommended via reverse proxy.
