import { useMemo } from "react";
import { Sparkles, Music2, Palette, Camera, Utensils } from "lucide-react";

type Vibe = {
  mood: string;
  emoji: string;
  palette: string[];
  soundtrack: string;
  aesthetic: string;
  snapIdea: string;
  bite: string;
  gradient: string;
};

const VIBES: Record<string, Vibe> = {
  beach: {
    mood: "Salt-kissed & sun-drunk",
    emoji: "🌊",
    palette: ["#36B7A6", "#FBC04A", "#F26A4F", "#FFE6C7"],
    soundtrack: "Lo-fi steel drums & ocean hush",
    aesthetic: "Linen, terracotta, golden hour film grain",
    snapIdea: "Footprints leading into the surf at dusk",
    bite: "Anything grilled, eaten with your hands",
    gradient: "from-[#36B7A6]/30 via-[#FBC04A]/20 to-[#F26A4F]/30",
  },
  city: {
    mood: "Neon-lit & wide-awake",
    emoji: "🌆",
    palette: ["#7C3AED", "#F43F5E", "#FBBF24", "#0EA5E9"],
    soundtrack: "Synthwave taxi rides & street jazz",
    aesthetic: "Reflections in puddles, crosswalk geometry",
    snapIdea: "You, blurry, against a sharp neon sign",
    bite: "Whatever the longest queue is selling",
    gradient: "from-[#7C3AED]/30 via-[#F43F5E]/20 to-[#0EA5E9]/30",
  },
  mountain: {
    mood: "Crisp-air & cloud-chasing",
    emoji: "⛰️",
    palette: ["#10B981", "#3B82F6", "#F8FAFC", "#78716C"],
    soundtrack: "Ambient post-rock & wind through pines",
    aesthetic: "Wool socks, thermos steam, foggy switchbacks",
    snapIdea: "A tiny you against a huge ridgeline",
    bite: "Hot soup at the highest café you can find",
    gradient: "from-[#10B981]/30 via-[#3B82F6]/20 to-[#78716C]/30",
  },
  desert: {
    mood: "Dust-gold & timeless",
    emoji: "🏜️",
    palette: ["#F59E0B", "#DC2626", "#92400E", "#FEF3C7"],
    soundtrack: "Slow strings & wind across dunes",
    aesthetic: "Long shadows, terracotta walls, bare feet",
    snapIdea: "Silhouette on a ridge at golden hour",
    bite: "Mint tea poured from way too high",
    gradient: "from-[#F59E0B]/30 via-[#DC2626]/20 to-[#FEF3C7]/30",
  },
  jungle: {
    mood: "Verdant & humming",
    emoji: "🌿",
    palette: ["#16A34A", "#CA8A04", "#0EA5E9", "#65A30D"],
    soundtrack: "Cicadas, distant drums, dripping leaves",
    aesthetic: "Wet stone, monstera shadows, banana leaf",
    snapIdea: "Light beams cutting through the canopy",
    bite: "Fresh coconut, two-handed",
    gradient: "from-[#16A34A]/30 via-[#CA8A04]/20 to-[#0EA5E9]/30",
  },
  cultural: {
    mood: "Storied & glowing",
    emoji: "🏛️",
    palette: ["#B45309", "#7C2D12", "#F59E0B", "#FEF3C7"],
    soundtrack: "Ancient flutes & courtyard footsteps",
    aesthetic: "Honey-stone walls, tiled floors, lantern light",
    snapIdea: "An archway framing a stranger's silhouette",
    bite: "Whatever grandma is making down that alley",
    gradient: "from-[#B45309]/30 via-[#F59E0B]/20 to-[#FEF3C7]/30",
  },
};

const detectVibe = (destination: string, country: string | null): Vibe => {
  const d = `${destination} ${country || ""}`.toLowerCase();
  if (/beach|island|bali|maldive|phuket|goa|hawaii|caribbean|santorini|ibiza/.test(d)) return VIBES.beach;
  if (/desert|sahara|dubai|morocco|petra|jordan|nevada|namib/.test(d)) return VIBES.desert;
  if (/mountain|alps|nepal|swiss|himalaya|andes|patagonia|iceland|norway|aspen/.test(d)) return VIBES.mountain;
  if (/jungle|amazon|costa rica|borneo|congo|peru|vietnam|thailand|cambodia|laos/.test(d)) return VIBES.jungle;
  if (/rome|athens|cairo|kyoto|jerusalem|istanbul|varanasi|cusco|fes|marrakech/.test(d)) return VIBES.cultural;
  return VIBES.city;
};

export const TripVibe = ({ destination, country }: { destination: string; country: string | null }) => {
  const vibe = useMemo(() => detectVibe(destination, country), [destination, country]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${vibe.gradient} p-6 shadow-soft`}>
      <div className="absolute -right-6 -top-6 text-8xl opacity-20 select-none">{vibe.emoji}</div>

      <div className="relative">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground/70">
          <Sparkles className="h-3.5 w-3.5" /> Trip vibe
        </div>
        <h3 className="mt-1 font-display text-2xl font-bold leading-tight md:text-3xl">{vibe.mood}</h3>
        <p className="mt-1 text-sm text-foreground/70">An aesthetic, hand-tuned to your destination.</p>

        {/* Palette */}
        <div className="mt-5">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/60">
            <Palette className="h-3.5 w-3.5" /> Color palette
          </p>
          <div className="mt-2 flex gap-2">
            {vibe.palette.map((c) => (
              <div key={c} className="group relative">
                <div
                  className="h-10 w-10 rounded-xl border border-white/40 shadow-soft transition-transform hover:scale-110"
                  style={{ backgroundColor: c }}
                />
                <span className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 rounded bg-foreground px-1.5 py-0.5 text-[9px] font-mono text-background opacity-0 transition-opacity group-hover:opacity-100">
                  {c}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vibe rows */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <VibeRow icon={Music2} label="Soundtrack" value={vibe.soundtrack} />
          <VibeRow icon={Camera} label="Snap idea" value={vibe.snapIdea} />
          <VibeRow icon={Sparkles} label="Aesthetic" value={vibe.aesthetic} />
          <VibeRow icon={Utensils} label="First bite" value={vibe.bite} />
        </div>
      </div>
    </div>
  );
};

const VibeRow = ({ icon: Icon, label, value }: any) => (
  <div className="rounded-xl bg-card/70 p-3 backdrop-blur">
    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3 w-3" /> {label}
    </div>
    <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
  </div>
);
