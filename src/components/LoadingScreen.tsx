import { Compass } from "lucide-react";

export const LoadingScreen = ({ label = "Loading..." }: { label?: string }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-muted-foreground">
    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-coral shadow-soft animate-float">
      <Compass className="h-6 w-6 text-primary-foreground animate-spin" style={{ animationDuration: "3s" }} />
    </span>
    <p className="text-sm">{label}</p>
  </div>
);
