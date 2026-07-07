import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import { MeshStandardMaterial } from "three";
import { useReducedMotion } from "./useReducedMotion";

function Sculpture({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const darkGlass = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#06090c",
        metalness: 0.5,
        roughness: 0.22,
        emissive: "#032c22",
        emissiveIntensity: 0.22,
      }),
    [],
  );
  const graphite = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#22282e",
        metalness: 0.92,
        roughness: 0.28,
      }),
    [],
  );
  const emerald = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#35f2a3",
        emissive: "#35f2a3",
        emissiveIntensity: 1.6,
        metalness: 0.1,
        roughness: 0.38,
      }),
    [],
  );

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) {
      return;
    }

    group.current.rotation.y += delta * 0.13;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.035;
  });

  return (
    <group ref={group} rotation={[0.08, -0.45, -0.05]} position={[0.28, -0.08, 0]}>
      <mesh material={darkGlass} position={[0, 0.55, 0]} rotation={[0.1, 0.4, -0.1]}>
        <icosahedronGeometry args={[0.72, 1]} />
      </mesh>
      <mesh material={darkGlass} position={[0, -0.35, 0]} scale={[0.72, 1.42, 0.7]} rotation={[0.08, -0.25, 0.18]}>
        <octahedronGeometry args={[0.84, 1]} />
      </mesh>
      <mesh material={graphite} position={[-0.34, 0.16, 0.1]} scale={[0.16, 1.35, 0.9]} rotation={[0.1, 0.22, -0.32]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh material={graphite} position={[0.37, -0.38, 0.02]} scale={[0.15, 1.05, 0.88]} rotation={[0.15, -0.18, 0.35]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh material={emerald} position={[0.03, -0.05, 0.09]} scale={[0.13, 1.95, 0.13]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
    </group>
  );
}

export default function ThreeHeroCanvas() {
  const reducedMotion = useReducedMotion();

  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0.2, 4.6], fov: 34 }}
      dpr={[1, 1.7]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight color="#f4f7fb" intensity={3.2} position={[-3, 4, 4]} />
      <pointLight color="#35f2a3" intensity={4.2} position={[2.2, 0.5, 2.6]} />
      <pointLight color="#6be7ff" intensity={0.45} position={[-2, -1.5, 1.8]} />
      <Sculpture reducedMotion={reducedMotion} />
    </Canvas>
  );
}
