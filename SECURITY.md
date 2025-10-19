# Security & Secret Management

## Overview
This document outlines how secrets are handled in the Calendar application. No real secrets should be committed to the repository. Environment variables are used for all sensitive configuration.

## Sensitive Variables (Backend)
- DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_PASSWORD
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI
- JWT_SECRET, JWT_EXPIRATION_MS
- REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD
- ALLOWED_ORIGINS, ALLOWED_METHODS

## Sensitive Variables (Frontend Build-Time)
- VITE_API_BASE_URL (not a secret but environment-specific)
- VITE_GOOGLE_CLIENT_ID (public identifier) — Never expose client *secret* here

## Files
- `.env.example` contains placeholders only.
- `.env` is ignored via `.gitignore` and must not be committed.

## Adding New Secrets
1. Add a placeholder to `.env.example`.
2. Reference via `${ENV_NAME:devFallback}` in `application.properties` or use `@Value` in code.
3. Set real value only in deployment platform (Render, local `.env`).

## Rotation Procedure
1. Revoke compromised credential (Google Console, DB, JWT key source).
2. Issue new credential and update environment variable in deployment.
3. If secret was committed: clean history (git filter-repo), force push (if allowed), document rotation.

## Git History Cleanup
If a secret appears in commit history:
```
pip install git-filter-repo
# Replace strings
printf "oldSecret=newSecretPlaceholder" > secret-replacements.txt
git filter-repo --replace-text secret-replacements.txt
# Or remove file entirely
# git filter-repo --path backend/src/main/resources/application.properties --invert-paths
```
Force push only if acceptable:
```
git push origin --force --all
```
Rotate the exposed secret regardless of cleanup.

## Pre-Push Checklist
- [ ] No plaintext secrets in tracked files (`grep -R "GOCSPX" .` etc.).
- [ ] `.env` not staged (`git status`).
- [ ] New sensitive config uses env var indirection.
- [ ] Dependencies scanned (optional: `trufflehog filesystem --directory=.`).
- [ ] JWT secret length > 64 chars in production.
- [ ] Google OAuth redirect URIs set for production domain.
- [ ] CORS origins restricted to required domains.
- [ ] DB user has least privileges (no SUPER/GRANT unnecessarily).
- [ ] Logs do NOT print secrets (search: `password`, `secret`, `Bearer`).

## Deployment (Render)
Set all required env vars in the Render dashboard (never commit them):
- Backend service: DB_*, GOOGLE_*, JWT_*, REDIS_* (if used), SMTP_*, ALLOWED_ORIGINS, ALLOWED_METHODS, SPRING_PROFILES=prod
- Frontend service: VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID, VITE_ENVIRONMENT=production

## Incident Response (Leak)
1. Identify exposed secret & scope.
2. Revoke and rotate credentials immediately.
3. Audit access logs for misuse.
4. Document incident in repo (ISSUE or SECURITY log).
5. Perform git history scrub if necessary.

## Recommended Tools
- `trufflehog` for secret scanning
- `git-secrets` or pre-commit hook
- Dependency updates via Dependabot

## Content Security Policy (CSP)
Adjust CSP in `SecurityHeadersConfig` if frontend domain changes. Keep external origin lists minimal.

## Future Improvements
- Add Vault/Parameter Store integration.
- Use build-time secret injection for multi-env deploy pipelines.
- Integrate automated secret scans in CI.

---
Maintained by: Security owner / Dev team
Last updated: 2025-10-19
