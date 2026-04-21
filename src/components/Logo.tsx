import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => (
  <Link to="/" className={`inline-flex items-center gap-2 group ${className}`}>
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-coral shadow-soft transition-transform group-hover:rotate-6">
      <Compass className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
    </span>
    <span className="font-display text-xl font-bold tracking-tight">SafeWander</span>
  </Link>
);
