"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const SWARM_COUNT = 20;
const MAX_PIXEL_RATIO = 1.75;

function createCoreMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      u_time: { value: 0 },
      u_intensity: { value: 0.22 },
      u_color_mix: { value: 0 },
      u_click: { value: 0 },
    },
    vertexShader: `
      uniform float u_time;
      uniform float u_intensity;
      uniform float u_click;
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
        float clickWave = sin(length(p) * 11.0 - t * 8.0) * u_click * 0.12;
        float displacement = n * u_intensity + clickWave;
        vec3 displaced = p + normalize(p) * displacement;
        vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
        vNormal = normalize(normalMatrix * normalize(p + normalize(p) * displacement));
        vPulse = n + clickWave;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float u_color_mix;
      varying vec3 vNormal;
      varying float vPulse;

      void main() {
        float edge = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 1.8);
        float signal = clamp(0.52 + vPulse * 0.34 + edge * 0.48, 0.0, 1.0);
        vec3 cyan = vec3(0.33, 0.91, 0.94);
        vec3 emerald = vec3(0.22, 0.90, 0.63);
        vec3 color = mix(cyan, emerald, clamp(edge * 0.72 + u_color_mix * 0.55, 0.0, 1.0));
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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const coreMaterial = createCoreMaterial();
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.35, 5),
      coreMaterial,
    );
    group.add(core);

    const wireMaterial = new THREE.LineBasicMaterial({
      color: 0x3c8cff,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
    });
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.42, 2)),
      wireMaterial,
    );
    group.add(wire);

    const swarm = createSwarm();
    const swarmMaterial = swarm.points.material as THREE.PointsMaterial;
    group.add(swarm.points);

    const pointerNdc = new THREE.Vector2(0, 0);
    const targetRotation = new THREE.Vector2(0, 0);
    const projected = new THREE.Vector3();
    const pointerWorld = new THREE.Vector3();
    const baseColor = new THREE.Color(0x55e8ef);
    const defensiveColor = new THREE.Color(0x39e6a1);
    const displayColor = new THREE.Color();
    const displayWireColor = new THREE.Color();
    const blueColor = new THREE.Color(0x3c8cff);

    let frame = 0;
    let disposed = false;
    let pointerInside = false;
    let pointerDown = false;
    let clickEnergy = 0;
    let scrollProgress = 0;
    let targetScrollProgress = 0;

    const readScrollProgress = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScrollProgress = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
    };

    const resize = () => {
      const width = Math.max(1, mount.clientWidth);
      const height = Math.max(1, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerNdc.x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      pointerNdc.y = -((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1;
      targetRotation.x = pointerNdc.y * 0.18;
      targetRotation.y = pointerNdc.x * 0.28;
      pointerInside = true;
    };

    const onPointerLeave = () => {
      pointerInside = false;
      pointerDown = false;
      targetRotation.set(0, 0);
    };

    const onPointerDown = () => {
      pointerDown = true;
      clickEnergy = 1;
    };

    const onPointerUp = () => {
      pointerDown = false;
    };

    const onScroll = () => {
      readScrollProgress();
    };

    const clock = new THREE.Clock();
    readScrollProgress();

    const animate = () => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.033);
      const time = clock.elapsedTime;

      scrollProgress = THREE.MathUtils.lerp(scrollProgress, targetScrollProgress, 0.055);
      const tierProgress = scrollProgress;
      const rotationSpeed = THREE.MathUtils.lerp(0.16, 0.38, tierProgress);
      const swarmRadiusScale = THREE.MathUtils.lerp(1, 1.34, tierProgress);
      const colorMix = THREE.MathUtils.lerp(0, 1, tierProgress);

      coreMaterial.uniforms.u_time.value = time;
      coreMaterial.uniforms.u_intensity.value =
        0.22 + Math.sin(time * 1.7) * 0.045 + tierProgress * 0.01 + clickEnergy * 0.06;
      coreMaterial.uniforms.u_color_mix.value = colorMix;
      coreMaterial.uniforms.u_click.value = clickEnergy;

      displayColor.copy(baseColor).lerp(defensiveColor, colorMix);
      displayWireColor.copy(displayColor).lerp(blueColor, 0.55);
      swarmMaterial.color.copy(displayColor);
      wireMaterial.color.copy(displayWireColor);

      group.rotation.y += delta * rotationSpeed;
      group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, targetRotation.x, 0.045);
      group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, targetRotation.y * 0.32, 0.045);
      swarm.points.scale.setScalar(swarmRadiusScale);

      group.updateMatrixWorld(true);

      const position = swarm.positions;
      for (let i = 0; i < SWARM_COUNT; i += 1) {
        const o = i * 3;
        const seed = swarm.seeds[i];
        const pulse = Math.sin(time * 0.75 + seed) * 0.0018;

        position[o] += swarm.velocities[o] + Math.sin(time + seed) * pulse;
        position[o + 1] += swarm.velocities[o + 1] + Math.cos(time * 0.9 + seed) * pulse;
        position[o + 2] += swarm.velocities[o + 2] + Math.sin(time * 0.8 + seed * 1.7) * pulse;

        if (pointerInside) {
          projected.set(position[o], position[o + 1], position[o + 2]);
          projected.applyMatrix4(swarm.points.matrixWorld).project(camera);

          const dx = projected.x - pointerNdc.x;
          const dy = projected.y - pointerNdc.y;
          const distance = Math.hypot(dx, dy);
          const proximity = THREE.MathUtils.clamp(1 - distance / 0.34, 0, 1);

          if (proximity > 0) {
            pointerWorld.set(dx, dy, 0);
            const length = Math.max(Math.hypot(pointerWorld.x, pointerWorld.y), 0.0001);
            pointerWorld.multiplyScalar((proximity * (pointerDown ? 0.035 : -0.012)) / length);

            position[o] += pointerWorld.x;
            position[o + 1] += pointerWorld.y;
            position[o + 2] += Math.sin(seed + time * 4) * proximity * 0.01;
          }
        }

        const localDistance = Math.sqrt(
          position[o] ** 2 + position[o + 1] ** 2 + position[o + 2] ** 2,
        );
        if (localDistance > 4.1 || localDistance < 1.75) {
          const factor = localDistance > 4.1 ? 0.994 : 1.006;
          position[o] *= factor;
          position[o + 1] *= factor;
          position[o + 2] *= factor;
        }
      }

      clickEnergy = Math.max(0, clickEnergy - delta * 2.8);
      swarm.points.geometry.attributes.position.needsUpdate = true;
      swarm.points.rotation.y = -group.rotation.y * 0.45;

      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    window.addEventListener("scroll", onScroll, { passive: true });
    mount.addEventListener("pointermove", onPointerMove);
    mount.addEventListener("pointerleave", onPointerLeave);
    mount.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    resize();
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      mount.removeEventListener("pointermove", onPointerMove);
      mount.removeEventListener("pointerleave", onPointerLeave);
      mount.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);

      core.geometry.dispose();
      coreMaterial.dispose();
      wire.geometry.dispose();
      wireMaterial.dispose();
      swarm.points.geometry.dispose();
      swarmMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mountRef} className="holographic-core" aria-hidden="true" />;
}
