import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
  displayName: z.string().trim().min(1, "Required").max(60).optional(),
});

const Auth = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const isSignup = params.get("mode") === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/dashboard", { replace: true });
    });
  }, [navigate]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({
      email,
      password,
      displayName: isSignup ? displayName : undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        toast.success("Welcome aboard! You're signed in.");
        navigate("/dashboard", { replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/dashboard", { replace: true });
      }
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";
      if (msg.toLowerCase().includes("already")) {
        toast.error("That email is already registered. Try signing in instead.");
      } else if (msg.toLowerCase().includes("invalid")) {
        toast.error("Invalid email or password.");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container flex min-h-screen items-center justify-center py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center"><Logo /></div>
            <h1 className="font-display text-4xl font-bold">
              {isSignup ? "Pack your bags ✈️" : "Welcome back, wanderer"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isSignup ? "Create your free SafeWander account — takes 10 seconds." : "Your trips are waiting."}
            </p>
          </div>

          <form onSubmit={handle} className="space-y-4 rounded-2xl border bg-card p-7 shadow-card">
            {isSignup && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Alex" />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete={isSignup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-coral border-0 shadow-soft hover:shadow-glow">
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait...</> : isSignup ? "Create account" : "Sign in"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {isSignup ? "Already have an account? " : "New to SafeWander? "}
              <button
                type="button"
                onClick={() => setParams(isSignup ? {} : { mode: "signup" })}
                className="font-semibold text-primary hover:underline"
              >
                {isSignup ? "Sign in" : "Create one"}
              </button>
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
