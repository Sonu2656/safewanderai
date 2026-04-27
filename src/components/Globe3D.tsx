import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Stars, Sphere, Ring, Trail } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

const PinDot = ({ lat, lon, color = "#F26A4F", radius = 1.4 }: { lat: number; lon: number; color?: string; radius?: number }) => {
  const ref = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  }, [lat, lon, radius]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 3 + lat) * 0.25;
    ref.current.scale.setScalar(s);
  });

  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[0.04, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
};

const OrbitingPlane = ({ radius = 1.85, speed = 0.4, tilt = 0.3, color = "#FBC04A" }: any) => {
  const group = useRef<THREE.Group>(null);
  const dot = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * speed;
    group.current.rotation.x = tilt;
  });
  return (
    <group ref={group}>
      <Trail width={1.2} length={4} color={color} attenuation={(t) => t * t}>
        <mesh ref={dot} position={[radius, 0, 0]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      </Trail>
    </group>
  );
};

const SpinningGlobe = () => {
  const earth = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (earth.current) earth.current.rotation.y += delta * 0.15;
    if (wire.current) wire.current.rotation.y += delta * 0.15;
  });

  return (
    <group>
      {/* Glow halo */}
      <Sphere args={[1.55, 32, 32]}>
        <meshBasicMaterial color="#F26A4F" transparent opacity={0.06} side={THREE.BackSide} />
      </Sphere>
      <Sphere args={[1.48, 32, 32]}>
        <meshBasicMaterial color="#36B7A6" transparent opacity={0.08} side={THREE.BackSide} />
      </Sphere>

      {/* Solid earth — gradient material */}
      <mesh ref={earth}>
        <sphereGeometry args={[1.4, 64, 64]} />
        <meshStandardMaterial
          color="#1B3A5B"
          emissive="#0F2A47"
          emissiveIntensity={0.4}
          roughness={0.65}
          metalness={0.2}
        />
      </mesh>

      {/* Wireframe overlay for that techy travel feel */}
      <mesh ref={wire}>
        <sphereGeometry args={[1.405, 32, 32]} />
        <meshBasicMaterial color="#FBC04A" wireframe transparent opacity={0.18} />
      </mesh>

      {/* Equator ring */}
      <Ring args={[1.65, 1.68, 96]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#F26A4F" transparent opacity={0.5} side={THREE.DoubleSide} />
      </Ring>

      {/* Pulsing destination pins */}
      <PinDot lat={35.68} lon={139.69} color="#F26A4F" /> {/* Tokyo */}
      <PinDot lat={48.85} lon={2.35} color="#FBC04A" />  {/* Paris */}
      <PinDot lat={-22.9} lon={-43.17} color="#36B7A6" /> {/* Rio */}
      <PinDot lat={40.71} lon={-74.0} color="#7C3AED" />  {/* NYC */}
      <PinDot lat={28.61} lon={77.21} color="#EC4899" />  {/* Delhi */}
      <PinDot lat={-33.86} lon={151.21} color="#0EA5E9" /> {/* Sydney */}

      {/* Orbiting trails */}
      <OrbitingPlane radius={1.85} speed={0.45} tilt={0.4} color="#FBC04A" />
      <OrbitingPlane radius={2.05} speed={-0.3} tilt={-0.5} color="#F26A4F" />
      <OrbitingPlane radius={2.25} speed={0.22} tilt={0.15} color="#36B7A6" />
    </group>
  );
};

export const Globe3D = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative aspect-square w-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0.4, 4.2], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 2, 4]} intensity={1.2} color="#FBC04A" />
        <pointLight position={[-3, -2, -2]} intensity={0.8} color="#36B7A6" />
        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.6}>
            <SpinningGlobe />
          </Float>
          <Stars radius={50} depth={50} count={1200} factor={3} saturation={0} fade speed={0.5} />
        </Suspense>
      </Canvas>
    </div>
  );
};
