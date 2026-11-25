"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import type { ExperimentSlug } from "@/lib/content/types";

/**
 * Spatial inspection of a representative optical bench.
 *
 * This is a schematic 3D arrangement, not a CAD model of the kit. Component
 * positions are illustrative and are not derived from a manufacturer drawing;
 * the laboratory's own layout must be measured and recorded separately.
 */

type Kind = "laser" | "mirror" | "bs" | "lens" | "screen" | "detector" | "objective" | "stage" | "waveplate" | "polarizer";

interface Part {
  kind: Kind;
  pos: [number, number, number];
  rotY?: number;
}

interface Layout {
  parts: Part[];
  beams: [number, number, number][][];
}

const H = 0.1; // beam height in scene units (~100 mm scaled)

const LAYOUTS: Record<ExperimentSlug, Layout> = {
  "michelson-interferometer": {
    parts: [
      { kind: "laser", pos: [-0.46, 0, 0] },
      { kind: "bs", pos: [-0.08, 0, 0] },
      { kind: "mirror", pos: [-0.08, 0, -0.3], rotY: 0 },
      { kind: "mirror", pos: [0.24, 0, 0], rotY: Math.PI / 2 },
      { kind: "screen", pos: [-0.08, 0, 0.3] }
    ],
    beams: [
      [[-0.4, H, 0], [-0.08, H, 0]],
      [[-0.08, H, 0], [-0.08, H, -0.3]],
      [[-0.08, H, 0], [0.24, H, 0]],
      [[-0.08, H, 0], [-0.08, H, 0.28]]
    ]
  },
  "mach-zehnder-interferometer": {
    parts: [
      { kind: "laser", pos: [-0.48, 0, 0.05] },
      { kind: "bs", pos: [-0.16, 0, 0.05] },
      { kind: "mirror", pos: [-0.16, 0, -0.26] },
      { kind: "mirror", pos: [0.2, 0, 0.05] },
      { kind: "bs", pos: [0.2, 0, -0.26] },
      { kind: "detector", pos: [0.42, 0, -0.26] },
      { kind: "detector", pos: [0.2, 0, 0.2] }
    ],
    beams: [
      [[-0.42, H, 0.05], [-0.16, H, 0.05]],
      [[-0.16, H, 0.05], [-0.16, H, -0.26]],
      [[-0.16, H, 0.05], [0.2, H, 0.05]],
      [[0.2, H, 0.05], [0.2, H, -0.26]],
      [[0.2, H, -0.26], [0.38, H, -0.26]],
      [[0.2, H, -0.26], [0.2, H, 0.16]]
    ]
  },
  "quantum-bomb-tester": {
    parts: [
      { kind: "laser", pos: [-0.46, 0, -0.2] },
      { kind: "bs", pos: [-0.18, 0, -0.2] },
      { kind: "mirror", pos: [-0.18, 0, 0.1] },
      { kind: "bs", pos: [0.2, 0, 0.1] },
      { kind: "stage", pos: [0.2, 0, -0.2] },
      { kind: "detector", pos: [0.42, 0, 0.1] },
      { kind: "detector", pos: [0.2, 0, 0.32] }
    ],
    beams: [
      [[-0.4, H, -0.2], [-0.18, H, -0.2]],
      [[-0.18, H, -0.2], [-0.18, H, 0.1]],
      [[-0.18, H, -0.2], [0.2, H, -0.2]],
      [[-0.18, H, 0.1], [0.2, H, 0.1]],
      [[0.2, H, 0.1], [0.38, H, 0.1]],
      [[0.2, H, 0.1], [0.2, H, 0.28]]
    ]
  },
  "quantum-eraser": {
    parts: [
      { kind: "laser", pos: [-0.46, 0, 0] },
      { kind: "bs", pos: [-0.16, 0, 0] },
      { kind: "mirror", pos: [-0.16, 0, -0.26] },
      { kind: "waveplate", pos: [-0.02, 0, -0.26] },
      { kind: "mirror", pos: [0.2, 0, 0] },
      { kind: "bs", pos: [0.2, 0, -0.26] },
      { kind: "polarizer", pos: [0.34, 0, -0.26] },
      { kind: "detector", pos: [0.46, 0, -0.26] }
    ],
    beams: [
      [[-0.4, H, 0], [-0.16, H, 0]],
      [[-0.16, H, 0], [-0.16, H, -0.26]],
      [[-0.16, H, -0.26], [0.2, H, -0.26]],
      [[-0.16, H, 0], [0.2, H, 0]],
      [[0.2, H, 0], [0.2, H, -0.26]],
      [[0.2, H, -0.26], [0.44, H, -0.26]]
    ]
  },
  "polarization-3d-cinema": {
    parts: [
      { kind: "laser", pos: [-0.46, 0, 0] },
      { kind: "polarizer", pos: [-0.24, 0, 0] },
      { kind: "waveplate", pos: [-0.06, 0, 0] },
      { kind: "polarizer", pos: [0.16, 0, 0] },
      { kind: "detector", pos: [0.38, 0, 0] }
    ],
    beams: [
      [[-0.4, H, 0], [0.35, H, 0]]
    ]
  },
  "fourier-optics": {
    parts: [
      { kind: "laser", pos: [-0.5, 0, 0] },
      { kind: "lens", pos: [-0.32, 0, 0] },
      { kind: "stage", pos: [-0.16, 0, 0] },
      { kind: "lens", pos: [0.02, 0, 0] },
      { kind: "stage", pos: [0.18, 0, 0] },
      { kind: "lens", pos: [0.34, 0, 0] },
      { kind: "screen", pos: [0.48, 0, 0] }
    ],
    beams: [
      [[-0.44, H, 0], [0.46, H, 0]]
    ]
  },
  "quantum-key-distribution": {
    parts: [
      { kind: "laser", pos: [-0.46, 0, 0] },
      { kind: "polarizer", pos: [-0.28, 0, 0] },
      { kind: "waveplate", pos: [-0.12, 0, 0] },
      { kind: "stage", pos: [0.08, 0, 0] },
      { kind: "polarizer", pos: [0.24, 0, 0] },
      { kind: "detector", pos: [0.4, 0, 0] }
    ],
    beams: [
      [[-0.4, H, 0], [0.36, H, 0]]
    ]
  },
  "optical-tweezers": {
    parts: [
      { kind: "laser", pos: [-0.48, 0, 0] },
      { kind: "lens", pos: [-0.3, 0, 0] },
      { kind: "mirror", pos: [-0.14, 0, 0], rotY: Math.PI / 4 },
      { kind: "objective", pos: [-0.14, 0.02, 0.2] },
      { kind: "stage", pos: [-0.14, 0, 0.3] },
      { kind: "detector", pos: [0.22, 0, 0.2] }
    ],
    beams: [
      [[-0.42, H, 0], [-0.14, H, 0]],
      [[-0.14, H, 0], [-0.14, H, 0.12]],
      [[-0.14, H, 0.12], [-0.14, H, 0.28]]
    ]
  }
};

