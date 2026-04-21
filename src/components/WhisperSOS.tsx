import { useEffect, useState } from "react";
import { Phone, Copy, Volume2, X, ShieldAlert, MapPin, Heart, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { Poi } from "@/lib/travel-data";

type Props = {
  destination: string;
  country: string | null;
  emergency: { general?: string; police?: string; ambulance?: string; fire?: string };
  pois: Poi[];
  brief: any;
  lat: number | null;
  lon: number | null;
};

/**
 * Whisper Mode — a discreet SOS panel.
 * One-tap: call nearest hospital/police, copy emergency SMS with live GPS,
 * and speak the local-language "I need help" phrase out loud.
 */
export const WhisperSOS = ({ destination, country, emergency, pois, brief, lat, lon }: Props) => {
  const [open, setOpen] = useState(false);
  const [liveLat, setLiveLat] = useState<number | null>(null);
  const [liveLon, setLiveLon] = useState<number | null>(null);

  useEffect(() => {
    if (!open || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => { setLiveLat(p.coords.latitude); setLiveLon(p.coords.longitude); },
      () => { /* user denied — fall back to trip coords */ },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [open]);

  const nearestHospital = pois.find((p) => p.type === "hospital");
  const nearestPolice = pois.find((p) => p.type === "police");

  const useLat = liveLat ?? lat;
  const useLon = liveLon ?? lon;

  const helpPhrase = (brief?.emergency_phrases || []).find((p: any) =>
    /help|emergency|police|hospital/i.test(p.phrase)
  ) || (brief?.emergency_phrases || [])[0];

  const sosMessage = () => {
    const coords = useLat && useLon ? `\nLocation: https://maps.google.com/?q=${useLat},${useLon}` : "";
    return `🚨 SAFEWANDER SOS — I need help. I'm in ${destination}${country ? `, ${country}` : ""}.${coords}\nLocal emergency: ${emergency.general || emergency.police || ""}`;
  };

  const copySOS = async () => {
    try {
      await navigator.clipboard.writeText(sosMessage());
      toast.success("SOS message copied — paste it to a contact");
    } catch {
      toast.error("Could not copy");
    }
  };

  const speakPhrase = () => {
    if (!helpPhrase?.local) { toast.error("No phrase available"); return; }
    if (!("speechSynthesis" in window)) { toast.error("Voice not supported"); return; }
    const u = new SpeechSynthesisUtterance(helpPhrase.local);
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Whisper SOS"
        className="fixed bottom-6 right-6 z-40 grid h-16 w-16 place-items-center rounded-full bg-gradient-coral text-primary-foreground shadow-glow transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-primary/30"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" aria-hidden />
        <ShieldAlert className="relative h-7 w-7" strokeWidth={2.5} />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center" onClick={() => setOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md animate-fade-up rounded-t-3xl bg-card p-6 shadow-glow sm:rounded-3xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Whisper Mode</p>
                <h3 className="font-display text-2xl font-bold">Quick SOS</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {liveLat ? "Live GPS on" : "Using trip location"}
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Big call buttons */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <a
                href={`tel:${emergency.general || emergency.police || ""}`}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-danger p-4 text-destructive-foreground transition-transform hover:scale-[1.02]"
              >
                <Phone className="h-6 w-6" />
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Emergency</span>
                <span className="font-display text-2xl font-bold">{emergency.general || emergency.police || "—"}</span>
              </a>
              <a
                href={`tel:${emergency.ambulance || ""}`}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-secondary p-4 text-secondary-foreground transition-transform hover:scale-[1.02]"
              >
                <Heart className="h-6 w-6" />
                <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Ambulance</span>
                <span className="font-display text-2xl font-bold">{emergency.ambulance || "—"}</span>
              </a>
            </div>

            {/* Nearest help */}
            <div className="mt-3 grid gap-2">
              {nearestHospital && (
                <NearestRow icon={Heart} tone="bg-danger/10 text-danger" label="Nearest hospital" name={nearestHospital.name} lat={nearestHospital.lat} lon={nearestHospital.lon} />
              )}
              {nearestPolice && (
                <NearestRow icon={ShieldCheck} tone="bg-secondary-soft text-secondary" label="Nearest police" name={nearestPolice.name} lat={nearestPolice.lat} lon={nearestPolice.lon} />
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 grid gap-2">
              <button
                onClick={copySOS}
                className="flex items-center gap-3 rounded-xl border bg-background p-3 text-left transition-colors hover:bg-muted"
              >
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary"><Copy className="h-4 w-4" /></span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Copy SOS message</p>
                  <p className="text-xs text-muted-foreground">With live GPS link — paste to anyone</p>
                </div>
              </button>

              {helpPhrase && (
                <button
                  onClick={speakPhrase}
                  className="flex items-center gap-3 rounded-xl border bg-background p-3 text-left transition-colors hover:bg-muted"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent-soft text-accent-foreground"><Volume2 className="h-4 w-4" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">Speak: "{helpPhrase.phrase}"</p>
                    <p className="truncate text-xs text-muted-foreground">{helpPhrase.local}</p>
                  </div>
                </button>
              )}

              {useLat && useLon && (
                <a
                  href={`https://maps.google.com/?q=${useLat},${useLon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-xl border bg-background p-3 transition-colors hover:bg-muted"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-secondary-soft text-secondary"><MapPin className="h-4 w-4" /></span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Open my location</p>
                    <p className="text-xs text-muted-foreground">{useLat.toFixed(4)}, {useLon.toFixed(4)}</p>
                  </div>
                </a>
              )}
            </div>

            <p className="mt-4 text-center text-[11px] text-muted-foreground">
              In a real emergency, call the local number first.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

const NearestRow = ({ icon: Icon, tone, label, name, lat, lon }: any) => (
  <a
    href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`}
    target="_blank"
    rel="noreferrer"
    className="flex items-center gap-3 rounded-xl border bg-background p-3 transition-colors hover:bg-muted"
  >
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-semibold">{name}</p>
    </div>
    <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
  </a>
);
