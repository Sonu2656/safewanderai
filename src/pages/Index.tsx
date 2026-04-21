import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import heroImg from "@/assets/hero-globe.jpg";
import {
  ShieldCheck, MapPin, Phone, CloudSun, MessageCircle, Sparkles, Globe2, Users, ArrowRight,
} from "lucide-react";

const features = [
  { icon: ShieldCheck, color: "bg-primary-soft text-primary", title: "AI Safety Score", desc: "An at-a-glance score with the why behind it — risk categories, advisories, and what to actually watch for." },
  { icon: Phone, color: "bg-secondary-soft text-secondary", title: "Emergency Numbers", desc: "Police, ambulance, and fire numbers for 60+ countries — saved offline-friendly when you arrive." },
  { icon: MapPin, color: "bg-accent-soft text-accent-foreground", title: "Nearby Help Map", desc: "Hospitals, police stations, pharmacies and embassies plotted around your destination." },
  { icon: CloudSun, color: "bg-primary-soft text-primary", title: "Live Weather & Packing", desc: "Real conditions feed a packing checklist tailored to your trip length and weather." },
  { icon: MessageCircle, color: "bg-secondary-soft text-secondary", title: "AI Chat Assistant", desc: "Ask follow-ups about scams, transport, culture or solo-travel safety — answered with your trip in mind." },
  { icon: Sparkles, color: "bg-accent-soft text-accent-foreground", title: "Personalised", desc: "Briefs adapt to student, solo female, first-timer, backpacker or business traveller profiles." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-70" aria-hidden />
        <div className="container relative grid gap-12 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> AI Travel Intelligence
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight text-balance md:text-6xl lg:text-7xl">
              Travel anywhere,<br />
              <span className="bg-gradient-coral bg-clip-text text-transparent">stay safer.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground text-balance">
              SafeWander turns live destination data into a clear safety brief —
              before you leave and while you travel. Built for students, solo travellers, and anyone exploring somewhere new.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/auth?mode=signup">
                <Button size="lg" className="gap-2 bg-gradient-coral border-0 shadow-glow hover:scale-[1.02] transition-transform">
                  Plan your first trip <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-2">I already have an account</Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Globe2 className="h-4 w-4 text-secondary" /> 60+ countries</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> Built for solo travellers</span>
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> Live data sources</span>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "120ms" }}>
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-sun opacity-30 blur-3xl" aria-hidden />
            <div className="relative animate-float">
              <img
                src={heroImg}
                alt="Stylised globe with paper airplane orbiting"
                width={1280}
                height={960}
                className="mx-auto w-full max-w-md drop-shadow-2xl"
              />
            </div>
            <div className="absolute -bottom-2 left-4 hidden rounded-2xl bg-card/95 p-4 shadow-card backdrop-blur md:block">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Tokyo · Score</p>
                  <p className="font-display text-2xl font-bold text-success">92</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-2 right-4 hidden rounded-2xl bg-card/95 p-4 shadow-card backdrop-blur md:block">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent-foreground">
                  <CloudSun className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Live weather</p>
                  <p className="font-display text-lg font-bold">22° Clear</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Everything you need</span>
          <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">One brief. Every answer.</h2>
          <p className="mt-4 text-muted-foreground">
            Stop juggling six tabs. SafeWander pulls live travel data and AI guidance into a single, actionable brief.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className={`grid h-12 w-12 place-items-center rounded-xl ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">How it works</span>
            <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">From destination to safe arrival in 3 steps.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", t: "Tell us where", d: "Type any city or country. We pinpoint it on the map and pull live weather instantly." },
              { n: "02", t: "Pick your profile", d: "Student, solo female, backpacker, business — your brief adapts to who you are." },
              { n: "03", t: "Get your brief", d: "Safety score, risks, packing list, emergency contacts, nearby help, and an AI chat ready for follow-ups." },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl bg-card p-7 shadow-soft">
                <span className="font-display text-5xl font-bold bg-gradient-coral bg-clip-text text-transparent">{s.n}</span>
                <h3 className="mt-3 font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-coral p-10 text-center shadow-glow md:p-16">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/40 blur-3xl" aria-hidden />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-secondary/40 blur-3xl" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">
              Ready for a safer trip?
            </h2>
            <p className="mt-4 text-primary-foreground/90">Free to get started. No credit card required.</p>
            <Link to="/auth?mode=signup" className="mt-7 inline-block">
              <Button size="lg" variant="secondary" className="bg-card text-foreground hover:bg-card/90 gap-2">
                Generate my first brief <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} SafeWander · Travel smart, travel safe.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
