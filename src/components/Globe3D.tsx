import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Sphere, Ring, Trail } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const PinDot = ({ lat, lon, color = "#F26A4F", radius = 1.4 }: { lat: number; lon: number; color?: string; radius?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
  }, [lat, lon, radius]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2.5 + lat) * 0.22;
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[0.04, 10, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
};

const OrbitingPlane = ({ radius = 1.85, speed = 0.4, tilt = 0.3, color = "#FBC04A" }: any) => {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * speed;
    group.current.rotation.x = tilt;
  });
  return (
    <group ref={group}>
      <Trail width={1} length={3} color={color} attenuation={(t) => t * t}>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      </Trail>
    </group>
  );
};

const SpinningGlobe = () => {
  const earth = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (earth.current) earth.current.rotation.y += delta * 0.12;
  });

  return (
    <group>
      {/* Glow halos — fewer segments */}
      <Sphere args={[1.55, 24, 24]}>
        <meshBasicMaterial color="#F26A4F" transparent opacity={0.06} side={THREE.BackSide} />
      </Sphere>

      {/* Solid earth */}
      <mesh ref={earth}>
        <sphereGeometry args={[1.4, 40, 40]} />
        <meshStandardMaterial
          color="#1B3A5B"
          emissive="#0F2A47"
          emissiveIntensity={0.4}
          roughness={0.65}
          metalness={0.2}
        />
      </mesh>

      {/* Equator ring */}
      <Ring args={[1.65, 1.68, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#F26A4F" transparent opacity={0.5} side={THREE.DoubleSide} />
      </Ring>

      {/* Pulsing destination pins */}
      <PinDot lat={35.68} lon={139.69} color="#F26A4F" />
      <PinDot lat={48.85} lon={2.35} color="#FBC04A" />
      <PinDot lat={-22.9} lon={-43.17} color="#36B7A6" />
      <PinDot lat={40.71} lon={-74.0} color="#7C3AED" />
      <PinDot lat={28.61} lon={77.21} color="#EC4899" />

      {/* Single orbiting trail — much cheaper */}
      <OrbitingPlane radius={1.95} speed={0.35} tilt={0.3} color="#FBC04A" />
    </group>
  );
};

export const Globe3D = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative aspect-square w-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0.4, 4.2], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={reduceMotion ? "demand" : "always"}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 2, 4]} intensity={1.2} color="#FBC04A" />
        <pointLight position={[-3, -2, -2]} intensity={0.8} color="#36B7A6" />
        <Suspense fallback={null}>
          <Float speed={1} rotationIntensity={0.15} floatIntensity={0.5}>
            <SpinningGlobe />
          </Float>
          <Stars radius={50} depth={40} count={500} factor={3} saturation={0} fade speed={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
};
