import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, Share2, Sparkles, Camera, Copy, Shuffle, Type, Layers } from "lucide-react";
import { popConfetti } from "@/lib/fun";
import { toast } from "sonner";

type Props = {
  destination: string;
  country: string | null;
  score: number;
  scoreLabel?: string;
  weather?: { temp?: number; condition?: string } | null;
  vibeWord?: string;
  emergency?: { general?: string };
  packingTop?: string[];
  phraseLocal?: string;
  phraseEn?: string;
  date?: string;
};

const PALETTES = [
  { name: "Sunset", bg: "bg-gradient-tape", accent: "bg-accent text-accent-foreground", ink: "text-white" },
  { name: "Aurora", bg: "bg-gradient-aurora", accent: "bg-card text-foreground", ink: "text-white" },
  { name: "Coral", bg: "bg-gradient-coral", accent: "bg-card text-foreground", ink: "text-white" },
  { name: "Sun", bg: "bg-gradient-sun", accent: "bg-foreground text-background", ink: "text-foreground" },
  { name: "Y2K", bg: "bg-gradient-y2k", accent: "bg-foreground text-background", ink: "text-white" },
  { name: "Mesh", bg: "bg-mesh bg-background", accent: "bg-foreground text-background", ink: "text-foreground" },
];

const LAYOUTS = [
  { id: "story", name: "Story", icon: "📱" },
  { id: "polaroid", name: "Polaroid", icon: "📷" },
  { id: "ticket", name: "Ticket", icon: "🎟️" },
] as const;

const STAMPS = ["✈️", "🌍", "✨", "📍", "🧳", "🗺️", "💌", "🌟"];

const HYPE_CAPTIONS = [
  "Just planned {dest} with @SafeWander — main character era loading ✨",
  "{dest} got me feral. Brief in hand, vibes immaculate. 🌍",
  "Booked it. Briefed it. Boarded (mentally). {dest} we're coming.",
  "POV: you actually know what you're doing in {dest} 🧳✨",
  "Romanticising {dest} before I even land. Try and stop me.",
];

