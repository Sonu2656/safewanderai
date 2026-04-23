import { useEffect, useMemo, useState } from "react";
import { Plug, Droplet, Car, Coins, Sunrise, Sunset, Globe2, FileCheck2 } from "lucide-react";
import { getEssentials, type CountryEssentials } from "@/lib/country-essentials";

type Props = { country?: string | null; lat?: number | null; lon?: number | null };

const waterTone = (s: CountryEssentials["tapWater"]) =>
  s === "safe" ? "bg-success/10 text-success" : s === "risky" ? "bg-warning/15 text-warning" : "bg-danger/10 text-danger";

const waterLabel = (s: CountryEssentials["tapWater"]) =>
  s === "safe" ? "Tap water OK" : s === "risky" ? "Tap water risky" : "Bottled only";

export const TravelEssentials = ({ country, lat, lon }: Props) => {
  const ess = getEssentials(country);
  const [now, setNow] = useState<{ time: string; date: string } | null>(null);
  const [sun, setSun] = useState<{ rise: string; set: string } | null>(null);
  const [tz, setTz] = useState<string | null>(null);

  // Local time using Intl + lat/lon (browser locale TZ as fallback)
  useEffect(() => {
    let timer: number | undefined;
    const update = () => {
      try {
        const d = new Date();
        const opts: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", timeZone: tz || undefined };
        setNow({
          time: d.toLocaleTimeString([], opts),
          date: d.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", timeZone: tz || undefined }),
        });
      } catch { /* ignore */ }
    };
    update();
    timer = window.setInterval(update, 30000);
    return () => { if (timer) clearInterval(timer); };
  }, [tz]);

  // Sunrise/sunset + timezone via Open-Meteo (free)
  useEffect(() => {
    if (!lat || !lon) return;
    (async () => {
      try {
        const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&timezone=auto`);
        if (!r.ok) return;
        const d = await r.json();
        setTz(d.timezone || null);
        const rise = d.daily?.sunrise?.[0];
        const set = d.daily?.sunset?.[0];
        if (rise && set) {
          const fmt = (s: string) => new Date(s).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: d.timezone });
          setSun({ rise: fmt(rise), set: fmt(set) });
        }
      } catch { /* ignore */ }
    })();
  }, [lat, lon]);

  const tiles = useMemo(() => {
    if (!ess) return [];
    return [
      { Icon: Plug, label: "Plug & power", value: ess.plug, sub: ess.voltage, tone: "bg-accent-soft text-accent-foreground" },
      { Icon: Droplet, label: waterLabel(ess.tapWater), value: ess.tapWater === "safe" ? "Drink freely" : ess.tapWater === "risky" ? "Filter / boil" : "Buy bottled", tone: waterTone(ess.tapWater) },
      { Icon: Car, label: "Drives on", value: ess.driveSide === "left" ? "Left ⬅️" : "Right ➡️", sub: "Mind the curb!", tone: "bg-secondary-soft text-secondary" },
      { Icon: Coins, label: "Tipping", value: ess.tipping, tone: "bg-primary-soft text-primary" },
      { Icon: FileCheck2, label: "Visa hint", value: ess.visaHint, sub: "Always verify with embassy", tone: "bg-secondary-soft text-secondary" },
      { Icon: Globe2, label: "Currency", value: `${ess.currency} (${ess.currencySymbol})`, sub: ess.languageLabel, tone: "bg-accent-soft text-accent-foreground" },
    ];
  }, [ess]);

  if (!ess) {
    return <p className="text-sm text-muted-foreground">No essentials data for this country yet.</p>;
  }

  return (
    <div>
      {/* Local clock + sun */}
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-gradient-hero p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Local time {tz ? `· ${tz.split("/").pop()?.replace("_", " ")}` : ""}</p>
          <p className="mt-1 font-display text-3xl font-bold">{now?.time ?? "—"}</p>
          <p className="text-xs text-muted-foreground">{now?.date}</p>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sunrise</p>
          <p className="mt-1 inline-flex items-center gap-2 font-display text-2xl font-bold">
            <Sunrise className="h-5 w-5 text-warning" /> {sun?.rise ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border bg-background p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Sunset</p>
          <p className="mt-1 inline-flex items-center gap-2 font-display text-2xl font-bold">
            <Sunset className="h-5 w-5 text-primary" /> {sun?.set ?? "—"}
          </p>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t, i) => (
          <li key={i} className="rounded-xl border bg-background p-4">
            <div className="flex items-start gap-3">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${t.tone}`}><t.Icon className="h-4 w-4" /></span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{t.label}</p>
                <p className="mt-0.5 text-sm font-semibold">{t.value}</p>
                {t.sub && <p className="text-xs text-muted-foreground">{t.sub}</p>}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
