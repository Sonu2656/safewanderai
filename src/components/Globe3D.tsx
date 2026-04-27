import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Sphere, Ring, OrbitControls, Html, Line } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, forwardRef } from "react";
import * as THREE from "three";

const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

type City = { name: string; lat: number; lon: number; color: string; score: number; vibe: string };

const CITIES: City[] = [
  { name: "Tokyo",        lat: 35.68,  lon: 139.69, color: "#F26A4F", score: 92, vibe: "Neon dreams 🍜" },
  { name: "Paris",        lat: 48.85,  lon: 2.35,   color: "#FBC04A", score: 84, vibe: "Cafés & charm ☕" },
  { name: "Rio",          lat: -22.9,  lon: -43.17, color: "#36B7A6", score: 71, vibe: "Beach + samba 🏖️" },
  { name: "New York",     lat: 40.71,  lon: -74.0,  color: "#7C3AED", score: 78, vibe: "Never sleeps 🗽" },
  { name: "Delhi",        lat: 28.61,  lon: 77.21,  color: "#EC4899", score: 74, vibe: "Spice + soul 🌶️" },
  { name: "Sydney",       lat: -33.86, lon: 151.20, color: "#22D3EE", score: 89, vibe: "Surf & sun 🏄" },
  { name: "Cape Town",    lat: -33.92, lon: 18.42,  color: "#F59E0B", score: 79, vibe: "Mountains meet sea 🏔️" },
  { name: "Reykjavík",    lat: 64.13,  lon: -21.94, color: "#A78BFA", score: 95, vibe: "Aurora vibes ✨" },
];

const RADIUS = 1.4;

const latLonToVec3 = (lat: number, lon: number, r = RADIUS) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
};

