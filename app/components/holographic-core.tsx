"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SWARM_COUNT = 20;

function createCoreMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0 },
      u_intensity: { value: 0.22 },
    },
    vertexShader: `
      uniform float u_time;
      uniform float u_intensity;
      varying vec3 vNormal;
      varying float vPulse;

      void main() {
        vec3 p = position;
        float t = u_time;
        float n =
          sin(p.x * 4.2 + t * 1.8) * 0.34 +
          cos(p.y * 5.1 - t * 1.35) * 0.28 +
          sin((p.x + p.z) * 7.0 + t * 0.9) * 0.18 +
          cos((p.y - p.z) * 9.0 - t * 1.15) * 0.12;
        float displacement = n * u_intensity;
        vec3 displaced = p + normalize(p) * displacement;
        vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
        vNormal = normalize(normalMatrix * normalize(p + normalize(p) * displacement));
        vPulse = n;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      varying float vPulse;

      void main() {
        float edge = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 1.8);
        float signal = clamp(0.52 + vPulse * 0.34 + edge * 0.48, 0.0, 1.0);
        vec3 cyan = vec3(0.33, 0.91, 0.94);
        vec3 emerald = vec3(0.22, 0.90, 0.63);
        vec3 color = mix(cyan, emerald, clamp(edge * 0.72, 0.0, 1.0));
        gl_FragColor = vec4(color * signal, 0.92);
      }
    `,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
}

function createSwarm() {
  const positions = new Float32Array(SWARM_COUNT * 3);
  const velocities = new Float32Array(SWARM_COUNT * 3);
  const seeds = new Float32Array(SWARM_COUNT);

  for (let i = 0; i < SWARM_COUNT; i += 1) {
    const radius = 2.15 + Math.random() * 1.35;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const offset = i * 3;

    positions[offset] = radius * Math.sin(phi) * Math.cos(theta);
    positions[offset + 1] = radius * Math.cos(phi);
    positions[offset + 2] = radius * Math.sin(phi) * Math.sin(theta);

    velocities[offset] = (Math.random() - 0.5) * 0.006;
    velocities[offset + 1] = (Math.random() - 0.5) * 0.006;
    velocities[offset + 2] = (Math.random() - 0.5) * 0.006;
    seeds[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  const attribute = new THREE.BufferAttribute(positions, 3);
  attribute.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("position", attribute);

  const material = new THREE.PointsMaterial({
    color: 0x55e8ef,
    size: 0.045,
    transparent: true,
    opacity: 0.86,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });

  return { points: new THREE.Points(geometry, material), positions, velocities, seeds };
}

export default function HolographicCore() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.35, 5),
      createCoreMaterial(),
    );
    group.add(core);

    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.42, 2)),
      new THREE.LineBasicMaterial({
        color: 0x3c8cff,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
      }),
    );
    group.add(wire);

    const swarm = createSwarm();
    group.add(swarm.points);

    const pointer = new THREE.Vector2(0, 0);
    const targetRotation = new THREE.Vector2(0, 0);
    let frame = 0;
    let disposed = false;

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotation.x = pointer.y * 0.18;
      targetRotation.y = pointer.x * 0.28;
    };

    const onPointerLeave = () => {
      targetRotation.set(0, 0);
    };

    const clock = new THREE.Clock();

    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();
      const delta = Math.min(clock.getDelta(), 0.033);

      const material = core.material as THREE.ShaderMaterial;
      material.uniforms.u_time.value = time;
      material.uniforms.u_intensity.value = 0.22 + Math.sin(time * 1.7) * 0.045;

      group.rotation.y += delta * 0.16;
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotation.x, 0.045);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, targetRotation.y * 0.32, 0.045);

      const position = swarm.positions;
      for (let i = 0; i < SWARM_COUNT; i += 1) {
        const o = i * 3;
        const seed = swarm.seeds[i];
        const pulse = Math.sin(time * 0.75 + seed) * 0.0018;
        position[o] += swarm.velocities[o] + Math.sin(time + seed) * pulse;
        position[o + 1] += swarm.velocities[o + 1] + Math.cos(time * 0.9 + seed) * pulse;
        position[o + 2] += swarm.velocities[o + 2] + Math.sin(time * 0.8 + seed * 1.7) * pulse;

        const distance = Math.sqrt(
          position[o] ** 2 + position[o + 1] ** 2 + position[o + 2] ** 2,
        );
        if (distance > 4.1 || distance < 1.75) {
          const factor = distance > 4.1 ? 0.994 : 1.006;
          position[o] *= factor;
          position[o + 1] *= factor;
          position[o + 2] *= factor;
        }
      }

      swarm.points.geometry.attributes.position.needsUpdate = true;
      swarm.points.rotation.y = -group.rotation.y * 0.45;
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerleave", onPointerLeave);
    resize();
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerleave", onPointerLeave);

      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      wire.geometry.dispose();
      (wire.material as THREE.Material).dispose();
      swarm.points.geometry.dispose();
      (swarm.points.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="holographic-core" aria-hidden="true" />;
}
