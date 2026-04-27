import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Logo } from "@/components/Logo";
import { GlobeTicker } from "@/components/GlobeTicker";
import { Globe3D } from "@/components/Globe3D";
import { burstFromEvent } from "@/lib/fun";
import {
  ShieldCheck, MapPin, Phone, CloudSun, MessageCircle, Sparkles, Globe2, Users, ArrowRight,
  PartyPopper, Heart, Coffee, Zap, Coins, Languages, Compass,
} from "lucide-react";

const features = [
  { icon: ShieldCheck, color: "bg-primary-soft text-primary", emoji: "🛡️", title: "AI Safety Score", desc: "Your destination, rated 0–100 with the why behind it. No mystery, no panic." },
  { icon: Phone, color: "bg-secondary-soft text-secondary", emoji: "📞", title: "Emergency, decoded", desc: "Police, ambulance, fire — for 60+ countries. Tap to dial. Works when you need it most." },
  { icon: MapPin, color: "bg-accent-soft text-accent-foreground", emoji: "📍", title: "Help, nearby", desc: "Hospitals, pharmacies, embassies plotted around you — even in places you can't pronounce." },
  { icon: Coins, color: "bg-primary-soft text-primary", emoji: "💱", title: "Live currency + tipping", desc: "Real ECB rates, tipping etiquette, and budget cues — never get fleeced again." },
  { icon: Languages, color: "bg-secondary-soft text-secondary", emoji: "🗣️", title: "Talk-to-them phrasebook", desc: "12 essentials in 20+ languages. Tap to hear them spoken out loud, instantly." },
  { icon: Compass, color: "bg-accent-soft text-accent-foreground", emoji: "🔌", title: "Plug, water, drive side", desc: "Local time, sunset, voltage, tap-water safety — the boring questions, answered." },
  { icon: CloudSun, color: "bg-primary-soft text-primary", emoji: "🌤️", title: "Weather + packing", desc: "Live conditions feed a packing list that adapts to your trip — no more 'I forgot socks again'." },
  { icon: MessageCircle, color: "bg-secondary-soft text-secondary", emoji: "💬", title: "Ask anything", desc: "Scams? Transport? Solo-travel tips? Your AI companion answers — with your trip in mind." },
  { icon: Zap, color: "bg-accent-soft text-accent-foreground", emoji: "⚡", title: "Safety Pulse (live)", desc: "Shake to alert, low-battery nudges, time-aware scoring. It's like a sixth sense for travel." },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-70" aria-hidden />
        {/* Floating emoji */}
        <span className="pointer-events-none absolute left-[6%] top-24 hidden text-3xl animate-float md:block" style={{ animationDelay: "0.4s" }} aria-hidden>✈️</span>
        <span className="pointer-events-none absolute right-[10%] top-40 hidden text-2xl animate-float md:block" style={{ animationDelay: "1.2s" }} aria-hidden>🗺️</span>
        <span className="pointer-events-none absolute left-[14%] bottom-20 hidden text-2xl animate-float md:block" style={{ animationDelay: "2s" }} aria-hidden>🎒</span>

        <div className="container relative grid gap-12 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-card/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Your travel sidekick
            </span>
            <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight text-balance md:text-6xl lg:text-7xl">
              Wander wild.<br />
              <span className="bg-gradient-coral bg-clip-text text-transparent">Worry less.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground text-balance">
              SafeWander is the cheeky AI buddy that knows your destination better than your group chat —
              live safety scores, nearby help, packing tips, and a panic button that actually works.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/auth?mode=signup" onClick={(e) => burstFromEvent(e as any)}>
                <Button size="lg" className="gap-2 bg-gradient-coral border-0 shadow-glow hover:scale-[1.03] transition-transform">
                  <PartyPopper className="h-4 w-4" /> Let's go!
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="border-2 hover:bg-primary-soft">I'm already in</Button>
              </Link>
            </div>
            <div className="mt-6">
              <GlobeTicker />
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Globe2 className="h-4 w-4 text-secondary" /> 60+ countries</span>
              <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-primary" /> Solo-traveller approved</span>
              <span className="inline-flex items-center gap-1.5"><Heart className="h-4 w-4 text-danger" /> Made with love</span>
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
            <div className="absolute -bottom-2 left-4 hidden rounded-2xl bg-card/95 p-4 shadow-card backdrop-blur md:block animate-fade-up" style={{ animationDelay: "300ms" }}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-success/15 text-success">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Tokyo · Vibe check</p>
                  <p className="font-display text-2xl font-bold text-success">92 ✨</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-2 right-4 hidden rounded-2xl bg-card/95 p-4 shadow-card backdrop-blur md:block animate-fade-up" style={{ animationDelay: "450ms" }}>
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent-soft text-accent-foreground">
                  <CloudSun className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">Right now</p>
                  <p className="font-display text-lg font-bold">22° & sunny ☀️</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Your travel toolkit</span>
          <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">9 apps in one. Zero faff.</h2>
          <p className="mt-4 text-muted-foreground">
            Currency converter, phrasebook, plug guide, safety score, SOS, packing list, weather, AI chat, nearby help — one tap, one brief.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-2 hover:rotate-[-0.5deg] hover:shadow-card animate-fade-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="absolute right-4 top-4 text-2xl opacity-70 transition-transform group-hover:scale-125 group-hover:rotate-12" aria-hidden>{f.emoji}</span>
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
            <h2 className="mt-2 font-display text-4xl font-bold md:text-5xl">From "where to?" to "I got this" in 3 taps.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { n: "01", emoji: "📍", t: "Drop a pin", d: "Type any city. We find it, geo-locate it, and grab live weather instantly." },
              { n: "02", emoji: "🧳", t: "Pick your vibe", d: "Student, solo, backpacker, business — your brief shape-shifts to match you." },
              { n: "03", emoji: "🎉", t: "Get the brief", d: "Score, risks, packing list, emergency contacts, nearby help, AI chat. All in one go." },
            ].map((s, i) => (
              <div key={s.n} className="group relative rounded-2xl bg-card p-7 shadow-soft transition-all hover:-translate-y-1 hover:shadow-card animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                <span className="absolute right-5 top-5 text-3xl transition-transform group-hover:scale-125" aria-hidden>{s.emoji}</span>
                <span className="font-display text-5xl font-bold bg-gradient-coral bg-clip-text text-transparent">{s.n}</span>
                <h3 className="mt-3 font-display text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof / vibes */}
      <section className="container py-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { q: "Felt like a local on day one.", a: "— Maya, solo trip to Lisbon 🇵🇹" },
            { q: "The shake-to-SOS is genius.", a: "— Dev, backpacking SE Asia 🎒" },
            { q: "Saved my night in Marrakech.", a: "— Priya, first solo trip 🌙" },
          ].map((t, i) => (
            <blockquote key={i} className="rounded-2xl border bg-card p-6 shadow-soft animate-fade-up" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="font-display text-lg font-semibold leading-snug">"{t.q}"</p>
              <footer className="mt-3 text-xs text-muted-foreground">{t.a}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-coral p-10 text-center shadow-glow md:p-16">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-accent/40 blur-3xl" aria-hidden />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-secondary/40 blur-3xl" aria-hidden />
          <span className="absolute left-8 top-8 text-3xl animate-float" style={{ animationDelay: "0.3s" }} aria-hidden>🌍</span>
          <span className="absolute right-8 bottom-8 text-3xl animate-float" style={{ animationDelay: "1.1s" }} aria-hidden>🚀</span>
          <div className="relative">
            <h2 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">
              Your next adventure called.
            </h2>
            <p className="mt-4 text-primary-foreground/90">It said: bring SafeWander. (Free, no card, no nonsense.)</p>
            <Link to="/auth?mode=signup" className="mt-7 inline-block" onClick={(e) => burstFromEvent(e as any)}>
              <Button size="lg" variant="secondary" className="bg-card text-foreground hover:bg-card/90 gap-2 hover:scale-105 transition-transform">
                <PartyPopper className="h-4 w-4" /> Start my first trip
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <Logo />
          <p className="inline-flex items-center gap-1.5">© {new Date().getFullYear()} SafeWander · Made with <Heart className="h-3.5 w-3.5 fill-danger text-danger" /> & <Coffee className="h-3.5 w-3.5" /></p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
