import { useState } from "react";
import { Volume2, Copy, Check } from "lucide-react";
import { getPhrases, type Phrase } from "@/lib/country-essentials";
import { toast } from "sonner";

type Props = { language?: string; languageLabel?: string };

export const Phrasebook = ({ language = "en", languageLabel = "English" }: Props) => {
  const phrases = getPhrases(language);
  const [copied, setCopied] = useState<number | null>(null);

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) { toast.error("Speech not supported"); return; }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language;
    u.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  };

  const copy = async (text: string, i: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i); setTimeout(() => setCopied(null), 1200);
    } catch { toast.error("Copy failed"); }
  };

  return (
    <div>
      <p className="mb-3 text-xs text-muted-foreground">
        Tap <Volume2 className="inline h-3 w-3" /> to hear the pronunciation in <span className="font-semibold text-foreground">{languageLabel}</span>.
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {phrases.map((p: Phrase, i) => (
          <li key={i} className="group flex items-start justify-between gap-3 rounded-xl border bg-background p-3 transition-colors hover:border-primary/40">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{p.en}</p>
              <p className="mt-0.5 truncate font-display text-base font-semibold">{p.local}</p>
              {p.pron && <p className="text-xs italic text-muted-foreground">/{p.pron}/</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button onClick={() => speak(p.local)} aria-label="Speak"
                className="grid h-8 w-8 place-items-center rounded-lg bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground">
                <Volume2 className="h-4 w-4" />
              </button>
              <button onClick={() => copy(p.local, i)} aria-label="Copy"
                className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-muted-foreground hover:bg-secondary hover:text-secondary-foreground">
                {copied === i ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
