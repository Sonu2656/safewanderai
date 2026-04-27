import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles as DreiSparkles } from "@react-three/drei";
import * as THREE from "three";
import { Trophy, Flame, Lock, Share2, Sparkles, Crown, Plane, Globe2, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { popConfetti, burstFromEvent } from "@/lib/fun";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LazyMount } from "@/components/LazyMount";

const reduceMotion =
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// ──────────────────────────────────────────────────────────────
// LEVELS — each tier has flavor + threshold
// ──────────────────────────────────────────────────────────────
type Level = { key: string; name: string; emoji: string; min: number; tagline: string; gradient: string };

const LEVELS: Level[] = [
  { key: "kid",     name: "Day-tripper",      emoji: "🐣", min: 0,    tagline: "Just out of the nest.",            gradient: "from-amber-200 to-orange-300" },
  { key: "scout",   name: "Scout",            emoji: "🧭", min: 100,  tagline: "Sniffing out the world.",          gradient: "from-sky-300 to-teal-400" },
  { key: "rover",   name: "Rover",            emoji: "🎒", min: 300,  tagline: "Boots dirty, eyes bright.",        gradient: "from-emerald-300 to-green-500" },
  { key: "nomad",   name: "Nomad",            emoji: "🏜️", min: 700,  tagline: "Address: wherever the wifi is.",   gradient: "from-orange-400 to-rose-500" },
  { key: "pioneer", name: "Pioneer",          emoji: "🚀", min: 1500, tagline: "Where the map ends, you begin.",   gradient: "from-violet-500 to-fuchsia-600" },
  { key: "goat",    name: "GOAT — The Wanderer", emoji: "🐐", min: 3000, tagline: "Greatest. Of. All. Trips.",      gradient: "from-yellow-400 via-orange-500 to-pink-500" },
];

const getLevel = (xp: number): { current: Level; next: Level | null; progress: number } => {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.min) current = l;
  const idx = LEVELS.indexOf(current);
  const next = idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
  const progress = next ? Math.min(1, (xp - current.min) / (next.min - current.min)) : 1;
  return { current, next, progress };
};

// ──────────────────────────────────────────────────────────────
// ACHIEVEMENTS
// ──────────────────────────────────────────────────────────────
type Achievement = { id: string; name: string; emoji: string; xp: number; check: (s: Stats) => boolean; hint: string };

type Stats = {
  trips: number;
  countries: Set<string>;
  continents: Set<string>;
  totalDays: number;
  bingoDone: number;
  hypeMax: number;
};

const continentOf = (country: string | null): string => {
  if (!country) return "?";
  const c = country.toUpperCase();
  const EU = ["FR","DE","IT","ES","PT","NL","BE","CH","AT","GR","SE","NO","DK","FI","IE","GB","UK","PL","CZ","HU","RO","BG","HR","IS"];
  const AS = ["JP","CN","IN","TH","VN","KR","ID","MY","SG","PH","NP","LK","BD","PK","AE","SA","TR","IL","JO","KH","LA","MM","TW","HK"];
  const AF = ["EG","MA","ZA","KE","TZ","NG","GH","ET","SN","TN","DZ"];
  const NA = ["US","CA","MX","CR","PA","CU","DO","JM","GT"];
  const SA = ["BR","AR","CL","PE","CO","UY","BO","EC","PY","VE"];
  const OC = ["AU","NZ","FJ","PG"];
  if (EU.includes(c)) return "Europe";
  if (AS.includes(c)) return "Asia";
  if (AF.includes(c)) return "Africa";
  if (NA.includes(c)) return "N.America";
  if (SA.includes(c)) return "S.America";
  if (OC.includes(c)) return "Oceania";
  return "Other";
};

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_steps", name: "First Steps",      emoji: "👣", xp: 50,  check: (s) => s.trips >= 1, hint: "Plan your first trip" },
  { id: "trio",        name: "Rule of Three",     emoji: "🌍", xp: 150, check: (s) => s.trips >= 3, hint: "3 trips planned" },
  { id: "globetrot",   name: "Globe-trotter",     emoji: "🗺️", xp: 300, check: (s) => s.countries.size >= 5, hint: "5 different countries" },
  { id: "continental", name: "Continental",       emoji: "🌐", xp: 500, check: (s) => s.continents.size >= 3, hint: "Visit 3 continents" },
  { id: "long_haul",   name: "Long Hauler",       emoji: "✈️", xp: 200, check: (s) => s.totalDays >= 30, hint: "30 total trip days" },
  { id: "bingo_buff",  name: "Bingo Buff",        emoji: "🎲", xp: 250, check: (s) => s.bingoDone >= 9, hint: "Complete a bingo board" },
  { id: "hype_lord",   name: "Hype Lord",         emoji: "🔥", xp: 100, check: (s) => s.hypeMax >= 100, hint: "Max out the hype meter" },
  { id: "decade",      name: "Decuple",           emoji: "🏆", xp: 1000, check: (s) => s.trips >= 10, hint: "10 trips planned" },
  { id: "world_eater", name: "World Eater",       emoji: "🐐", xp: 2000, check: (s) => s.countries.size >= 15, hint: "15 different countries — GOAT tier" },
];

