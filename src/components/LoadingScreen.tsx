import { useEffect, useState } from "react";
import { Compass } from "lucide-react";
import { FUN_LOADING_LINES } from "@/lib/fun";

export const LoadingScreen = ({ label }: { label?: string }) => {
  const [line, setLine] = useState(label || FUN_LOADING_LINES[0]);
  useEffect(() => {
    if (label) return;
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % FUN_LOADING_LINES.length;
      setLine(FUN_LOADING_LINES[i]);
    }, 1500);
    return () => clearInterval(t);
  }, [label]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5 text-muted-foreground">
      <div className="relative">
        <span className="absolute inset-0 -m-3 rounded-3xl bg-gradient-coral opacity-30 blur-xl animate-pulse" aria-hidden />
        <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-coral shadow-glow animate-float">
          <Compass className="h-7 w-7 text-primary-foreground animate-spin" style={{ animationDuration: "3s" }} />
        </span>
      </div>
      <p className="text-sm font-medium animate-fade-up" key={line}>{line}</p>
    </div>
  );
};
