# Abascus Design System — Phase 2

## Visual direction

Abascus uses a defensive cyber-interface language rather than a generic AI aesthetic.

- Base: deep cyber black / blue-black.
- Primary signal: electric cyan.
- Secondary signal: electric blue.
- Defensive status: neon emerald.
- Error state: restrained red.
- Surfaces: translucent dark glass with thin cyan-tinted borders.
- Typography: system sans for interface hierarchy; monospace for telemetry and machine-state labels.
- Geometry: restrained rectangular/radius system; no excessive pill UI.
- Lighting: localized glows, not full-page gradients.
- Motion: purposeful and reversible; reduced-motion support is mandatory.

## Tokens

All global tokens live in app/globals.css under :root.

The token layer owns background and surface colors, text hierarchy, signal/status colors, border radii, core shadow, and typography stacks.

Components should consume tokens instead of hard-coding repeated visual values.

## Component foundation

Phase 2 establishes:
- site header/navigation;
- brand mark;
- primary/secondary buttons;
- hero typography;
- holographic core frame boundary for the Phase 3 WebGL engine;
- section headings;
- system cards;
- footer;
- responsive breakpoints;
- keyboard focus states;
- reduced-motion behavior.

The core frame is intentionally a CSS visual boundary. Phase 3 replaces/enhances its interior with the production Three.js engine without changing the surrounding application contract.

## UX rules

1. Every interactive control has a visible focus state.
2. Contrast must remain readable against the dark surface.
3. Layout must remain usable without hover.
4. Mobile navigation cannot depend on hover.
5. Motion must not be required to understand content.
6. Visual effects must not obscure project information.
7. No fake metrics, testimonials, customer counts, deployment health, or security claims.
8. No decorative effect may become the primary interaction.

## Phase gate

Phase 2 is complete only when the visual foundation is implemented, responsive, type-safe, production-buildable, and does not introduce a known accessibility or performance regression. The Three.js engine itself remains a Phase 3 responsibility.
