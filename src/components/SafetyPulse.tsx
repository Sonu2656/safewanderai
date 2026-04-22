import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, Moon, Sun, Sunrise, Sunset, BatteryWarning, Battery, BatteryCharging,
  Vibrate, Share2, Copy, Clock, Wifi, WifiOff, ShieldAlert, Sparkles, X, Check,
} from "lucide-react";
import { toast } from "sonner";

type Props = {
  destination: string;
  country: string | null;
  baseScore: number;
  weather: any;
  emergency: { general?: string; police?: string; ambulance?: string };
  lat: number | null;
  lon: number | null;
  onPanic: () => void;
};

type Phase = "dawn" | "day" | "dusk" | "night";

const phaseFromHour = (h: number): Phase =>
  h >= 5 && h < 8 ? "dawn"
  : h >= 8 && h < 17 ? "day"
  : h >= 17 && h < 20 ? "dusk"
  : "night";

const phaseMeta: Record<Phase, { label: string; tip: string; Icon: any; tone: string }> = {
  dawn:  { label: "Dawn",  tip: "Quiet streets — most areas waking up. Good time to move.",       Icon: Sunrise, tone: "from-amber-200 to-rose-200 text-amber-900" },
  day:   { label: "Daytime", tip: "Peak safety window. Ideal for exploring & long transit.",        Icon: Sun,     tone: "from-yellow-200 to-amber-200 text-amber-900" },
  dusk:  { label: "Dusk",  tip: "Visibility drops. Stick to busy, lit streets.",                  Icon: Sunset,  tone: "from-orange-200 to-pink-300 text-rose-900" },
  night: { label: "Night", tip: "Elevated caution. Avoid shortcuts, share live location.",        Icon: Moon,    tone: "from-indigo-300 to-violet-400 text-indigo-950" },
};

/**
 * Safety Pulse — a live, sensor-driven safety companion.
 * - Time-of-day risk window with dynamic score adjustment
 * - Shake-to-Alert (3 shakes triggers SOS)
 * - Battery Guardian (warns + suggests power saving)
 * - Online/Offline awareness
 * - Trust Circle check-in (one-tap shareable status)
 */
