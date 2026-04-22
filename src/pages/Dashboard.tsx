import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { geocode, getWeather } from "@/lib/travel-data";
import { popConfetti } from "@/lib/fun";
import { Sparkles, Loader2, MapPin, Plus, Trash2, ArrowRight, Compass, PartyPopper } from "lucide-react";

type Trip = {
  id: string;
  destination: string;
  country: string | null;
  brief: any;
  created_at: string;
};

const PROFILES = [
  "Student traveller", "Solo female traveller", "First-time solo traveller",
  "Backpacker", "Business traveller", "Family with kids",
];
const ARRIVAL = ["Daytime arrival", "Night arrival", "Early morning", "Late evening"];
const PRIORITY = ["Safety first", "Balanced trip", "Budget-first trip"];

const Dashboard = () => {
  const { user, loading } = useAuth("/auth");
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);

  // form
  const [destination, setDestination] = useState("");
  const [profile, setProfile] = useState(PROFILES[0]);
  const [tripLength, setTripLength] = useState("5");
  const [arrival, setArrival] = useState(ARRIVAL[0]);
  const [priority, setPriority] = useState(PRIORITY[1]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("id,destination,country,brief,created_at")
        .order("created_at", { ascending: false });
      if (error) toast.error("Couldn't load trips");
      else setTrips((data as Trip[]) || []);
      setLoadingTrips(false);
    })();
  }, [user]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) { toast.error("Enter a destination"); return; }
    setGenerating(true);
    try {
      toast.loading("Locating destination...", { id: "gen" });
      const geo = await geocode(destination.trim());
      if (!geo) { toast.error("Couldn't find that place. Try another query.", { id: "gen" }); setGenerating(false); return; }

      toast.loading("Fetching weather...", { id: "gen" });
      const weather = await getWeather(geo.lat, geo.lon);

      toast.loading("Generating AI safety brief...", { id: "gen" });
      const { data, error } = await supabase.functions.invoke("trip-brief", {
        body: {
          destination: geo.displayName,
          country: geo.country,
          travellerProfile: profile,
          tripLength: Number(tripLength),
          arrivalWindow: arrival,
          priority,
          weather,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const { data: inserted, error: insertErr } = await supabase
        .from("trips")
        .insert({
          user_id: user!.id,
          destination: geo.city ? `${geo.city}, ${geo.country || ""}`.replace(/, $/, "") : geo.displayName,
          country: geo.countryCode || null,
          traveller_profile: profile,
          trip_length: Number(tripLength),
          arrival_window: arrival,
          priority,
          brief: data.brief,
          weather,
          lat: geo.lat,
          lon: geo.lon,
        })
        .select()
        .single();
      if (insertErr) throw insertErr;

      toast.success("Brief ready!", { id: "gen" });
      navigate(`/trip/${inserted.id}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Generation failed", { id: "gen" });
    } finally {
      setGenerating(false);
    }
  };

  const deleteTrip = async (id: string) => {
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) return toast.error("Couldn't delete");
    setTrips((t) => t.filter((x) => x.id !== id));
    toast.success("Deleted");
  };

  if (loading) return (<><Navbar /><LoadingScreen /></>);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Your dashboard</p>
            <h1 className="mt-1 font-display text-4xl font-bold md:text-5xl">Plan a safer trip</h1>
            <p className="mt-2 text-muted-foreground">Generate a fresh brief or revisit your past destinations.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Generator */}
          <section className="lg:col-span-3">
            <form onSubmit={handleGenerate} className="rounded-2xl border bg-card p-6 shadow-card md:p-8">
              <div className="mb-5 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-coral shadow-soft">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </span>
                <h2 className="font-display text-2xl font-semibold">New trip brief</h2>
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="dest">Destination</Label>
                  <Input id="dest" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Tokyo, Bangkok, Lisbon, Cape Town" required />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Tokyo", "Bangkok", "Lisbon", "Marrakech", "Mexico City"].map((c) => (
                      <button key={c} type="button" onClick={() => setDestination(c)}
                        className="rounded-full border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground hover:bg-primary-soft hover:text-primary transition-colors">
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Traveller profile</Label>
                    <Select value={profile} onValueChange={setProfile}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PROFILES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="len">Trip length (days)</Label>
                    <Input id="len" type="number" min={1} max={365} value={tripLength} onChange={(e) => setTripLength(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Arrival window</Label>
                    <Select value={arrival} onValueChange={setArrival}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ARRIVAL.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{PRIORITY.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={generating} size="lg" className="w-full bg-gradient-coral border-0 shadow-soft hover:shadow-glow">
                  {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating brief...</>
                    : <><Sparkles className="mr-2 h-4 w-4" /> Generate live brief</>}
                </Button>
              </div>
            </form>
          </section>

          {/* History */}
          <aside className="lg:col-span-2">
            <div className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">Your trips</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">{trips.length}</span>
              </div>
              {loadingTrips ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : trips.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border/70 p-8 text-center">
                  <Compass className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 text-sm font-semibold">No trips yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Generate your first brief to see it here.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {trips.map((t) => {
                    const score = t.brief?.safety_score ?? 0;
                    const tone = score >= 75 ? "text-success bg-success/10" : score >= 50 ? "text-warning bg-warning/15" : "text-danger bg-danger/10";
                    return (
                      <li key={t.id} className="group flex items-center gap-3 rounded-xl border bg-background p-3 transition-all hover:shadow-soft">
                        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg font-display font-bold ${tone}`}>{score}</span>
                        <Link to={`/trip/${t.id}`} className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{t.destination}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {new Date(t.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </Link>
                        <Link to={`/trip/${t.id}`}><Button size="icon" variant="ghost" className="h-8 w-8"><ArrowRight className="h-4 w-4" /></Button></Link>
                        <button onClick={() => deleteTrip(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
