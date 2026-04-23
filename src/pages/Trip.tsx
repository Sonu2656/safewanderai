import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEmergencyNumbers } from "@/lib/emergency-numbers";
import { getNearbyPois, type Poi } from "@/lib/travel-data";
import { TripChat } from "@/components/TripChat";
import { WhisperSOS } from "@/components/WhisperSOS";
import { SafetyCard } from "@/components/SafetyCard";
import { SafetyPulse } from "@/components/SafetyPulse";
import { CurrencyConverter } from "@/components/CurrencyConverter";
import { Phrasebook } from "@/components/Phrasebook";
import { TravelEssentials } from "@/components/TravelEssentials";
import { TripVibe } from "@/components/TripVibe";
import { WanderBingo } from "@/components/WanderBingo";
import { getEssentials } from "@/lib/country-essentials";
import { TripTape } from "@/components/TripTape";
import {
  ArrowLeft, MapPin, Phone, ShieldAlert, Backpack, Coins, Languages,
  CloudSun, AlertTriangle, ShieldCheck, Heart, Building2, Pill, Landmark,
  ExternalLink, Sparkles, Compass, Trophy, Camera,
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
  const [sosSignal, setSosSignal] = useState(0);

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
  const essentials = getEssentials(trip.country);

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
        <header className="relative mt-4 grid gap-6 overflow-hidden rounded-3xl bg-gradient-hero bg-mesh p-6 shadow-card md:grid-cols-[1fr_auto] md:p-8">
          <span className="pointer-events-none absolute right-6 top-4 hidden text-3xl animate-bounce-soft md:block" aria-hidden>✨</span>
          <span className="pointer-events-none absolute left-6 bottom-4 hidden text-2xl animate-float md:block" style={{ animationDelay: "1s" }} aria-hidden>🌍</span>
          <div className="relative">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-card/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary shadow-soft backdrop-blur sticker">
              <Sparkles className="h-3 w-3" /> Trip brief
            </p>
            <h1 className="mt-3 font-display text-3xl font-black md:text-5xl">
              <span className="font-handwritten text-2xl font-bold text-muted-foreground md:text-3xl">you're going to</span><br />
              <span className="bg-gradient-coral bg-clip-text text-transparent">{trip.destination}</span>
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground text-balance">{brief.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {trip.traveller_profile && <span className="rounded-full bg-card px-3 py-1 font-bold sticker">{trip.traveller_profile}</span>}
              {trip.trip_length && <span className="rounded-full bg-card px-3 py-1 font-bold sticker">{trip.trip_length} days</span>}
              {trip.arrival_window && <span className="rounded-full bg-card px-3 py-1 font-bold sticker">{trip.arrival_window}</span>}
              {trip.priority && <span className="rounded-full bg-card px-3 py-1 font-bold sticker">{trip.priority}</span>}
            </div>
          </div>
          <div className="relative flex flex-col items-center justify-center rounded-2xl bg-card/95 p-6 shadow-soft backdrop-blur md:min-w-[180px]">
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

        {/* Quick row — always visible */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickCard icon={ShieldCheck} tone="bg-secondary-soft text-secondary" label="Advisory" value={brief.advisory_status || "—"} />
          <QuickCard icon={Phone} tone="bg-danger/10 text-danger" label="Emergency" value={emergency.general || "—"} sub={`Police ${emergency.police} · Ambulance ${emergency.ambulance}`} />
          <QuickCard icon={CloudSun} tone="bg-accent-soft text-accent-foreground" label="Weather"
            value={trip.weather ? `${trip.weather.temp}° ${trip.weather.condition}` : "—"}
            sub={trip.weather ? `Feels ${trip.weather.apparent}° · ${trip.weather.windKph} km/h` : undefined} />
          <QuickCard icon={MapPin} tone="bg-primary-soft text-primary" label="Country" value={trip.country || "—"} sub="ISO code" />
        </div>

        {/* Tabs — separate sections so it's not congested */}
        <Tabs defaultValue="vibe" className="mt-8">
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-card p-1.5 shadow-soft">
            <TabTrig value="vibe" icon={Sparkles}>Vibe</TabTrig>
            <TabTrig value="tape" icon={Camera}>Tape</TabTrig>
            <TabTrig value="safety" icon={ShieldAlert}>Safety</TabTrig>
            <TabTrig value="explore" icon={MapPin}>Explore</TabTrig>
            <TabTrig value="essentials" icon={Compass}>Essentials</TabTrig>
            <TabTrig value="play" icon={Trophy}>Play</TabTrig>
            <TabTrig value="ask" icon={Sparkles}>Ask AI</TabTrig>
          </TabsList>

          {/* VIBE — the fun, exciting first impression */}
          <TabsContent value="vibe" className="mt-6 space-y-6">
            <TripVibe destination={trip.destination} country={trip.country} />
            <div className="grid gap-6 lg:grid-cols-2">
              <Section icon={Backpack} title="Packing checklist" subtitle="Tailored to weather & trip length">
                <BulletList items={brief.packing_checklist} checkable />
              </Section>
              <Section icon={Heart} title="Cultural etiquette" subtitle="Do's & don'ts">
                <BulletList items={brief.cultural_etiquette} />
              </Section>
            </div>
          </TabsContent>

          {/* TAPE — shareable poster */}
          <TabsContent value="tape" className="mt-6">
            <Section icon={Camera} title="Trip Tape" subtitle="Your trip, as a story-ready mini-poster — save & share">
              <TripTape
                destination={trip.destination}
                country={trip.country}
                score={score}
                scoreLabel={brief.score_label || tone.label}
                weather={trip.weather}
                vibeWord={brief.vibe_word || "Main character energy"}
                emergency={emergency}
                packingTop={brief.packing_checklist?.slice(0, 1)}
                phraseLocal={brief.emergency_phrases?.[0]?.local}
                phraseEn={brief.emergency_phrases?.[0]?.phrase}
              />
            </Section>
          </TabsContent>

          {/* SAFETY — pulse, risks, emergency */}
          <TabsContent value="safety" className="mt-6 space-y-6">
            <SafetyPulse
              destination={trip.destination}
              country={trip.country}
              baseScore={score}
              weather={trip.weather}
              emergency={emergency}
              lat={trip.lat}
              lon={trip.lon}
              onPanic={() => setSosSignal((n) => n + 1)}
            />
            <div className="grid gap-6 lg:grid-cols-3">
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
              <Section icon={Phone} title="Emergency support" subtitle="Save these now">
                <div className="grid gap-2">
                  <EmergencyRow label="General" value={emergency.general} />
                  <EmergencyRow label="Police" value={emergency.police} />
                  <EmergencyRow label="Ambulance" value={emergency.ambulance} />
                  <EmergencyRow label="Fire" value={emergency.fire} />
                </div>
                <div className="mt-4">
                  <SafetyCard
                    destination={trip.destination}
                    country={trip.country}
                    emergency={emergency}
                    brief={brief}
                  />
                </div>
              </Section>
            </div>
            <Section icon={AlertTriangle} title="Local safety notes" subtitle="Warnings worth knowing">
              <BulletList items={brief.local_safety_notes} />
            </Section>
          </TabsContent>

          {/* EXPLORE — map, POIs, arrival */}
          <TabsContent value="explore" className="mt-6 space-y-6">
            <Section icon={MapPin} title="Nearby help" subtitle="Hospitals · police · pharmacies · embassies">
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
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
            <Section icon={MapPin} title="Travel moves" subtitle="Arrival & local movement tips">
              <BulletList items={brief.arrival_tips} />
            </Section>
          </TabsContent>

          {/* ESSENTIALS — money, language, plug, water */}
          <TabsContent value="essentials" className="mt-6 space-y-6">
            <Section icon={Compass} title="Travel essentials" subtitle="Plug · water · drive side · local time">
              <TravelEssentials country={trip.country} lat={trip.lat} lon={trip.lon} />
            </Section>
            <div className="grid gap-6 lg:grid-cols-2">
              <Section icon={Coins} title="Currency converter" subtitle="Live ECB rates · no app switching">
                <CurrencyConverter
                  destinationCurrency={essentials?.currency || "EUR"}
                  symbol={essentials?.currencySymbol || "€"}
                />
              </Section>
              <Section icon={Coins} title="Money snapshot" subtitle="Budget & local currency tips">
                <BulletList items={brief.money_tips} />
              </Section>
            </div>
            <Section icon={Languages} title="Phrasebook" subtitle="Tap to hear it spoken">
              <Phrasebook language={essentials?.language} languageLabel={essentials?.languageLabel} />
            </Section>
            <Section icon={Languages} title="Emergency phrases" subtitle="Help in the local language">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(brief.emergency_phrases || []).map((p: any, i: number) => (
                  <div key={i} className="rounded-xl border bg-background p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{p.phrase}</p>
                    <p className="mt-1 font-display text-lg font-semibold">{p.local}</p>
                    {p.pronunciation && <p className="text-xs italic text-muted-foreground">/{p.pronunciation}/</p>}
                  </div>
                ))}
              </div>
            </Section>
          </TabsContent>

          {/* PLAY — Wander Bingo */}
          <TabsContent value="play" className="mt-6 space-y-6">
            <WanderBingo tripId={trip.id} />
            <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary-soft/30 p-6 text-center">
              <p className="font-display text-lg font-semibold">Why play? 🎲</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                The best trips aren't checklists — they're collisions with strangeness.
                Wander Bingo nudges you off the tourist track, one square at a time.
              </p>
            </div>
          </TabsContent>

          {/* ASK AI */}
          <TabsContent value="ask" className="mt-6">
            <Section icon={Sparkles} title="Trip assistant" subtitle="Ask SafeWander a follow-up">
              <TripChat trip={trip} />
            </Section>
          </TabsContent>
        </Tabs>
      </main>

      <WhisperSOS
        destination={trip.destination}
        country={trip.country}
        emergency={emergency}
        pois={pois}
        brief={brief}
        lat={trip.lat}
        lon={trip.lon}
        openSignal={sosSignal}
      />
    </div>
  );
};

const TabTrig = ({ value, icon: Icon, children }: any) => (
  <TabsTrigger
    value={value}
    className="flex-1 min-w-[88px] gap-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft"
  >
    <Icon className="h-3.5 w-3.5" /> {children}
  </TabsTrigger>
);

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