export const SafetyPulse = ({
  destination, country, baseScore, weather, emergency, lat, lon, onPanic,
}: Props) => {
  const [now, setNow] = useState(new Date());
  const [battery, setBattery] = useState<{ level: number; charging: boolean } | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [shakeArmed, setShakeArmed] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const lastShakeRef = useRef(0);
  const lastAccelRef = useRef<{ x: number; y: number; z: number } | null>(null);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Battery API
  useEffect(() => {
    const nav: any = navigator;
    if (!nav.getBattery) return;
    let bat: any;
    nav.getBattery().then((b: any) => {
      bat = b;
      const update = () => setBattery({ level: Math.round(b.level * 100), charging: b.charging });
      update();
      b.addEventListener("levelchange", update);
      b.addEventListener("chargingchange", update);
    });
    return () => {
      if (bat) {
        bat.removeEventListener?.("levelchange", () => {});
        bat.removeEventListener?.("chargingchange", () => {});
      }
    };
  }, []);

  // Online/offline
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  // Shake detection
  useEffect(() => {
    if (!shakeArmed) return;
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a || a.x == null || a.y == null || a.z == null) return;
      const last = lastAccelRef.current;
      lastAccelRef.current = { x: a.x, y: a.y, z: a.z };
      if (!last) return;
      const delta = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z);
      if (delta > 30) {
        const t = Date.now();
        if (t - lastShakeRef.current > 400) {
          lastShakeRef.current = t;
          setShakeCount((c) => {
            const next = c + 1;
            if (next >= 3) {
              onPanic();
              toast.success("🚨 Panic gesture detected — SOS opened");
              return 0;
            }
            return next;
          });
        }
      }
    };
    window.addEventListener("devicemotion", handler);
    const reset = setInterval(() => setShakeCount(0), 4000);
    return () => { window.removeEventListener("devicemotion", handler); clearInterval(reset); };
  }, [shakeArmed, onPanic]);

  const armShake = async () => {
    const DM: any = (window as any).DeviceMotionEvent;
    if (DM && typeof DM.requestPermission === "function") {
      try {
        const res = await DM.requestPermission();
        if (res !== "granted") { toast.error("Motion permission denied"); return; }
      } catch { toast.error("Could not enable motion"); return; }
    }
    setShakeArmed(true);
    toast.success("Shake-to-Alert armed — shake phone 3× for SOS");
  };

  const phase = phaseFromHour(now.getHours());
  const meta = phaseMeta[phase];
  const PhaseIcon = meta.Icon;

  // Dynamic score: base + modifiers
  const liveScore = useMemo(() => {
    let s = baseScore;
    if (phase === "night") s -= 10;
    else if (phase === "dusk") s -= 4;
    else if (phase === "dawn") s -= 2;
    if (battery && battery.level < 20 && !battery.charging) s -= 5;
    if (!online) s -= 3;
    if (weather?.condition && /storm|rain|snow|fog/i.test(weather.condition)) s -= 3;
    return Math.max(5, Math.min(100, Math.round(s)));
  }, [baseScore, phase, battery, online, weather]);

  const scoreTone =
    liveScore >= 75 ? "text-success"
    : liveScore >= 50 ? "text-warning"
    : "text-danger";

  // Trust Circle check-in
  const shareCheckIn = async () => {
    const coords = lat && lon ? `https://maps.google.com/?q=${lat},${lon}` : "";
    const text = `✓ Safe check-in from ${destination}${country ? `, ${country}` : ""} at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.${coords ? `\nLast seen: ${coords}` : ""}\n— sent via SafeWander`;
    if (navigator.share) {
      try { await navigator.share({ title: "Safe check-in", text }); return; } catch { /* fallthrough */ }
    }
    try { await navigator.clipboard.writeText(text); toast.success("Check-in copied — share with your trust circle"); }
    catch { toast.error("Could not share"); }
  };

  return (
    <section className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${meta.tone} p-5 shadow-soft`}>
      {/* Ambient pulse */}
      <span className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/30 blur-2xl" aria-hidden />
      <span className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/20 blur-2xl" aria-hidden />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-80">
            <Activity className="h-3.5 w-3.5" />
            <span>Safety Pulse · Live</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/60 backdrop-blur">
              <PhaseIcon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-2xl font-bold leading-tight">{meta.label} mode</h3>
              <p className="text-xs opacity-80">
                {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · local feel
              </p>
            </div>
          </div>
          <p className="mt-3 max-w-xs text-sm font-medium opacity-90">{meta.tip}</p>
        </div>

        <div className="shrink-0 rounded-2xl bg-white/70 p-3 text-center backdrop-blur">
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">Live score</p>
          <p className={`font-display text-3xl font-bold ${scoreTone}`}>{liveScore}</p>
          <p className="text-[10px] text-foreground/60">base {baseScore}</p>
        </div>
      </div>

      {/* Status chips */}
      <div className="relative mt-4 flex flex-wrap gap-2 text-xs">
        <Chip
          icon={battery ? (battery.charging ? BatteryCharging : battery.level < 20 ? BatteryWarning : Battery) : Battery}
          label={battery ? `${battery.level}%${battery.charging ? " ⚡" : ""}` : "Battery —"}
          tone={battery && battery.level < 20 && !battery.charging ? "danger" : "default"}
        />
        <Chip icon={online ? Wifi : WifiOff} label={online ? "Online" : "Offline"} tone={online ? "default" : "warn"} />
        <Chip
          icon={Vibrate}
          label={shakeArmed ? `Shake armed${shakeCount ? ` · ${shakeCount}/3` : ""}` : "Shake off"}
          tone={shakeArmed ? "success" : "default"}
        />
        <Chip icon={Clock} label={`${phase}`} />
      </div>

      {/* Actions */}
      <div className="relative mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {!shakeArmed ? (
          <button onClick={armShake} className="flex items-center justify-center gap-2 rounded-xl bg-foreground/90 px-3 py-2.5 text-sm font-semibold text-background transition-transform hover:scale-[1.02]">
            <Vibrate className="h-4 w-4" /> Arm Shake-SOS
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-success/90 px-3 py-2.5 text-sm font-semibold text-white">
            <Check className="h-4 w-4" /> Shake armed
          </div>
        )}
        <button onClick={shareCheckIn} className="flex items-center justify-center gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-sm font-semibold text-foreground backdrop-blur transition-transform hover:scale-[1.02]">
          <Share2 className="h-4 w-4" /> Trust check-in
        </button>
        <button onClick={() => setExpanded((v) => !v)} className="flex items-center justify-center gap-2 rounded-xl bg-white/80 px-3 py-2.5 text-sm font-semibold text-foreground backdrop-blur transition-transform hover:scale-[1.02]">
          <Sparkles className="h-4 w-4" /> {expanded ? "Hide" : "Why this score?"}
        </button>
      </div>

      {expanded && (
        <div className="relative mt-3 animate-fade-up rounded-xl bg-white/70 p-3 text-sm backdrop-blur">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground/70">Live modifiers</p>
          <ul className="space-y-1 text-xs text-foreground/80">
            <li>· Time phase <strong className="text-foreground">{phase}</strong> {phase === "night" ? "(−10)" : phase === "dusk" ? "(−4)" : phase === "dawn" ? "(−2)" : "(0)"}</li>
            {battery && <li>· Battery {battery.level}%{battery.level < 20 && !battery.charging ? " (−5 low)" : " (0)"}</li>}
            <li>· Connectivity {online ? "(0)" : "(−3 offline)"}</li>
            {weather?.condition && <li>· Weather "{weather.condition}" {/storm|rain|snow|fog/i.test(weather.condition) ? "(−3)" : "(0)"}</li>}
            <li className="pt-1 text-foreground/70">Score recalculates in real time as conditions change.</li>
          </ul>
        </div>
      )}

      {battery && battery.level < 20 && !battery.charging && (
        <div className="relative mt-3 flex items-start gap-2 rounded-xl bg-danger/15 p-3 text-xs text-danger">
          <BatteryWarning className="h-4 w-4 shrink-0" />
          <p><strong>Battery Guardian:</strong> Below 20%. Save offline safety card now and keep emergency numbers handy.</p>
        </div>
      )}
    </section>
  );
};

const Chip = ({ icon: Icon, label, tone = "default" }: { icon: any; label: string; tone?: "default" | "danger" | "warn" | "success" }) => {
  const styles = {
    default: "bg-white/70 text-foreground/80",
    danger:  "bg-danger/20 text-danger",
    warn:    "bg-warning/25 text-warning",
    success: "bg-success/20 text-success",
  }[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 backdrop-blur ${styles}`}>
      <Icon className="h-3.5 w-3.5" />
      <span className="font-medium">{label}</span>
    </span>
  );
};
