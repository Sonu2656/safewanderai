import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getEmergencyNumbers } from "@/lib/emergency-numbers";
import { getNearbyPois, type Poi } from "@/lib/travel-data";
import { TripChat } from "@/components/TripChat";
import {
  ArrowLeft, MapPin, Phone, ShieldAlert, Backpack, Coins, Languages,
  CloudSun, AlertTriangle, ShieldCheck, Heart, Building2, Pill, Landmark,
  ExternalLink, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type TripRow = {
  id: string; destination: string; country: string | null;
  traveller_profile: string | null; trip_length: number | null;
  arrival_window: string | null; priority: string | null;
  brief: any; weather: any; lat: number | null; lon: number | null;
  created_at: string;
};

const scoreTone = (s: number) =>
  s >= 80 ? { text: "text-success", bg: "bg-success", soft: "bg-success/10", label: "Very Safe" }
  : s >= 65 ? { text: "text-success", bg: "bg-success", soft: "bg-success/10", label: "Safe" }
  : s >= 45 ? { text: "text-warning", bg: "bg-warning", soft: "bg-warning/15", label: "Caution" }
  : s >= 25 ? { text: "text-danger", bg: "bg-danger", soft: "bg-danger/10", label: "High Caution" }
  : { text: "text-danger", bg: "bg-danger", soft: "bg-danger/15", label: "Avoid" };

const levelBadge = (lvl: string) =>
  lvl === "low" ? "bg-success/15 text-success"
  : lvl === "medium" ? "bg-warning/20 text-warning"
  : "bg-danger/15 text-danger";

const Trip = () => {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth("/auth");
  const navigate = useNavigate();
  const [trip, setTrip] = useState<TripRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [pois, setPois] = useState<Poi[]>([]);
  const [poisLoading, setPoisLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    (async () => {
      const { data, error } = await supabase.from("trips").select("*").eq("id", id).maybeSingle();
      if (error || !data) { toast.error("Trip not found"); navigate("/dashboard"); return; }
      setTrip(data as TripRow);
      setLoading(false);
      if (data.lat && data.lon) {
        try {
          const p = await getNearbyPois(data.lat, data.lon);
          setPois(p);
        } catch { /* silent */ }
        setPoisLoading(false);
      } else setPoisLoading(false);
    })();
  }, [id, user, navigate]);

  if (authLoading || loading) return (<><Navbar /><LoadingScreen label="Loading your brief..." /></>);
  if (!trip) return null;

  const brief = trip.brief || {};
  const score = brief.safety_score ?? 0;
  const tone = scoreTone(score);
  const emergency = getEmergencyNumbers(trip.country || undefined);

  const mapBbox = trip.lat && trip.lon
    ? `${trip.lon - 0.04},${trip.lat - 0.025},${trip.lon + 0.04},${trip.lat + 0.025}`
    : null;
  const mapUrl = mapBbox
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${mapBbox}&layer=mapnik&marker=${trip.lat},${trip.lon}`
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        {/* Header */}
        <header className="mt-4 grid gap-6 rounded-3xl bg-gradient-hero p-6 shadow-card md:grid-cols-[1fr_auto] md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Trip brief</p>
            <h1 className="mt-1 font-display text-3xl font-bold md:text-5xl">{trip.destination}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground text-balance">{brief.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {trip.traveller_profile && <span className="rounded-full bg-card/80 px-3 py-1 font-medium backdrop-blur">{trip.traveller_profile}</span>}
              {trip.trip_length && <span className="rounded-full bg-card/80 px-3 py-1 font-medium backdrop-blur">{trip.trip_length} days</span>}
              {trip.arrival_window && <span className="rounded-full bg-card/80 px-3 py-1 font-medium backdrop-blur">{trip.arrival_window}</span>}
              {trip.priority && <span className="rounded-full bg-card/80 px-3 py-1 font-medium backdrop-blur">{trip.priority}</span>}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-2xl bg-card/90 p-6 shadow-soft backdrop-blur md:min-w-[180px]">
            <div className={`relative grid h-28 w-28 place-items-center rounded-full ${tone.soft}`}>
              <svg className="absolute inset-0" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" stroke="currentColor" className="text-border" strokeWidth="8" fill="none" />
                <circle cx="60" cy="60" r="52" stroke="currentColor" className={tone.text} strokeWidth="8" fill="none"
                  strokeDasharray={`${(score / 100) * 326.7} 326.7`} strokeLinecap="round" transform="rotate(-90 60 60)" />
              </svg>
              <div className="text-center">
                <p className={`font-display text-3xl font-bold ${tone.text}`}>{score}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">/100</p>
              </div>
            </div>
            <p className={`mt-3 font-semibold ${tone.text}`}>{brief.score_label || tone.label}</p>
          </div>
        </header>

        {/* Quick row */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickCard icon={ShieldCheck} tone="bg-secondary-soft text-secondary" label="Advisory" value={brief.advisory_status || "—"} />
          <QuickCard icon={Phone} tone="bg-danger/10 text-danger" label="Emergency" value={emergency.general || "—"} sub={`Police ${emergency.police} · Ambulance ${emergency.ambulance}`} />
          <QuickCard icon={CloudSun} tone="bg-accent-soft text-accent-foreground" label="Weather"
            value={trip.weather ? `${trip.weather.temp}° ${trip.weather.condition}` : "—"}
            sub={trip.weather ? `Feels ${trip.weather.apparent}° · ${trip.weather.windKph} km/h` : undefined} />
          <QuickCard icon={MapPin} tone="bg-primary-soft text-primary" label="Country" value={trip.country || "—"} sub="ISO code" />
        </div>

        {/* Main grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Risks */}
          <Section icon={ShieldAlert} title="Risk snapshot" subtitle="What to watch for" className="lg:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2">
              {(brief.risk_snapshot || []).map((r: any, i: number) => (
                <div key={i} className="rounded-xl border bg-background p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold">{r.category}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${levelBadge(r.level)}`}>{r.level}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.note}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Emergency */}
          <Section icon={Phone} title="Emergency support" subtitle="Save these now">
            <div className="grid gap-2">
              <EmergencyRow label="General" value={emergency.general} />
              <EmergencyRow label="Police" value={emergency.police} />
              <EmergencyRow label="Ambulance" value={emergency.ambulance} />
              <EmergencyRow label="Fire" value={emergency.fire} />
            </div>
          </Section>

          {/* Map */}
          <Section icon={MapPin} title="Nearby help" subtitle="Hospitals · police · pharmacies · embassies" className="lg:col-span-2">
            {mapUrl && (
              <div className="overflow-hidden rounded-xl border">
                <iframe title="Map" src={mapUrl} className="h-72 w-full border-0" loading="lazy" />
              </div>
            )}
            <div className="mt-4">
              {poisLoading ? (
                <p className="text-sm text-muted-foreground">Finding nearby help points...</p>
              ) : pois.length === 0 ? (
                <p className="text-sm text-muted-foreground">No nearby help points found within 3 km.</p>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {pois.slice(0, 12).map((p) => (
                    <li key={p.id} className="flex items-center gap-3 rounded-lg border bg-background p-2.5">
                      <PoiIcon type={p.type} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="text-xs capitalize text-muted-foreground">{p.type}</p>
                      </div>
                      <a href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=18/${p.lat}/${p.lon}`} target="_blank" rel="noreferrer"
                        className="text-muted-foreground hover:text-primary"><ExternalLink className="h-4 w-4" /></a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Section>

          {/* Chat */}
          <Section icon={Sparkles} title="Trip assistant" subtitle="Ask SafeWander a follow-up">
            <TripChat trip={trip} />
          </Section>

          {/* Arrival tips */}
          <Section icon={MapPin} title="Travel moves" subtitle="Arrival & local movement tips">
            <BulletList items={brief.arrival_tips} />
          </Section>

          {/* Packing */}
          <Section icon={Backpack} title="Packing checklist" subtitle="Tailored to weather & trip length">
            <BulletList items={brief.packing_checklist} checkable />
          </Section>

          {/* Local notes */}
          <Section icon={AlertTriangle} title="Local safety notes" subtitle="Warnings worth knowing">
            <BulletList items={brief.local_safety_notes} />
          </Section>

          {/* Money */}
          <Section icon={Coins} title="Money snapshot" subtitle="Budget & local currency tips">
            <BulletList items={brief.money_tips} />
          </Section>

          {/* Etiquette */}
          <Section icon={Heart} title="Cultural etiquette" subtitle="Do's & don'ts">
            <BulletList items={brief.cultural_etiquette} />
          </Section>

          {/* Phrases */}
          <Section icon={Languages} title="Emergency phrases" subtitle="Help in the local language" className="lg:col-span-2">
            <div className="grid gap-3 sm:grid-cols-2">
              {(brief.emergency_phrases || []).map((p: any, i: number) => (
                <div key={i} className="rounded-xl border bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{p.phrase}</p>
                  <p className="mt-1 font-display text-lg font-semibold">{p.local}</p>
                  {p.pronunciation && <p className="text-xs italic text-muted-foreground">/{p.pronunciation}/</p>}
                </div>
              ))}
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
};

const QuickCard = ({ icon: Icon, tone, label, value, sub }: any) => (
  <div className="rounded-2xl border bg-card p-4 shadow-soft">
    <div className="flex items-start gap-3">
      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="h-5 w-5" /></span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate font-semibold">{value}</p>
        {sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  </div>
);

const Section = ({ icon: Icon, title, subtitle, children, className = "" }: any) => (
  <section className={`rounded-2xl border bg-card p-6 shadow-soft ${className}`}>
    <div className="mb-4 flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary"><Icon className="h-4 w-4" /></span>
      <div>
        <h2 className="font-display text-lg font-semibold leading-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
    {children}
  </section>
);

const BulletList = ({ items, checkable }: { items?: string[]; checkable?: boolean }) => {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  if (!items?.length) return <p className="text-sm text-muted-foreground">No data.</p>;
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm">
          {checkable ? (
            <button onClick={() => setChecked((c) => ({ ...c, [i]: !c[i] }))}
              className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded border-2 transition-colors ${checked[i] ? "border-primary bg-primary" : "border-border"}`}>
              {checked[i] && <span className="text-[10px] text-primary-foreground">✓</span>}
            </button>
          ) : (
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          )}
          <span className={checked[i] ? "text-muted-foreground line-through" : ""}>{it}</span>
        </li>
      ))}
    </ul>
  );
};

const EmergencyRow = ({ label, value }: { label: string; value?: string }) => (
  <a href={value ? `tel:${value}` : undefined} className="group flex items-center justify-between rounded-lg border bg-background p-3 transition-colors hover:bg-primary-soft">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <span className="font-display text-xl font-bold text-foreground group-hover:text-primary">{value || "—"}</span>
  </a>
);

const PoiIcon = ({ type }: { type: Poi["type"] }) => {
  const map = {
    hospital: { Icon: Heart, tone: "bg-danger/10 text-danger" },
    police: { Icon: ShieldCheck, tone: "bg-secondary-soft text-secondary" },
    pharmacy: { Icon: Pill, tone: "bg-success/10 text-success" },
    embassy: { Icon: Landmark, tone: "bg-accent-soft text-accent-foreground" },
  } as const;
  const { Icon, tone } = map[type] || { Icon: Building2, tone: "bg-muted text-muted-foreground" };
  return <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span>;
};

export default Trip;