// ──────────────────────────────────────────────────────────────
// 3D Trophy
// ──────────────────────────────────────────────────────────────
const SpinningTrophy = ({ levelKey }: { levelKey: string }) => {
  const ref = useRef<THREE.Group>(null);
  const colorMap: Record<string, string> = {
    kid: "#F59E0B", scout: "#0EA5E9", rover: "#10B981",
    nomad: "#F97316", pioneer: "#A855F7", goat: "#FBC04A",
  };
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.6;
    ref.current.position.y = Math.sin(clock.elapsedTime * 1.4) * 0.08;
  });
  return (
    <group ref={ref}>
      {/* Cup */}
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.55, 0.4, 0.7, 24]} />
        <meshStandardMaterial color={colorMap[levelKey] || "#FBC04A"} metalness={0.85} roughness={0.18} emissive={colorMap[levelKey] || "#FBC04A"} emissiveIntensity={0.25} />
      </mesh>
      {/* Handles */}
      <mesh position={[0.7, 0.35, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.18, 0.05, 10, 20, Math.PI]} />
        <meshStandardMaterial color={colorMap[levelKey] || "#FBC04A"} metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[-0.7, 0.35, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.18, 0.05, 10, 20, Math.PI]} />
        <meshStandardMaterial color={colorMap[levelKey] || "#FBC04A"} metalness={0.85} roughness={0.2} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 0.3, 12]} />
        <meshStandardMaterial color={colorMap[levelKey] || "#FBC04A"} metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Base */}
      <mesh position={[0, -0.4, 0]}>
        <cylinderGeometry args={[0.45, 0.5, 0.18, 24]} />
        <meshStandardMaterial color="#1B1B2A" metalness={0.4} roughness={0.5} />
      </mesh>
      <DreiSparkles count={14} scale={2.2} size={3} speed={0.5} color={colorMap[levelKey] || "#FBC04A"} />
    </group>
  );
};

