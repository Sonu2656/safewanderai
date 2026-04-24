import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Music2, Palette, Camera, Utensils, Shuffle, Play, Pause, Heart, Zap, Flame, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { popConfetti, burstFromEvent } from "@/lib/fun";
import { toast } from "sonner";

type Vibe = {
  key: string;
  mood: string;
  emoji: string;
  emojiTrail: string[];
  palette: string[];
  soundtrack: string;
  aesthetic: string;
  snapIdea: string;
  bite: string;
  gradient: string;
  hypeWord: string;
  manifesto: string;
  // Web Audio synth recipe — short ambient loop
  synth: { freq: number; type: OscillatorType; tempo: number };
};

const VIBES: Record<string, Vibe> = {
  beach: {
    key: "beach",
    mood: "Salt-kissed & sun-drunk",
    emoji: "🌊",
    emojiTrail: ["🌊", "🌅", "🐚", "🥥", "☀️", "🏝️"],
    palette: ["#36B7A6", "#FBC04A", "#F26A4F", "#FFE6C7"],
    soundtrack: "Lo-fi steel drums & ocean hush",
    aesthetic: "Linen, terracotta, golden hour film grain",
    snapIdea: "Footprints leading into the surf at dusk",
    bite: "Anything grilled, eaten with your hands",
    gradient: "from-[#36B7A6]/30 via-[#FBC04A]/20 to-[#F26A4F]/30",
    hypeWord: "Unbothered.",
    manifesto: "You're not on a schedule. You're on island time.",
    synth: { freq: 220, type: "sine", tempo: 90 },
  },
  city: {
    key: "city",
    mood: "Neon-lit & wide-awake",
    emoji: "🌆",
    emojiTrail: ["🌆", "🚕", "🍜", "🎷", "✨", "🏙️"],
    palette: ["#7C3AED", "#F43F5E", "#FBBF24", "#0EA5E9"],
    soundtrack: "Synthwave taxi rides & street jazz",
    aesthetic: "Reflections in puddles, crosswalk geometry",
    snapIdea: "You, blurry, against a sharp neon sign",
    bite: "Whatever the longest queue is selling",
    gradient: "from-[#7C3AED]/30 via-[#F43F5E]/20 to-[#0EA5E9]/30",
    hypeWord: "Electric.",
    manifesto: "Every corner is a different movie. You're the protagonist.",
    synth: { freq: 330, type: "sawtooth", tempo: 128 },
  },
  mountain: {
    key: "mountain",
    mood: "Crisp-air & cloud-chasing",
    emoji: "⛰️",
    emojiTrail: ["⛰️", "🌲", "❄️", "☁️", "🥾", "🏔️"],
    palette: ["#10B981", "#3B82F6", "#F8FAFC", "#78716C"],
    soundtrack: "Ambient post-rock & wind through pines",
    aesthetic: "Wool socks, thermos steam, foggy switchbacks",
    snapIdea: "A tiny you against a huge ridgeline",
    bite: "Hot soup at the highest café you can find",
    gradient: "from-[#10B981]/30 via-[#3B82F6]/20 to-[#78716C]/30",
    hypeWord: "Vast.",
    manifesto: "The view costs your breath. Pay it gladly.",
    synth: { freq: 174, type: "triangle", tempo: 70 },
  },
  desert: {
    key: "desert",
    mood: "Dust-gold & timeless",
    emoji: "🏜️",
    emojiTrail: ["🏜️", "🐪", "🌵", "✨", "🌙", "🔥"],
    palette: ["#F59E0B", "#DC2626", "#92400E", "#FEF3C7"],
    soundtrack: "Slow strings & wind across dunes",
    aesthetic: "Long shadows, terracotta walls, bare feet",
    snapIdea: "Silhouette on a ridge at golden hour",
    bite: "Mint tea poured from way too high",
    gradient: "from-[#F59E0B]/30 via-[#DC2626]/20 to-[#FEF3C7]/30",
    hypeWord: "Eternal.",
    manifesto: "The silence here has been practising for centuries.",
    synth: { freq: 196, type: "sine", tempo: 60 },
  },
  jungle: {
    key: "jungle",
    mood: "Verdant & humming",
    emoji: "🌿",
    emojiTrail: ["🌿", "🐒", "🦜", "🍃", "💧", "🌴"],
    palette: ["#16A34A", "#CA8A04", "#0EA5E9", "#65A30D"],
    soundtrack: "Cicadas, distant drums, dripping leaves",
    aesthetic: "Wet stone, monstera shadows, banana leaf",
    snapIdea: "Light beams cutting through the canopy",
    bite: "Fresh coconut, two-handed",
    gradient: "from-[#16A34A]/30 via-[#CA8A04]/20 to-[#0EA5E9]/30",
    hypeWord: "Alive.",
    manifesto: "Every leaf is louder than your inbox.",
    synth: { freq: 261, type: "triangle", tempo: 100 },
  },
  cultural: {
    key: "cultural",
    mood: "Storied & glowing",
    emoji: "🏛️",
    emojiTrail: ["🏛️", "📿", "🕌", "🎭", "📜", "🔔"],
    palette: ["#B45309", "#7C2D12", "#F59E0B", "#FEF3C7"],
    soundtrack: "Ancient flutes & courtyard footsteps",
    aesthetic: "Honey-stone walls, tiled floors, lantern light",
    snapIdea: "An archway framing a stranger's silhouette",
    bite: "Whatever grandma is making down that alley",
    gradient: "from-[#B45309]/30 via-[#F59E0B]/20 to-[#FEF3C7]/30",
    hypeWord: "Sacred.",
    manifesto: "You're walking on stories. Try not to scuff them.",
    synth: { freq: 233, type: "sine", tempo: 80 },
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
  const auto = useMemo(() => detectVibe(destination, country), [destination, country]);
  const [vibeKey, setVibeKey] = useState<string>(auto.key);
  const vibe = VIBES[vibeKey];
  const [hype, setHype] = useState(72);
  const [playing, setPlaying] = useState(false);
  const [tapped, setTapped] = useState(0);
  const audioRef = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode; lfo?: OscillatorNode } | null>(null);

  // Auto-rotating hype manifesto
  const manifestos = [vibe.manifesto, "Pack curiosity. Forget itineraries.", "Get lost. On purpose.", "The best stories start with 'so we wandered into…'"];
  const [mIdx, setMIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMIdx((i) => (i + 1) % manifestos.length), 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vibeKey]);

  // Reset to detected when destination changes
  useEffect(() => { setVibeKey(auto.key); }, [auto.key]);

  // Cleanup audio on unmount / vibe change
  useEffect(() => {
    return () => stopAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (playing) { stopAudio(); startAudio(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vibeKey]);

  const startAudio = () => {
    try {
      const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      const ctx = new Ctor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      osc.type = vibe.synth.type;
      osc.frequency.value = vibe.synth.freq;
      lfo.frequency.value = vibe.synth.tempo / 60 / 4; // slow swell
      lfoGain.gain.value = 0.05;
      lfo.connect(lfoGain).connect(gain.gain);
      gain.gain.value = 0.06;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      lfo.start();
      audioRef.current = { ctx, osc, gain, lfo };
      setPlaying(true);
    } catch {
      toast.error("Audio not available in this browser.");
    }
  };

  const stopAudio = () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      a.gain.gain.setTargetAtTime(0, a.ctx.currentTime, 0.05);
      setTimeout(() => { try { a.osc.stop(); a.lfo?.stop(); a.ctx.close(); } catch {} }, 200);
    } catch {}
    audioRef.current = null;
    setPlaying(false);
  };

  const togglePlay = () => (playing ? stopAudio() : startAudio());

  const shuffleVibe = () => {
    const keys = Object.keys(VIBES).filter((k) => k !== vibeKey);
    const next = keys[Math.floor(Math.random() * keys.length)];
    setVibeKey(next);
    popConfetti({ y: 0.4 });
  };

  const tapHype = (e: React.MouseEvent) => {
    setHype((h) => Math.min(100, h + 3));
    setTapped((n) => n + 1);
    if ((tapped + 1) % 7 === 0) burstFromEvent(e);
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl border-2 border-foreground/10 bg-gradient-to-br ${vibe.gradient} p-6 shadow-glow transition-all duration-500`}>
      {/* Floating emoji parade */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {vibe.emojiTrail.map((e, i) => (
          <span
            key={`${vibe.key}-${i}`}
            className="absolute text-2xl opacity-40 animate-float select-none"
            style={{
              left: `${(i * 17 + 8) % 90}%`,
              top: `${(i * 23 + 12) % 80}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${5 + (i % 3)}s`,
            }}
          >{e}</span>
        ))}
      </div>
      <div className="absolute -right-6 -top-6 text-9xl opacity-25 select-none animate-bounce-soft">{vibe.emoji}</div>

      <div className="relative">
        {/* Header row + actions */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">
              <Sparkles className="h-3.5 w-3.5" /> Trip vibe
            </div>
            <h3 className="mt-1 font-display text-3xl font-black leading-[0.95] md:text-4xl">{vibe.mood}</h3>
            <p className="mt-1 font-handwritten text-2xl text-foreground/80">{vibe.hypeWord}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={togglePlay} size="sm" variant="outline" className="gap-1.5 sticker bg-card">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Mute" : "Hear it"}
            </Button>
            <Button onClick={shuffleVibe} size="sm" className="gap-1.5 bg-foreground text-background hover:bg-foreground/90 sticker">
              <Shuffle className="h-4 w-4" /> Remix
            </Button>
          </div>
        </div>

        {/* Audio playing indicator */}
        {playing && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1 text-xs font-bold backdrop-blur animate-fade-up">
            <Volume2 className="h-3.5 w-3.5 text-primary" />
            <span className="flex items-end gap-0.5 h-3">
              <span className="w-0.5 bg-primary animate-bounce-soft" style={{ height: "60%", animationDelay: "0s" }} />
              <span className="w-0.5 bg-primary animate-bounce-soft" style={{ height: "100%", animationDelay: "0.2s" }} />
              <span className="w-0.5 bg-primary animate-bounce-soft" style={{ height: "80%", animationDelay: "0.4s" }} />
              <span className="w-0.5 bg-primary animate-bounce-soft" style={{ height: "40%", animationDelay: "0.6s" }} />
            </span>
            <span>{vibe.soundtrack.split(" & ")[0]}</span>
          </div>
        )}

        {/* Rotating manifesto */}
        <div key={mIdx} className="mt-5 rounded-2xl bg-card/80 p-4 backdrop-blur animate-fade-up sticker">
          <p className="font-display text-lg font-bold italic leading-snug text-balance">"{manifestos[mIdx]}"</p>
        </div>

        {/* HYPE METER — interactive */}
        <div className="mt-5 rounded-2xl bg-card/80 p-4 backdrop-blur sticker">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground">
              <Flame className="h-4 w-4 text-primary" /> Hype meter
            </p>
            <p className="font-display text-2xl font-black tabular-nums">{hype}<span className="text-sm text-muted-foreground">/100</span></p>
          </div>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent via-primary to-[#F43F5E] transition-all duration-300"
              style={{ width: `${hype}%` }}
            />
          </div>
          <button
            onClick={tapHype}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground py-2 text-sm font-bold text-background transition-transform active:scale-95 hover:scale-[1.01]"
          >
            <Zap className="h-4 w-4" /> Tap to hype it up
          </button>
          <p className="mt-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {hype >= 95 ? "🔥 unhinged levels of excited" : hype >= 80 ? "✨ buzzing" : hype >= 60 ? "🎒 ready to go" : "💭 warming up..."}
          </p>
        </div>

        {/* Palette — clickable to copy */}
        <div className="mt-5">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground/80">
            <Palette className="h-3.5 w-3.5" /> Color palette · tap to copy
          </p>
          <div className="mt-2 flex gap-2">
            {vibe.palette.map((c) => (
              <button
                key={c}
                onClick={() => { navigator.clipboard?.writeText(c); toast.success(`Copied ${c}`); }}
                className="group relative"
              >
                <div
                  className="h-12 w-12 rounded-2xl border-2 border-white/60 shadow-card transition-all group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: c }}
                />
                <span className="pointer-events-none absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-md bg-foreground px-1.5 py-0.5 text-[9px] font-mono text-background opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
                  {c}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Vibe rows — slightly more energetic */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <VibeRow icon={Music2} label="Soundtrack" value={vibe.soundtrack} />
          <VibeRow icon={Camera} label="Snap idea" value={vibe.snapIdea} />
          <VibeRow icon={Sparkles} label="Aesthetic" value={vibe.aesthetic} />
          <VibeRow icon={Utensils} label="First bite" value={vibe.bite} />
        </div>

        {/* Vibe switcher */}
        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Try another mood →</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.values(VIBES).map((v) => (
              <button
                key={v.key}
                onClick={() => setVibeKey(v.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  v.key === vibeKey
                    ? "bg-foreground text-background scale-105"
                    : "bg-card/70 text-foreground hover:bg-card hover:scale-105"
                }`}
              >
                {v.emoji} {v.key}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const VibeRow = ({ icon: Icon, label, value }: any) => (
  <div className="group rounded-2xl bg-card/80 p-3.5 backdrop-blur sticker transition-transform hover:-translate-y-0.5">
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3 w-3 group-hover:text-primary transition-colors" /> {label}
    </div>
    <p className="mt-1 text-sm font-semibold text-foreground leading-snug">{value}</p>
  </div>
);
