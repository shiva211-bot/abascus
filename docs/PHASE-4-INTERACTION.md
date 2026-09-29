# Phase 4 — Mouse + Scroll Interaction System

## Scope

Phase 4 extends the Phase 3 pure Three.js renderer with bounded, reversible interaction. It does not add application state, network calls, or unverified runtime claims.

## Interaction contract

### Scroll choreography

The engine reads document scroll progress as a normalized value from 0 to 1 and smooths it inside the animation loop.

That progress is mapped across the exhibition's conceptual evolution range of **v3.0 → v32.0**:

- core color transitions from electric cyan toward defensive emerald;
- rotation speed increases smoothly;
- the 20-node swarm expands its visual radius;
- shader intensity receives a small tier-dependent modulation.

The mapping is continuous rather than frame-stepped, so intermediate scroll positions remain stable.

### Pointer response

Pointer movement drives two bounded systems:

1. Core rotation follows the pointer with low-pass interpolation.
2. Each of the exactly 20 swarm nodes is projected into screen space and evaluated against the pointer.
   - hover proximity applies a small inward/absorb force;
   - pointer-down applies a stronger outward/scatter force;
   - the response is clamped by the proximity radius.

Only the 20 existing swarm nodes participate; no unbounded particle creation occurs.

### Click response

Pointer-down injects a short-lived click energy signal:

- the shader emits a radial wave;
- core displacement increases temporarily;
- the swarm receives the same interaction event without changing its count.

The energy decays automatically and does not accumulate across repeated frames.

## Performance boundaries

- requestAnimationFrame remains the single render loop.
- Device pixel ratio is capped at 1.75.
- The swarm remains fixed at 20 points.
- Pointer projection work is bounded to those 20 points.
- Scroll events only update a scalar target; visual interpolation occurs in the render loop.
- ResizeObserver owns canvas sizing.
- All listeners, animation frames, geometries, materials, and the renderer are disposed on unmount.
- prefers-reduced-motion: reduce disables the animated WebGL engine.

## Accessibility boundary

The WebGL canvas remains aria-hidden because it is decorative rather than the source of application information. The surrounding HTML continues to provide the meaningful headings, navigation, and controls.

## Verification gate

Phase 4 is complete only when:

1. TypeScript validation passes.
2. Production build passes.
3. The latest GitHub Actions run is green.
4. No new console/build errors are introduced by the interaction layer.
5. Phase 3 behavior remains intact: shader core, wireframe layer, exactly 20 swarm nodes, resize lifecycle, and reduced-motion handling.
