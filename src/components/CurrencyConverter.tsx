import { useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Coins, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const COMMON = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD", "CHF", "CNY", "AED", "SGD"];

type Props = { destinationCurrency?: string; symbol?: string };

export const CurrencyConverter = ({ destinationCurrency = "EUR", symbol = "€" }: Props) => {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState(destinationCurrency);
  const [amount, setAmount] = useState("100");
  const [rate, setRate] = useState<number | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { setTo(destinationCurrency); }, [destinationCurrency]);

  const fetchRate = async () => {
    setLoading(true); setErr(null);
    try {
      // Frankfurter — free, no key, ECB rates
      const r = await fetch(`https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`);
      if (!r.ok) throw new Error("rate fetch failed");
      const d = await r.json();
      const v = d.rates?.[to];
      if (!v) throw new Error("no rate");
      setRate(v);
      setUpdated(d.date || new Date().toISOString().slice(0, 10));
    } catch {
      setErr("Couldn't fetch rate. Try again.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRate(); /* eslint-disable-next-line */ }, [from, to]);

  const converted = useMemo(() => {
    const n = parseFloat(amount);
    if (!rate || isNaN(n)) return "—";
    const out = n * rate;
    return out.toLocaleString(undefined, { maximumFractionDigits: out > 100 ? 0 : 2 });
  }, [amount, rate]);

  const swap = () => { setFrom(to); setTo(from); };

  const all = Array.from(new Set([...COMMON, destinationCurrency])).sort();

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-xl border bg-background p-3">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">From</label>
          <div className="mt-1 flex items-center gap-2">
            <select value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-md border bg-card px-2 py-1 text-sm font-semibold">
              {all.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-9" />
          </div>
        </div>
        <div className="flex items-center justify-center">
          <Button size="icon" variant="outline" onClick={swap} aria-label="Swap currencies" className="rounded-full">
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="rounded-xl border bg-gradient-teal/10 p-3">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">To</label>
          <div className="mt-1 flex items-center gap-2">
            <select value={to} onChange={(e) => setTo(e.target.value)} className="rounded-md border bg-card px-2 py-1 text-sm font-semibold">
              {all.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <p className="font-display text-xl font-bold">{symbol && to === destinationCurrency ? symbol : ""}{converted}</p>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{rate ? `1 ${from} = ${rate.toFixed(4)} ${to}` : "—"}{updated ? ` · ${updated}` : ""}</span>
        <button onClick={fetchRate} disabled={loading} className="inline-flex items-center gap-1 hover:text-foreground">
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>
      {err && <p className="mt-2 text-xs text-danger">{err}</p>}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {[10, 50, 100, 500, 1000].map((q) => (
          <button key={q} onClick={() => setAmount(String(q))}
            className="rounded-full border bg-background px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:bg-primary-soft hover:text-primary">
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};