const TrophyCanvas = ({ levelKey }: { levelKey: string }) => (
  <Canvas
    camera={{ position: [0, 0.3, 3], fov: 45 }}
    dpr={[1, 1.5]}
    gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    frameloop={reduceMotion ? "demand" : "always"}
  >
    <ambientLight intensity={0.5} />
    <directionalLight position={[3, 4, 5]} intensity={1.4} color="#FBC04A" />
    <pointLight position={[-3, -2, 2]} intensity={0.6} color="#F26A4F" />
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.5}>
      <SpinningTrophy levelKey={levelKey} />
    </Float>
  </Canvas>
);

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────
export const GoatScore = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ trips: 0, countries: new Set(), continents: new Set(), totalDays: 0, bingoDone: 0, hypeMax: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("trips")
        .select("destination, country, trip_length")
        .eq("user_id", user.id);
      const s: Stats = { trips: 0, countries: new Set(), continents: new Set(), totalDays: 0, bingoDone: 0, hypeMax: 0 };
      (data || []).forEach((t: any) => {
        s.trips += 1;
        if (t.country) {
          s.countries.add(t.country);
          s.continents.add(continentOf(t.country));
        }
        if (t.trip_length) s.totalDays += Number(t.trip_length);
      });
      // From localStorage — bingo + hype tracking
      try {
        const bingoKeys = Object.keys(localStorage).filter((k) => k.startsWith("wander-bingo-"));
        let maxDone = 0;
        bingoKeys.forEach((k) => {
          try { const v = JSON.parse(localStorage.getItem(k) || "[]"); if (Array.isArray(v)) maxDone = Math.max(maxDone, v.filter(Boolean).length); } catch {}
        });
        s.bingoDone = maxDone;
        s.hypeMax = Number(localStorage.getItem("safewander-hype-max") || "0");
      } catch {}
      setStats(s);
      setLoading(false);
    })();
  }, [user]);

  // XP: 100 per trip, 50 per country, 30 per continent, 2 per day, achievements stacked
  const earnedAchievements = useMemo(() => ACHIEVEMENTS.filter((a) => a.check(stats)), [stats]);
  const xp = useMemo(() => {
    let total = 0;
    total += stats.trips * 100;
    total += stats.countries.size * 50;
    total += stats.continents.size * 30;
    total += stats.totalDays * 2;
    total += earnedAchievements.reduce((sum, a) => sum + a.xp, 0);
    return total;
  }, [stats, earnedAchievements]);

  const { current, next, progress } = useMemo(() => getLevel(xp), [xp]);

  // Celebrate level-ups
  const lastLevelRef = useRef<string | null>(null);
  useEffect(() => {
    if (loading) return;
    const seen = localStorage.getItem("safewander-goat-level");
    if (seen && seen !== current.key && lastLevelRef.current !== current.key) {
      popConfetti({ y: 0.4 });
      toast.success(`Level up! You're now a ${current.name} ${current.emoji}`);
    }
    localStorage.setItem("safewander-goat-level", current.key);
    lastLevelRef.current = current.key;
  }, [current.key, loading]);

  const share = async (e: React.MouseEvent) => {
    burstFromEvent(e);
    const text = `I'm a ${current.name} ${current.emoji} on SafeWander — ${xp} XP, ${stats.countries.size} countries, ${earnedAchievements.length}/${ACHIEVEMENTS.length} badges. Catch me wandering 🌍`;
    try {
      if (navigator.share) await navigator.share({ text, title: "My SafeWander GOAT card" });
      else { await navigator.clipboard.writeText(text); toast.success("Copied your GOAT card to clipboard!"); }
    } catch {}
  };

  if (loading) {
    return (
      <div className="rounded-3xl border-2 border-foreground/10 bg-card p-8 text-center text-sm text-muted-foreground">
        Calculating your GOAT score...
      </div>
    );
  }

  const isGoat = current.key === "goat";

  return (
    <div className={`relative overflow-hidden rounded-3xl border-2 border-foreground/10 bg-gradient-to-br ${current.gradient} p-1 shadow-glow`}>
      <div className="relative rounded-[1.4rem] bg-card/95 backdrop-blur-sm p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-primary">
              <Crown className="h-3.5 w-3.5" /> GOAT score
            </div>
            <h2 className="mt-1 font-display text-3xl font-black md:text-5xl">
              {isGoat ? (
                <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent animate-shimmer" style={{ backgroundSize: "200% auto" }}>
                  THE GOAT 🐐
                </span>
              ) : (
                <>
                  <span className="font-handwritten text-2xl text-muted-foreground">you are a</span><br />
                  <span>{current.name} {current.emoji}</span>
                </>
              )}
            </h2>
            <p className="mt-1 italic text-foreground/70">"{current.tagline}"</p>
          </div>
          <Button onClick={share} size="sm" className="gap-1.5 bg-foreground text-background sticker">
            <Share2 className="h-4 w-4" /> Share my rank
          </Button>
        </div>

        {/* Hero row: 3D trophy + XP */}
        <div className="mt-6 grid gap-6 md:grid-cols-[260px_1fr] md:items-center">
          <div className="relative aspect-square w-full max-w-[260px] mx-auto rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/0 sticker">
            <TrophyCanvas levelKey={current.key} />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-foreground px-3 py-1 text-xs font-black text-background">
              {current.emoji} {current.name.toUpperCase()}
            </div>
          </div>

          <div className="space-y-4">
            {/* XP big number */}
            <div className="rounded-2xl bg-foreground/5 p-4 sticker">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total XP</p>
              <p className="font-display text-5xl font-black tabular-nums leading-none">
                {xp.toLocaleString()}
                <span className="ml-2 text-base font-bold text-muted-foreground">xp</span>
              </p>
              {next ? (
                <>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold">
                    <span>{current.emoji} {current.name}</span>
                    <span className="text-muted-foreground">{next.min - xp} XP to {next.name} {next.emoji}</span>
                  </div>
                  <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent via-primary to-secondary transition-all duration-700"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm font-bold text-foreground">🐐 You've maxed out. The GOAT cannot be tamed.</p>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat icon={Plane} label="Trips" value={stats.trips} />
              <Stat icon={Globe2} label="Countries" value={stats.countries.size} />
              <Stat icon={Compass} label="Continents" value={stats.continents.size} />
              <Stat icon={Flame} label="Days" value={stats.totalDays} />
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 font-display text-xl font-bold">
              <Trophy className="h-5 w-5 text-primary" /> Badges
            </h3>
            <p className="text-xs font-bold text-muted-foreground">{earnedAchievements.length} / {ACHIEVEMENTS.length}</p>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {ACHIEVEMENTS.map((a) => {
              const earned = a.check(stats);
              return (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                    earned
                      ? "bg-gradient-to-br from-accent/20 to-primary/10 sticker hover:-translate-y-0.5"
                      : "bg-muted/50 border-2 border-dashed border-muted-foreground/20"
                  }`}
                >
                  <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl ${earned ? "bg-card shadow-soft" : "bg-card/50 grayscale opacity-50"}`}>
                    {earned ? a.emoji : <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold ${earned ? "text-foreground" : "text-muted-foreground"}`}>
                      {a.name}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {earned ? `+${a.xp} XP` : a.hint}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tier ladder */}
        <div className="mt-8">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">The road to GOAT</p>
          <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
            {LEVELS.map((l) => {
              const reached = xp >= l.min;
              const isCurrent = l.key === current.key;
              return (
                <div
                  key={l.key}
                  className={`shrink-0 rounded-xl px-3 py-2 text-center transition-all ${
                    isCurrent
                      ? "bg-foreground text-background scale-110 sticker"
                      : reached
                      ? "bg-card sticker"
                      : "bg-muted/40 opacity-50"
                  }`}
                >
                  <p className="text-xl">{l.emoji}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider">{l.name}</p>
                  <p className="text-[10px] tabular-nums opacity-70">{l.min}+ XP</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-xl bg-card p-3 sticker">
    <Icon className="h-4 w-4 text-primary" />
    <p className="mt-1 font-display text-2xl font-black tabular-nums leading-none">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
  </div>
);
