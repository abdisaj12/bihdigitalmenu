import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, LoaderCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import bulchaLogo from "@/assets/bulcha-logo.png";

export const Route = createFileRoute("/admin_/login")({
  head: () => ({ meta: [
    { title: "Administration Sign In — Bulcha International Hotel" },
    { name: "description", content: "Secure sign-in to the Bulcha International Hotel administration console." },
    { property: "og:title", content: "Administration Sign In — Bulcha International Hotel" },
    { property: "og:description", content: "Access Bulcha International Hotel administration." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminLogin,
});

function AdminLogin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => { 
    if (user) navigate({ to: "/admin" }); 
  }, [user, navigate]);
  
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ 
        email: String(data.get("email") ?? "").trim(), 
        password: String(data.get("password") ?? "") 
      });
      if (signInError) setError(signInError.message);
      else await navigate({ to: "/admin" });
    } catch { 
      setError("Unable to sign in. Please try again."); 
    } finally { 
      setBusy(false); 
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8B1538] via-[#A61D3F] to-[#8B1538] flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAgNC40MTgtMy41ODIgOC04IDhzLTgtMy41ODItOC04IDMuNTgyLTggOC04IDggMy41ODIgOCA4eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
      
      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center rounded-2xl bg-white p-6 shadow-2xl mb-4">
            <img src={bulchaLogo} alt="Bulcha International Hotel" className="h-20 w-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-white">Bulcha International Hotel</h1>
          <p className="mt-2 text-sm text-white/80">Hotel Management Console</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2 text-[#8B1538]">
              <div className="rounded-lg bg-[#8B1538]/10 p-2">
                <Shield className="h-5 w-5" />
              </div>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
            </div>
            <CardDescription>
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email Address</Label>
                <Input 
                  id="admin-email" 
                  name="email" 
                  type="email" 
                  autoComplete="username" 
                  placeholder="admin@bulcha-hotel.com" 
                  required 
                  className="h-11 rounded-lg border-muted-foreground/20 bg-background focus:border-[#8B1538] focus:ring-[#8B1538]/20" 
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-password">Password</Label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs text-[#8B1538] hover:text-[#A61D3F] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="admin-password" 
                  name="password" 
                  type="password" 
                  autoComplete="current-password" 
                  required 
                  className="h-11 rounded-lg border-muted-foreground/20 bg-background focus:border-[#8B1538] focus:ring-[#8B1538]/20" 
                />
              </div>
              
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p role="alert" className="text-sm text-destructive flex items-center gap-2">
                    <span className="text-lg">⚠️</span>
                    {error}
                  </p>
                </div>
              )}
              
              <Button 
                type="submit" 
                disabled={busy} 
                className="h-11 w-full rounded-lg bg-gradient-to-r from-[#8B1538] to-[#A61D3F] hover:from-[#A61D3F] hover:to-[#8B1538] text-white font-semibold shadow-md transition-all"
              >
                {busy ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t text-center">
              <Button asChild variant="link" className="text-muted-foreground hover:text-[#8B1538]">
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" /> Back to Hotel Website
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Footer */}
        <p className="mt-6 text-center text-xs text-white/60">
          Secure access protected by Bulcha International Hotel
        </p>
      </div>
    </div>
  );
}