const PinDot = ({
  city,
  active,
  onPick,
}: {
  city: City;
  active: boolean;
  onPick: (c: City | null) => void;
}) => {
  const ref = useRef<THREE.Mesh>(null);
  const pos = useMemo(() => latLonToVec3(city.lat, city.lon, RADIUS + 0.02), [city]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const base = active ? 1.6 : 1;
    const s = base + Math.sin(clock.elapsedTime * 2.8 + city.lat) * 0.25;
    ref.current.scale.setScalar(s);
  });

  return (
    <group position={pos}>
      <mesh
        ref={ref}
        onPointerDown={(e) => {
          e.stopPropagation();
          onPick(active ? null : city);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshBasicMaterial color={city.color} toneMapped={false} />
      </mesh>
      {/* halo ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.07, 0.09, 24]} />
        <meshBasicMaterial color={city.color} transparent opacity={active ? 0.9 : 0.4} side={THREE.DoubleSide} />
      </mesh>
      {active && (
        <Html
          distanceFactor={8}
          position={[0, 0.18, 0]}
          center
          style={{ pointerEvents: "none" }}
        >
          <div className="whitespace-nowrap rounded-xl bg-background/95 backdrop-blur px-3 py-2 text-xs font-bold shadow-card border-2 border-foreground/10 animate-scale-in">
            <div className="flex items-center gap-2">
              <span style={{ color: city.color }}>●</span>
              <span>{city.name}</span>
              <span className="rounded-full bg-success/20 px-1.5 py-0.5 text-[10px] text-success">
                {city.score}
              </span>
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-muted-foreground">{city.vibe}</p>
          </div>
        </Html>
      )}
    </group>
  );
};

// Curved arc between two lat/lon points — animated dashed stream
const Arc = ({ from, to, color, speed = 1 }: { from: [number, number]; to: [number, number]; color: string; speed?: number }) => {
  const ref = useRef<any>(null);
  const points = useMemo(() => {
    const a = latLonToVec3(from[0], from[1], RADIUS + 0.01);
    const b = latLonToVec3(to[0], to[1], RADIUS + 0.01);
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(RADIUS + 0.6);
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    return curve.getPoints(40);
  }, [from, to]);

  useFrame((_, delta) => {
    if (!ref.current?.material) return;
    ref.current.material.dashOffset -= delta * speed;
  });

  return (
    <Line
      ref={ref}
      points={points}
      color={color}
      lineWidth={1.5}
      dashed
      dashSize={0.15}
      gapSize={0.1}
      transparent
      opacity={0.7}
      toneMapped={false}
    />
  );
};

// Single moving plane along an arc
const FlyingPlane = ({ from, to, color = "#FBC04A", duration = 6 }: { from: [number, number]; to: [number, number]; color?: string; duration?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => {
    const a = latLonToVec3(from[0], from[1], RADIUS + 0.05);
    const b = latLonToVec3(to[0], to[1], RADIUS + 0.05);
    const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(RADIUS + 0.7);
    return new THREE.QuadraticBezierCurve3(a, mid, b);
  }, [from, to]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = (clock.elapsedTime % duration) / duration;
    const pos = curve.getPoint(t);
    meshRef.current.position.copy(pos);
    const next = curve.getPoint(Math.min(1, t + 0.01));
    meshRef.current.lookAt(next);
  });

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[0.04, 0.12, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
};

const Earth = forwardRef<THREE.Mesh>((_, ref) => (
  <mesh ref={ref}>
    <sphereGeometry args={[RADIUS, 48, 48]} />
    <meshStandardMaterial
      color="#1B3A5B"
      emissive="#0F2A47"
      emissiveIntensity={0.45}
      roughness={0.65}
      metalness={0.2}
    />
  </mesh>
));
Earth.displayName = "Earth";

const GlobeScene = ({ active, setActive }: { active: City | null; setActive: (c: City | null) => void }) => {
  const earth = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (group.current && !reduceMotion) group.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={group}>
      <Sphere args={[1.55, 24, 24]}>
        <meshBasicMaterial color="#F26A4F" transparent opacity={0.06} side={THREE.BackSide} />
      </Sphere>

      <Earth ref={earth} />

      <Ring args={[1.65, 1.68, 64]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#F26A4F" transparent opacity={0.5} side={THREE.DoubleSide} />
      </Ring>

      {CITIES.map((c) => (
        <PinDot key={c.name} city={c} active={active?.name === c.name} onPick={setActive} />
      ))}

      {/* Animated travel arcs between iconic city pairs */}
      <Arc from={[35.68, 139.69]} to={[40.71, -74.0]} color="#FBC04A" speed={2} />
      <Arc from={[48.85, 2.35]} to={[28.61, 77.21]} color="#EC4899" speed={1.5} />
      <Arc from={[-33.86, 151.20]} to={[-22.9, -43.17]} color="#36B7A6" speed={1.8} />

      <FlyingPlane from={[35.68, 139.69]} to={[40.71, -74.0]} color="#FBC04A" duration={7} />
      <FlyingPlane from={[48.85, 2.35]} to={[28.61, 77.21]} color="#EC4899" duration={6} />
    </group>
  );
};

export const Globe3D = ({ className = "" }: { className?: string }) => {
  const [active, setActive] = useState<City | null>(null);

  return (
    <div className={`relative aspect-square w-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0.4, 4.4], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={reduceMotion ? "demand" : "always"}
        onPointerMissed={() => setActive(null)}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 2, 4]} intensity={1.2} color="#FBC04A" />
        <pointLight position={[-3, -2, -2]} intensity={0.7} color="#36B7A6" />
        <Suspense fallback={null}>
          <GlobeScene active={active} setActive={setActive} />
          <Stars radius={50} depth={40} count={400} factor={3} saturation={0} fade speed={0.5} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={!reduceMotion && !active}
          autoRotateSpeed={0.6}
          rotateSpeed={0.55}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      {/* Hint chip */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/90 backdrop-blur px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground shadow-soft border border-foreground/10">
        🖱️ Drag · Tap pins
      </div>
    </div>
  );
};

export default Globe3D;
