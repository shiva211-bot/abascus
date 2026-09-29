# Abascus Architecture — Phase 1

## 1. Verified starting state

Repository: `shiva211-bot/abascus`

At Phase 1 start:
- Default branch: `main`
- Repository visibility: public
- Repository contents: empty
- Existing application framework: none
- Existing package manager: none
- Existing routes/components: none
- Existing database/authentication: none
- Existing CI/CD: none
- Existing WebGL engine: none

Therefore this phase is an architecture bootstrap, not a retrofit audit.

## 2. Product boundary

The platform is intended to support a high-performance 3D holographic exhibition experience, project discovery/detail pages, project/deployment metadata, authentication, account management, project management, search/filter/navigation, security/authorization, SEO/accessibility/compliance, and automated testing/production verification.

No fake project records, deployment health, users, metrics, reviews, or security claims are created in Phase 1.

## 3. System layers

```text
Browser
  |
  +-- Next.js App Router
  |     +-- Server-rendered application shell
  |     +-- Client interaction boundaries
  |     +-- API/route boundaries
  |
  +-- Pure Three.js WebGL engine
  |     +-- Scene / Camera / Renderer
  |     +-- Shader/material systems
  |     +-- Particle/sub-agent systems
  |     +-- Input/scroll interaction
  |
  +-- Application services
  |     +-- Authentication
  |     +-- Projects
  |     +-- Search
  |     +-- Deployment metadata
  |
  +-- Persistence
  |     +-- Database
  |     +-- File/media storage
  |
  +-- External systems
        +-- Deployment providers
        +-- Optional analytics/telemetry
        +-- Email/auth providers where required
```

## 4. Route architecture reserved

- `/` — exhibition landing experience
- `/projects` — project discovery
- `/projects/[slug]` — project exhibition/detail
- `/login` — authentication
- `/signup` — registration
- `/forgot-password` — recovery initiation
- `/reset-password/[token]` — recovery completion
- `/dashboard` — authenticated workspace
- `/dashboard/projects` — project management
- `/dashboard/settings` — account/security settings
- `/api/*` — server-side API boundaries as required

These are architecture boundaries only; feature implementation belongs to later phases.

## 5. Security boundaries

- Secrets remain server-side and are represented only through environment variable names.
- Authorization must be determined from the authenticated session, never from a user-controlled URL identifier.
- Database access will be server-side and authorization-aware.
- Webhook handlers, when introduced, must authenticate signatures, validate payloads, prevent replay where supported, process idempotently, and record failures.
- Client-visible configuration must contain only intentionally public values.

## 6. 3D engine boundary

The visual engine will be isolated from application/business logic. Phase 3 will implement `THREE.Scene`, `THREE.PerspectiveCamera`, `THREE.WebGLRenderer`, procedural shader displacement, optimized BufferGeometry particle systems, responsive resize handling, reduced-motion behavior, and WebGL capability/fallback handling.

Pure Three.js is intentional; React Three Fiber is not selected for the core engine.

## 7. Data model direction

Later phases will define persistent entities such as User, Project, ProjectMedia, Deployment, DeploymentEvent, ProjectTag, and AuditEvent. Exact fields, relationships, indexes, retention, and authorization policies are deferred until the database phase.

## 8. Testing strategy

1. static/type validation;
2. production build;
3. unit/integration tests where business logic exists;
4. browser E2E tests;
5. console/network/runtime evidence;
6. visual/performance testing;
7. security testing;
8. accessibility/SEO checks;
9. production smoke verification.

A passing build alone is never treated as proof that the full application works.

## 9. Phase boundaries

Phase 1 establishes architecture and the executable baseline.

Phase 2 owns the design system and visual foundation.

Phase 3 owns the Three.js engine.

Phase 4 owns mouse/scroll interaction.

Later phases own product features, security, compliance, optimization, QA, deployment, and final regression.

## 10. Non-goals for Phase 1

- no fake project data;
- no fake deployment status;
- no authentication implementation;
- no database implementation;
- no production secrets;
- no final visual design;
- no placeholder claims presented as working features.
