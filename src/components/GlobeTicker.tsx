import { useEffect, useState } from "react";
import { Plane } from "lucide-react";

const VIBES = [
  { city: "Tokyo 🇯🇵", note: "Score 92 · Polite chaos, mostly calm." },
  { city: "Lisbon 🇵🇹", note: "Score 88 · Sunny, hilly, friendly trams." },
  { city: "Bangkok 🇹🇭", note: "Score 74 · Watch tuk-tuk scams, eat everything." },
  { city: "Cape Town 🇿🇦", note: "Score 68 · Daytime hikes, nighttime caution." },
  { city: "Marrakech 🇲🇦", note: "Score 71 · Bargain hard, smile harder." },
  { city: "Mexico City 🇲🇽", note: "Score 70 · Stay central, taxi via app." },
  { city: "Reykjavík 🇮🇸", note: "Score 96 · Cold air, warm people." },
  { city: "Bali 🇮🇩", note: "Score 80 · Mind the monkeys 🐒" },
];

export const GlobeTicker = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % VIBES.length), 2800);
    return () => clearInterval(t);
  }, []);
  const v = VIBES[i];
  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-card/85 px-3 py-1.5 text-xs shadow-soft backdrop-blur">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-teal text-primary-foreground">
        <Plane className="h-3 w-3" />
      </span>
      <span className="font-semibold">{v.city}</span>
      <span className="hidden truncate text-muted-foreground sm:inline">· {v.note}</span>
    </div>
  );
};
