import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Crown, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    {"title": "Staff Login — Bulcha International Hotel"},
    {"name": "description", "content": "Sign in to the Bulcha staff and administration workspace."},
    {"property": "og:title", "content": "Staff Login — Bulcha International Hotel"},
    {"property": "og:description", "content": "Sign in to the Bulcha staff and administration workspace."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created! Signing you in...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const googleSignIn = async () => {
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/dashboard` });
    } catch (e: any) {
      toast.error(e?.message ?? "Google sign-in failed");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-glow)" }} />
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to site
        </Link>
        <div className="rounded-3xl glass p-8 shadow-elegant">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-gold shadow-gold">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-base font-bold">Bulcha International Hotel</p>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Staff Portal</p>
            </div>
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Sign in to access your dashboard." : "New here? Admin will assign your role after signup."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <input
                value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" maxLength={100}
                className="w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            )}
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required maxLength={255}
              className="w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6} maxLength={72}
              className="w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit" disabled={busy}
              className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-smooth hover:shadow-gold disabled:opacity-60"
            >
              {busy ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={googleSignIn}
            className="w-full rounded-full border bg-card py-3 text-sm font-medium shadow-soft transition-smooth hover:shadow-elegant"
          >
            Continue with Google
          </button>

          <div className="mt-6 flex flex-col items-center gap-2 text-xs text-muted-foreground">
            <p>
              {mode === "signin" ? "Don't have an account? " : "Have an account? "}
              <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-semibold text-primary hover:underline">
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
            {mode === "signin" && (
              <Link to="/forgot-password" className="font-medium text-primary hover:underline">
                Forgot your password?
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
