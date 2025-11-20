"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

export default function AmbientCanvas() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <Suspense fallback={null}>
          <NeonLights />
        </Suspense>
      </Canvas>
    </div>
  );
}

function NeonLights() {
  const pointsRef = useRef<THREE.Points>(null);
  const { mouse } = useThree();

  const count = 15000;
  const { positions, colors, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const vel = new Float32Array(count);

    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 20;
      pos[i + 1] = (Math.random() - 0.5) * 10;
      pos[i + 2] = (Math.random() - 0.5) * 20;

      // Яркие неоновые цвета
      const hue = Math.random() * 0.6 + 0.2; // голубой-фиолетовый-пурпур
      const color = new THREE.Color();
      color.setHSL(hue, 0.9, 0.6);
      col[i] = color.r;
      col[i + 1] = color.g;
      col[i + 2] = color.b;

      vel[i / 3] = Math.random() * 0.003 + 0.002;
    }
    return { positions: pos, colors: col, velocities: vel };
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const time = clock.elapsedTime;
    const posArray = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      // вертикальное движение
      posArray[i * 3 + 1] += velocities[i];
      if (posArray[i * 3 + 1] > 5) posArray[i * 3 + 1] = -5;

      // интерактивность: притяжение к курсору
      const dx = mouse.x * 10 - posArray[i * 3];
      const dy = -mouse.y * 5 - posArray[i * 3 + 1];
      posArray[i * 3] += dx * 0.004;
      posArray[i * 3 + 1] += dy * 0.004;
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;

    // Пульсация и glow
    pointsRef.current.material.size = 0.02 + Math.sin(time * 7) * 0.008;
    pointsRef.current.material.opacity = 0.5 + Math.sin(time * 5) * 0.4;
    pointsRef.current.rotation.y = time * 0.01;
    pointsRef.current.rotation.x = Math.sin(time / 8) * 0.03;
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled>
      <PointMaterial
        vertexColors
        transparent
        size={0.02}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}
