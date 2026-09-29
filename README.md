# Abascus

Production 3D holographic project exhibition and deployment platform.

## Phase 1 — Project Audit & Architecture

This repository was empty at the start of Phase 1. There was no existing application to audit, so Phase 1 establishes the initial architecture from the verified product requirements rather than pretending an existing stack was present.

### Architecture decisions

- Framework: Next.js 16 App Router
- Language: TypeScript
- Rendering: React/Next.js for application UI; pure Three.js for the WebGL engine
- 3D library: Three.js 0.186.1
- Styling: CSS foundation in Phase 1; visual design system is implemented in Phase 2
- Data/auth: server-side boundaries reserved for later phases; no secrets in client code
- Testing: automated type/build checks plus browser/runtime verification in later phases
- Deployment target: production-capable Node hosting, with platform-specific deployment finalized in Phase 15

### Phase gate

Phase 1 is complete only when:
1. The repository architecture is documented.
2. The application has a deterministic package/dependency manifest.
3. Environment boundaries are documented without committing secrets.
4. The project has a minimal compilable application shell.
5. CI validates type checking and production builds.
6. No source code, secret, or configuration is invented as an audit finding.

See `docs/ARCHITECTURE.md` for the detailed boundary map.