export const TripTape = ({
  destination, country, score, scoreLabel, weather,
  vibeWord = "Main character energy", emergency, packingTop = [],
  phraseLocal, phraseEn, date,
}: Props) => {
  const tapeRef = useRef<HTMLDivElement>(null);
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [layoutIdx, setLayoutIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [stampSeed, setStampSeed] = useState(0);
  const palette = PALETTES[paletteIdx];
  const layout = LAYOUTS[layoutIdx];

  const dateStr = date || new Date().toLocaleDateString(undefined, { month: "short", year: "numeric" });

  const generate = async (): Promise<string | null> => {
    if (!tapeRef.current) return null;
    setBusy(true);
    try {
      const dataUrl = await toPng(tapeRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "transparent",
      });
      return dataUrl;
    } catch (e) {
      console.error(e);
      toast.error("Couldn't render the tape. Try again?");
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async () => {
    const url = await generate();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `safewander-${destination.toLowerCase().replace(/\s+/g, "-")}-${layout.id}.png`;
    a.click();
    popConfetti({ y: 0.4 });
    toast.success("Saved! Post it & tag your travel buddies 📸");
  };

  const handleShare = async () => {
    const url = await generate();
    if (!url) return;
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], `safewander-${destination}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `My ${destination} trip tape`,
          text: `Just planned ${destination} with SafeWander ✨`,
        });
        popConfetti({ y: 0.4 });
      } else {
        handleDownload();
      }
    } catch {
      // user cancelled — silent
    }
  };

  const copyCaption = () => {
    const cap = HYPE_CAPTIONS[Math.floor(Math.random() * HYPE_CAPTIONS.length)].replace("{dest}", destination);
    navigator.clipboard?.writeText(cap);
    toast.success("Caption copied — paste it on your post 🎤");
  };

  const remixStamps = () => {
    setStampSeed((s) => s + 1);
    popConfetti({ y: 0.4 });
  };

  // Pick 3 stamps based on seed
  const activeStamps = [0, 1, 2].map((i) => STAMPS[(stampSeed + i * 3) % STAMPS.length]);

  return (
    <div className="space-y-4">
      {/* Controls — header */}
      <div className="rounded-2xl bg-card p-4 shadow-soft space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-lg font-bold flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" /> Trip Tape
            </p>
            <p className="text-xs text-muted-foreground">A shareable mini-poster of your trip. Screenshot worthy.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={copyCaption} size="sm" variant="outline" className="gap-1.5 sticker">
              <Copy className="h-4 w-4" /> Caption
            </Button>
            <Button onClick={remixStamps} size="sm" variant="outline" className="gap-1.5 sticker">
              <Shuffle className="h-4 w-4" /> Remix
            </Button>
            <Button onClick={handleDownload} disabled={busy} size="sm" variant="outline" className="gap-1.5 sticker">
              <Download className="h-4 w-4" /> Save
            </Button>
            <Button onClick={handleShare} disabled={busy} size="sm" className="gap-1.5 bg-gradient-coral border-0">
              <Share2 className="h-4 w-4" /> Share
            </Button>
          </div>
        </div>

        {/* Layout switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Layout</span>
          </div>
          <div className="flex gap-1.5">
            {LAYOUTS.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setLayoutIdx(i)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                  layoutIdx === i ? "bg-foreground text-background scale-105" : "bg-muted text-foreground hover:bg-muted/70"
                }`}
              >
                {l.icon} {l.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <Type className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Palette</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-muted p-1">
            {PALETTES.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setPaletteIdx(i)}
                className={`h-7 w-7 rounded-full ${p.bg} transition-transform ${paletteIdx === i ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-card" : "opacity-60 hover:opacity-100"}`}
                aria-label={`${p.name} palette`}
                title={p.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* The Tape */}
      <div className="flex justify-center">
        {layout.id === "story" && (
          <StoryLayout
            tapeRef={tapeRef} palette={palette} destination={destination} country={country}
            score={score} scoreLabel={scoreLabel} weather={weather} vibeWord={vibeWord}
            emergency={emergency} packingTop={packingTop} phraseLocal={phraseLocal} phraseEn={phraseEn}
            dateStr={dateStr} stamps={activeStamps}
          />
        )}
        {layout.id === "polaroid" && (
          <PolaroidLayout
            tapeRef={tapeRef} palette={palette} destination={destination} country={country}
            score={score} vibeWord={vibeWord} dateStr={dateStr} stamps={activeStamps}
            weather={weather}
          />
        )}
        {layout.id === "ticket" && (
          <TicketLayout
            tapeRef={tapeRef} palette={palette} destination={destination} country={country}
            score={score} scoreLabel={scoreLabel} dateStr={dateStr} weather={weather}
            phraseLocal={phraseLocal} phraseEn={phraseEn}
          />
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Pick a layout, palette & remix the stamps → save or share. Drop it on your story 🎉
      </p>
    </div>
  );
};

/* ============ LAYOUTS ============ */

const StoryLayout = ({ tapeRef, palette, destination, country, score, scoreLabel, weather, vibeWord, emergency, packingTop, phraseLocal, phraseEn, dateStr, stamps }: any) => (
  <div
    ref={tapeRef}
    className={`relative aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-3xl ${palette.bg} ${palette.ink} shadow-glow`}
  >
    {/* Decorative blobs */}
    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/20 blur-2xl animate-bounce-soft" />
    <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-black/10 blur-2xl" />

    {/* Floating stamps */}
    {stamps.map((s: string, i: number) => (
      <div
        key={i}
        className="absolute text-3xl select-none animate-float drop-shadow-lg"
        style={{
          right: i === 0 ? "12px" : i === 1 ? "auto" : "60px",
          left: i === 1 ? "12px" : "auto",
          top: i === 0 ? "70px" : i === 1 ? "200px" : "auto",
          bottom: i === 2 ? "80px" : "auto",
          transform: `rotate(${(i - 1) * 12}deg)`,
          animationDelay: `${i * 0.7}s`,
        }}
      >{s}</div>
    ))}

    {/* Header strip */}
    <div className="relative flex items-center justify-between px-5 pt-5 text-[10px] font-bold uppercase tracking-[0.2em]">
      <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> SafeWander</span>
      <span>{dateStr}</span>
    </div>

    {/* Big destination */}
    <div className="relative px-5 pt-8">
      <p className="font-handwritten text-2xl leading-none opacity-90">currently in</p>
      <h2 className="mt-1 font-display text-[44px] font-black leading-[0.95] tracking-tight">
        {destination}
      </h2>
      {country && (
        <p className="mt-1 text-xs font-semibold uppercase tracking-widest opacity-80">{country}</p>
      )}
    </div>

    {/* Score chip */}
    <div className="relative mt-5 px-5">
      <div className={`inline-flex items-center gap-3 rounded-2xl ${palette.accent} px-3 py-2 shadow-card`}>
        <span className="font-display text-3xl font-black leading-none">{score}</span>
        <div className="text-left">
          <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">Safety vibe</p>
          <p className="text-xs font-bold">{scoreLabel || "Check the brief"}</p>
        </div>
      </div>
    </div>

    {/* Vibe word */}
    <div className="relative mt-5 px-5">
      <p className="font-handwritten text-xl leading-tight opacity-90">the vibe is</p>
      <p className="mt-0.5 font-display text-2xl font-bold leading-tight italic">"{vibeWord}"</p>
    </div>

    {/* Stat row */}
    <div className="relative mt-5 grid grid-cols-2 gap-2 px-5">
      {weather?.temp != null && (<Stat label="Right now" value={`${weather.temp}° ${weather.condition || ""}`} />)}
      {emergency?.general && (<Stat label="SOS" value={emergency.general} />)}
      {packingTop?.[0] && (<Stat label="Don't forget" value={packingTop[0]} />)}
      {phraseLocal && (<Stat label={`"${phraseEn || "Hi"}"`} value={phraseLocal} />)}
    </div>

    {/* Footer signature */}
    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 py-4 text-[10px] font-bold uppercase tracking-widest">
      <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> safewander.app</span>
      <span className="opacity-80">wander wild · worry less</span>
    </div>
  </div>
);

const PolaroidLayout = ({ tapeRef, palette, destination, country, score, vibeWord, dateStr, stamps, weather }: any) => (
  <div
    ref={tapeRef}
    className="relative w-full max-w-[320px] rounded-md bg-white p-4 shadow-glow rotate-[-2deg]"
    style={{ transform: "rotate(-2deg)" }}
  >
    {/* The "photo" area */}
    <div className={`relative aspect-square overflow-hidden rounded-sm ${palette.bg} ${palette.ink} flex flex-col items-center justify-center p-6 text-center`}>
      <div className="absolute inset-0 bg-mesh opacity-30" />
      {stamps.map((s: string, i: number) => (
        <div
          key={i}
          className="absolute text-3xl select-none drop-shadow-lg"
          style={{
            top: i === 0 ? "12px" : "auto",
            bottom: i === 1 ? "12px" : i === 2 ? "12px" : "auto",
            left: i === 0 ? "12px" : i === 1 ? "12px" : "auto",
            right: i === 2 ? "12px" : "auto",
            transform: `rotate(${(i - 1) * 15}deg)`,
          }}
        >{s}</div>
      ))}
      <div className="relative">
        <p className="font-handwritten text-xl opacity-90">greetings from</p>
        <h2 className="mt-1 font-display text-4xl font-black leading-none tracking-tight">{destination}</h2>
        {country && <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">{country}</p>}
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-foreground">
          <span className="font-display text-base font-black">{score}/100</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">safe</span>
        </div>
      </div>
    </div>
    {/* Polaroid caption */}
    <div className="px-2 pt-3 pb-1 text-foreground">
      <p className="font-handwritten text-2xl leading-tight">"{vibeWord}"</p>
      <div className="mt-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        <span>{dateStr}</span>
        {weather?.temp != null && <span>{weather.temp}° · {weather.condition}</span>}
        <span>safewander.app</span>
      </div>
    </div>
  </div>
);

const TicketLayout = ({ tapeRef, palette, destination, country, score, scoreLabel, dateStr, weather, phraseLocal, phraseEn }: any) => (
  <div ref={tapeRef} className="relative w-full max-w-[360px]">
    <div className={`relative overflow-hidden rounded-2xl ${palette.bg} ${palette.ink} shadow-glow`}>
      {/* Perforated divider */}
      <div className="absolute left-0 right-0 top-[68%] flex items-center justify-between px-2">
        <div className="h-6 w-6 rounded-full bg-background -ml-3" />
        <div className="flex-1 mx-2 border-t-2 border-dashed border-current opacity-40" />
        <div className="h-6 w-6 rounded-full bg-background -mr-3" />
      </div>

      {/* Top: boarding info */}
      <div className="p-5 pb-10">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] opacity-90">
          <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> Boarding pass</span>
          <span>{dateStr}</span>
        </div>

        <div className="mt-4 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">From</p>
            <p className="font-display text-3xl font-black leading-none">YOU</p>
          </div>
          <div className="flex-1 px-2">
            <div className="relative h-px bg-current opacity-40 my-3">
              <span className="absolute left-1/2 -translate-x-1/2 -top-3 text-2xl">✈️</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">To</p>
            <p className="font-display text-3xl font-black leading-none truncate max-w-[140px]">{destination}</p>
          </div>
        </div>

        {country && (
          <p className="mt-2 text-center text-[10px] font-bold uppercase tracking-[0.3em] opacity-80">{country}</p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-white/15 p-2 backdrop-blur">
            <p className="text-[9px] font-bold uppercase tracking-wider opacity-80">Safety</p>
            <p className="font-display text-lg font-black leading-none">{score}</p>
          </div>
          <div className="rounded-lg bg-white/15 p-2 backdrop-blur">
            <p className="text-[9px] font-bold uppercase tracking-wider opacity-80">Weather</p>
            <p className="font-display text-lg font-black leading-none">{weather?.temp != null ? `${weather.temp}°` : "—"}</p>
          </div>
          <div className="rounded-lg bg-white/15 p-2 backdrop-blur">
            <p className="text-[9px] font-bold uppercase tracking-wider opacity-80">Status</p>
            <p className="font-display text-xs font-black leading-tight pt-1">{scoreLabel || "Ready"}</p>
          </div>
        </div>
      </div>

      {/* Stub */}
      <div className="px-5 pt-6 pb-5">
        {phraseLocal ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider opacity-80">Say it like a local</p>
              <p className="font-display text-base font-bold">"{phraseLocal}"</p>
              {phraseEn && <p className="text-[10px] opacity-80">{phraseEn}</p>}
            </div>
            <div className="text-right text-[9px] font-bold uppercase tracking-[0.2em] opacity-80">
              <p>safewander.app</p>
              <p className="mt-1">wander wild</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
            <span>safewander.app</span>
            <span>wander wild · worry less</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-white/15 px-2.5 py-2 backdrop-blur">
    <p className="text-[9px] font-bold uppercase tracking-wider opacity-80 truncate">{label}</p>
    <p className="text-sm font-bold leading-tight truncate">{value}</p>
  </div>
);
