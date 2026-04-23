import { useEffect, useMemo, useState } from "react";
import { Trophy, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { popConfetti, burstFromEvent } from "@/lib/fun";
import { toast } from "sonner";

const ALL_CHALLENGES = [
  "Eat a street-food snack you can't pronounce 🌮",
  "Learn one local greeting & use it 👋",
  "Take a photo of a stranger's adorable pet 🐶",
  "Find the oldest building in walking distance 🏛️",
  "Buy something from a market without using English 🛍️",
  "Ride a form of transport you've never tried 🚋",
  "Watch the sunrise OR sunset from somewhere new 🌅",
  "Talk to a local for at least 5 minutes ☕",
  "Try a drink that's local to this country 🍹",
  "Get pleasantly lost for 30 minutes 🗺️",
  "Listen to a local musician (street or venue) 🎶",
  "Find a doorway you'd hang on your wall 🚪",
  "Try a snack from a place with no English menu 🍢",
  "Learn the word for 'thank you' & use it 10x 🙏",
  "Visit a park and just sit for 20 minutes 🌳",
  "Take a photo at the same spot at sunrise & sunset 📸",
  "Write a postcard to your future self 📮",
  "Find a viewpoint with no other tourists 👀",
  "Trade a smile with 5 strangers today 😊",
  "Try a fruit you've never seen before 🥭",
];

type Card = { text: string; done: boolean };

const STORAGE_KEY = (id: string) => `bingo:${id}`;

const pickCards = (): Card[] => {
  const shuffled = [...ALL_CHALLENGES].sort(() => Math.random() - 0.5).slice(0, 9);
  return shuffled.map((text) => ({ text, done: false }));
};

export const WanderBingo = ({ tripId }: { tripId: string }) => {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY(tripId));
    if (saved) {
      try { setCards(JSON.parse(saved)); return; } catch { /* ignore */ }
    }
    setCards(pickCards());
  }, [tripId]);

  useEffect(() => {
    if (cards.length) localStorage.setItem(STORAGE_KEY(tripId), JSON.stringify(cards));
  }, [cards, tripId]);

  const completed = cards.filter((c) => c.done).length;
  const total = cards.length || 9;
  const pct = Math.round((completed / total) * 100);

  const winLines = useMemo(
    () => [
      "Look at you, traveller. 🥹",
      "Local-mode unlocked. ✨",
      "You're not a tourist anymore.",
      "That's a story-worthy day.",
    ],
    []
  );

  const toggle = (i: number, e: React.MouseEvent) => {
    setCards((cs) => {
      const next = cs.map((c, idx) => (idx === i ? { ...c, done: !c.done } : c));
      const nowDone = !cs[i].done;
      if (nowDone) {
        burstFromEvent({ clientX: e.clientX, clientY: e.clientY });
        const newCount = next.filter((c) => c.done).length;
        if (newCount === total) {
          setTimeout(() => {
            popConfetti({ y: 0.4 });
            toast.success("BINGO! Full board cleared 🏆", { description: winLines[Math.floor(Math.random() * winLines.length)] });
          }, 200);
        } else if (newCount % 3 === 0) {
          toast.success(`${newCount} down — keep going!`);
        }
      }
      return next;
    });
  };

  const reset = () => {
    setCards(pickCards());
    toast("Fresh board! New challenges loaded 🎲");
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Trophy className="h-3.5 w-3.5" /> Wander Bingo
          </div>
          <h3 className="mt-1 font-display text-xl font-bold">Turn your trip into a game</h3>
          <p className="text-sm text-muted-foreground">Tap a square when you complete it. Get all 9 for a win.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="shrink-0">
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> New board
        </Button>
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-center gap-3">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-coral transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs font-semibold tabular-nums text-muted-foreground">
          {completed}/{total}
        </span>
      </div>

      {/* Grid */}
      <div className="mt-5 grid grid-cols-3 gap-2">
        {cards.map((c, i) => (
          <button
            key={i}
            onClick={(e) => toggle(i, e)}
            className={`group relative aspect-square overflow-hidden rounded-xl border-2 p-2.5 text-left text-[11px] leading-tight transition-all ${
              c.done
                ? "border-primary bg-gradient-coral text-primary-foreground shadow-glow"
                : "border-border bg-background hover:border-primary/40 hover:bg-primary-soft"
            }`}
          >
            <span className={`block ${c.done ? "line-clamp-4" : "line-clamp-5"}`}>{c.text}</span>
            {c.done && (
              <Sparkles className="absolute right-1.5 top-1.5 h-3.5 w-3.5 animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {pct === 100 && (
        <p className="mt-4 rounded-xl bg-gradient-sun/20 p-3 text-center text-sm font-semibold text-foreground">
          🏆 Bingo cleared! Screenshot this and brag a little.
        </p>
      )}
    </div>
  );
};
