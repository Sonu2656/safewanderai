import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  User as UserIcon, Mail, Save, Globe2, ShieldCheck, Heart, Phone,
  Droplet, Pill, Plane, Loader2, ArrowRight,
} from "lucide-react";

type Trip = { id: string; destination: string; country: string | null; brief: any; created_at: string };

const LS_KEY = "safewander.profile.extras";

type Extras = {
  emergency_contact_name: string;
  emergency_contact_phone: string;
  blood_type: string;
  allergies: string;
  medical_notes: string;
  home_country: string;
  bio: string;
};

const defaultExtras: Extras = {
  emergency_contact_name: "",
  emergency_contact_phone: "",
  blood_type: "",
  allergies: "",
  medical_notes: "",
  home_country: "",
  bio: "",
};

const Profile = () => {
  const { user, loading } = useAuth("/auth");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [extras, setExtras] = useState<Extras>(defaultExtras);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: profile }, { data: tripData }] = await Promise.all([
        supabase.from("profiles").select("display_name, email").eq("id", user.id).maybeSingle(),
        supabase.from("trips").select("id,destination,country,brief,created_at").order("created_at", { ascending: false }),
      ]);
      setDisplayName(profile?.display_name || "");
      setEmail(profile?.email || user.email || "");
      setTrips((tripData as Trip[]) || []);
      try {
        const raw = localStorage.getItem(`${LS_KEY}.${user.id}`);
        if (raw) setExtras({ ...defaultExtras, ...JSON.parse(raw) });
      } catch { /* ignore */ }
      setLoadingData(false);
    })();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() || null })
        .eq("id", user.id);
      if (error) throw error;
      localStorage.setItem(`${LS_KEY}.${user.id}`, JSON.stringify(extras));
      toast.success("Profile saved");
    } catch (err: any) {
      toast.error(err?.message || "Couldn't save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingData) return (<><Navbar /><LoadingScreen label="Loading profile..." /></>);

  // Stats
  const totalTrips = trips.length;
  const countries = new Set(trips.map((t) => t.country).filter(Boolean)).size;
  const avgScore = trips.length
    ? Math.round(trips.reduce((s, t) => s + (t.brief?.safety_score || 0), 0) / trips.length)
    : 0;
  const initial = (displayName || email || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Your traveler profile</p>
          <h1 className="mt-1 font-display text-4xl font-bold md:text-5xl">Hello, {displayName || "Traveler"}</h1>
          <p className="mt-2 text-muted-foreground">Save info that helps SafeWander tailor briefs and that you can carry into emergencies.</p>
        </div>

        {/* Identity card */}
        <section className="mb-8 grid gap-4 rounded-3xl bg-gradient-hero p-6 shadow-card md:grid-cols-[auto_1fr_auto] md:items-center md:p-8">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-coral font-display text-4xl font-bold text-primary-foreground shadow-glow">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-display text-2xl font-semibold">{displayName || "Set your name"}</p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {email}</p>
            {extras.home_country && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Globe2 className="h-3.5 w-3.5" /> Home: {extras.home_country}</p>
            )}
          </div>
          <div className="flex gap-3">
            <Stat value={totalTrips} label="Trips" />
            <Stat value={countries} label="Countries" />
            <Stat value={avgScore || "—"} label="Avg score" />
          </div>
        </section>

        <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
          {/* Basic info */}
          <Card icon={UserIcon} title="Identity" subtitle="Shown on your dashboard">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="e.g. Alex" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="home">Home country</Label>
                <Input id="home" value={extras.home_country} onChange={(e) => setExtras({ ...extras, home_country: e.target.value })} placeholder="e.g. India" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bio">Short bio (optional)</Label>
                <Textarea id="bio" value={extras.bio} onChange={(e) => setExtras({ ...extras, bio: e.target.value })} placeholder="A line about how you travel" rows={3} />
              </div>
            </div>
          </Card>

          {/* Emergency contact */}
          <Card icon={ShieldCheck} title="Emergency contact" subtitle="Shown on your offline safety card">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ec-name">Contact name</Label>
                <Input id="ec-name" value={extras.emergency_contact_name} onChange={(e) => setExtras({ ...extras, emergency_contact_name: e.target.value })} placeholder="e.g. Mum" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ec-phone">Phone (with country code)</Label>
                <Input id="ec-phone" value={extras.emergency_contact_phone} onChange={(e) => setExtras({ ...extras, emergency_contact_phone: e.target.value })} placeholder="+91 98765 43210" />
              </div>
              <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                <Phone className="mr-1 inline h-3.5 w-3.5" />
                This stays on your device. SafeWander uses it to fill your printable safety card and one-tap SOS message.
              </div>
            </div>
          </Card>

          {/* Health */}
          <Card icon={Heart} title="Health snapshot" subtitle="Critical info first responders may need">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="blood">Blood type</Label>
                  <Input id="blood" value={extras.blood_type} onChange={(e) => setExtras({ ...extras, blood_type: e.target.value })} placeholder="O+, A-, ..." />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="allergies"><Pill className="mr-1 inline h-3.5 w-3.5" />Allergies</Label>
                  <Input id="allergies" value={extras.allergies} onChange={(e) => setExtras({ ...extras, allergies: e.target.value })} placeholder="Penicillin, peanuts" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="med"><Droplet className="mr-1 inline h-3.5 w-3.5" />Medical notes</Label>
                <Textarea id="med" value={extras.medical_notes} onChange={(e) => setExtras({ ...extras, medical_notes: e.target.value })} placeholder="Conditions, medications, devices" rows={3} />
              </div>
            </div>
          </Card>

          {/* Recent trips */}
          <Card icon={Plane} title="Recent trips" subtitle="Quick access to your last destinations">
            {trips.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                No trips yet — head to your <Link to="/dashboard" className="font-semibold text-primary hover:underline">dashboard</Link> to create one.
              </div>
            ) : (
              <ul className="space-y-2">
                {trips.slice(0, 5).map((t) => {
                  const score = t.brief?.safety_score ?? 0;
                  const tone = score >= 75 ? "text-success bg-success/10" : score >= 50 ? "text-warning bg-warning/15" : "text-danger bg-danger/10";
                  return (
                    <li key={t.id}>
                      <Link to={`/trip/${t.id}`} className="flex items-center gap-3 rounded-xl border bg-background p-3 transition-all hover:shadow-soft">
                        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg font-display font-bold ${tone}`}>{score}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{t.destination}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {new Date(t.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <div className="lg:col-span-2">
            <Button type="submit" disabled={saving} size="lg" className="w-full bg-gradient-coral border-0 shadow-soft hover:shadow-glow">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save profile</>}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

const Stat = ({ value, label }: { value: number | string; label: string }) => (
  <div className="rounded-xl bg-card/85 px-3 py-2 text-center shadow-soft backdrop-blur min-w-[64px]">
    <p className="font-display text-xl font-bold leading-none">{value}</p>
    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
  </div>
);

const Card = ({ icon: Icon, title, subtitle, children }: any) => (
  <section className="rounded-2xl border bg-card p-6 shadow-soft">
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

export default Profile;
