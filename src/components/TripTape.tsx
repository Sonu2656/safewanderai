import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Download, Share2, Sparkles, Camera } from "lucide-react";
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
  { name: "Sunset", bg: "bg-gradient-tape", accent: "bg-accent text-accent-foreground" },
  { name: "Aurora", bg: "bg-gradient-aurora", accent: "bg-card text-foreground" },
  { name: "Coral", bg: "bg-gradient-coral", accent: "bg-card text-foreground" },
  { name: "Sun", bg: "bg-gradient-sun", accent: "bg-foreground text-background" },
];

export const TripTape = ({
  destination, country, score, scoreLabel, weather,
  vibeWord = "Main character energy", emergency, packingTop = [],
  phraseLocal, phraseEn, date,
}: Props) => {
  const tapeRef = useRef<HTMLDivElement>(null);
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const palette = PALETTES[paletteIdx];

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
    a.download = `safewander-${destination.toLowerCase().replace(/\s+/g, "-")}.png`;
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

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-soft">
        <div>
          <p className="font-display text-lg font-bold flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" /> Trip Tape
          </p>
          <p className="text-xs text-muted-foreground">A shareable mini-poster of your trip. Screenshot worthy.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
          <Button onClick={handleDownload} disabled={busy} size="sm" variant="outline" className="gap-1.5 sticker">
            <Download className="h-4 w-4" /> Save
          </Button>
          <Button onClick={handleShare} disabled={busy} size="sm" className="gap-1.5 bg-gradient-coral border-0">
            <Share2 className="h-4 w-4" /> Share
          </Button>
        </div>
      </div>

      {/* The Tape — 9:16 poster, Insta-story friendly */}
      <div className="flex justify-center">
        <div
          ref={tapeRef}
          className={`relative aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-3xl ${palette.bg} text-white shadow-glow`}
        >
          {/* Decorative blobs */}
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-black/10 blur-2xl" />

          {/* Header strip */}
          <div className="relative flex items-center justify-between px-5 pt-5 text-[10px] font-bold uppercase tracking-[0.2em]">
            <span>SafeWander</span>
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
            {weather?.temp != null && (
              <Stat label="Right now" value={`${weather.temp}° ${weather.condition || ""}`} />
            )}
            {emergency?.general && (
              <Stat label="SOS" value={emergency.general} />
            )}
            {packingTop[0] && (
              <Stat label="Don't forget" value={packingTop[0]} />
            )}
            {phraseLocal && (
              <Stat label={`"${phraseEn || "Hi"}"`} value={phraseLocal} />
            )}
          </div>

          {/* Footer signature */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-5 py-4 text-[10px] font-bold uppercase tracking-widest">
            <span className="inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> safewander.app
            </span>
            <span className="opacity-80">wander wild · worry less</span>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Pick a palette → save or share. Drop it on your story, send it to mum so she stops worrying.
      </p>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-white/15 px-2.5 py-2 backdrop-blur">
    <p className="text-[9px] font-bold uppercase tracking-wider opacity-80 truncate">{label}</p>
    <p className="text-sm font-bold leading-tight truncate">{value}</p>
  </div>
);