function Beam({ from, to }: { from: [number, number, number]; to: [number, number, number] }) {
  const { position, quaternion, length } = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const dir = end.clone().sub(start);
    const len = dir.length();
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    return { position: mid, quaternion: q, length: len };
  }, [from, to]);
  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[0.0022, 0.0022, length, 8]} />
      <meshBasicMaterial color="#c43b2a" toneMapped={false} />
    </mesh>
  );
}

function PartMesh({ part }: { part: Part }) {
  const { kind, pos, rotY = 0 } = part;
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      {/* post + base */}
      {kind !== "laser" ? (
        <>
          <mesh position={[0, 0.045, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.09, 12]} />
            <meshStandardMaterial color="#8d8676" metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.004, 0]}>
            <cylinderGeometry args={[0.024, 0.028, 0.008, 20]} />
            <meshStandardMaterial color="#4b4941" metalness={0.5} roughness={0.4} />
          </mesh>
        </>
      ) : null}

      {kind === "laser" ? (
        <group position={[0, H, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.024, 0.024, 0.13, 24]} />
            <meshStandardMaterial color="#2e2e28" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0.066, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.004, 12]} />
            <meshBasicMaterial color="#c43b2a" />
          </mesh>
        </group>
      ) : null}

      {kind === "mirror" ? (
        <group position={[0, H, 0]}>
          <mesh>
            <boxGeometry args={[0.055, 0.055, 0.004]} />
            <meshStandardMaterial color="#e8e2d4" metalness={0.8} roughness={0.15} />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <boxGeometry args={[0.045, 0.04, 0.02]} />
            <meshStandardMaterial color="#4b4941" metalness={0.3} roughness={0.6} />
          </mesh>
        </group>
      ) : null}

      {kind === "bs" ? (
        <group position={[0, H, 0]}>
          <mesh>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshPhysicalMaterial color="#dfe8e2" transparent opacity={0.45} roughness={0.05} metalness={0.1} />
          </mesh>
          <mesh rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.04, 0.042, 0.001]} />
            <meshStandardMaterial color="#a9c4b9" transparent opacity={0.5} />
          </mesh>
        </group>
      ) : null}

      {kind === "lens" ? (
        <group position={[0, H, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.026, 0.026, 0.006, 24]} />
            <meshPhysicalMaterial color="#cfe0dd" transparent opacity={0.6} roughness={0.05} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0]}>
            <torusGeometry args={[0.026, 0.003, 8, 24]} />
            <meshStandardMaterial color="#4b4941" />
          </mesh>
        </group>
      ) : null}

      {kind === "screen" ? (
        <group position={[0, H, 0]}>
          <mesh>
            <boxGeometry args={[0.06, 0.08, 0.004]} />
            <meshStandardMaterial color="#f4f1e8" roughness={0.9} />
          </mesh>
        </group>
      ) : null}

      {kind === "detector" ? (
        <group position={[0, H, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.03, 20]} />
            <meshStandardMaterial color="#3d4a55" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0.018, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.002, 16]} />
            <meshBasicMaterial color="#14524a" />
          </mesh>
        </group>
      ) : null}

      {kind === "objective" ? (
        <group position={[0, H, 0]}>
          <mesh>
            <cylinderGeometry args={[0.018, 0.014, 0.05, 20]} />
            <meshStandardMaterial color="#5c5a50" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.03, 0]}>
            <cylinderGeometry args={[0.011, 0.011, 0.004, 20]} />
            <meshBasicMaterial color="#c43b2a" />
          </mesh>
        </group>
      ) : null}

      {kind === "stage" ? (
        <group position={[0, H * 0.55, 0]}>
          <mesh>
            <boxGeometry args={[0.09, 0.012, 0.09]} />
            <meshStandardMaterial color="#8d8676" metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.016, 0]}>
            <boxGeometry args={[0.03, 0.02, 0.03]} />
            <meshStandardMaterial color="#b23a1e" roughness={0.5} />
          </mesh>
        </group>
      ) : null}

      {kind === "waveplate" || kind === "polarizer" ? (
        <group position={[0, H, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.024, 0.024, 0.004, 24]} />
            <meshPhysicalMaterial color={kind === "polarizer" ? "#d9cba8" : "#c9ddd7"} transparent opacity={0.6} roughness={0.1} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.024, 0.0025, 8, 24]} />
            <meshStandardMaterial color="#3a3a34" />
          </mesh>
        </group>
      ) : null}
    </group>
  );
}

export function OpticalBench3D({ slug }: { slug: ExperimentSlug }) {
  const layout = LAYOUTS[slug];
  return (
    <div className="relative h-[420px] w-full bg-[#1b1b18]">
      <Canvas camera={{ position: [0.75, 0.65, 0.8], fov: 38 }} dpr={[1, 1.8]}>
        <color attach="background" args={["#1b1b18"]} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[1.2, 1.8, 0.9]} intensity={1.1} />
        <directionalLight position={[-1, 1, -0.6]} intensity={0.35} />
        <group>
          {/* breadboard */}
          <mesh position={[0, -0.012, 0]}>
            <boxGeometry args={[1.15, 0.024, 0.75]} />
            <meshStandardMaterial color="#2c2b26" roughness={0.85} metalness={0.15} />
          </mesh>
          <gridHelper args={[1.15, 24, "#3a3932", "#33322c"]} position={[0, 0.001, 0]} />
          {layout.parts.map((p, i) => (
            <PartMesh key={i} part={p} />
          ))}
          {layout.beams.map((segment, i) => {
            const from = segment[0];
            const to = segment[1];
            if (!from || !to) return null;
            return <Beam key={i} from={from} to={to} />;
          })}
        </group>
        <OrbitControls enablePan={false} minDistance={0.5} maxDistance={1.9} maxPolarAngle={Math.PI / 2.1} />
      </Canvas>
      <div className="pointer-events-none absolute bottom-2 left-3">
        <p className="font-mono text-[0.52rem] uppercase tracking-[0.1em] text-white/45">Schematic 3D bench · drag to orbit</p>
      </div>
    </div>
  );
}
