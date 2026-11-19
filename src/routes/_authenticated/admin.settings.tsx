import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({ meta: [
    {"title": "Settings — Bulcha International Hotel"},
    {"name": "description", "content": "Bulcha staff workspace for settings."},
    {"property": "og:title", "content": "Settings — Bulcha International Hotel"},
    {"property": "og:description", "content": "Bulcha staff workspace for settings."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: SettingsPage,
});

type Settings = {
  id: string;
  restaurant_name: string;
  logo: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  currency: string;
  language: string;
  theme: string;
  opening_hours: Record<string, string> | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  website: string | null;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function SettingsPage() {
  const [row, setRow] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("restaurant_settings").select("*").limit(1).maybeSingle();
    if (error) toast.error(error.message);
    setRow((data as Settings) ?? null);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const update = <K extends keyof Settings>(k: K, v: Settings[K]) =>
    setRow((r) => (r ? { ...r, [k]: v } : r));

  const save = async () => {
    if (!row) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("restaurant_settings")
        .update({
          restaurant_name: row.restaurant_name,
          logo: row.logo,
          phone: row.phone,
          email: row.email,
          address: row.address,
          currency: row.currency,
          language: row.language,
          theme: row.theme,
          opening_hours: row.opening_hours ?? {},
          facebook: row.facebook,
          instagram: row.instagram,
          tiktok: row.tiktok,
          website: row.website,
        })
        .eq("id", row.id);
      if (error) throw error;
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-muted-foreground">Loading...</div>;
  if (!row) return <div className="p-6 text-sm text-muted-foreground">No settings row.</div>;

  const hours = row.opening_hours ?? {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Restaurant Settings</h1>
          <p className="text-sm text-muted-foreground">Public information shown on the menu</p>
        </div>
        <Button onClick={save} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Identity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Restaurant name">
              <Input value={row.restaurant_name} onChange={(e) => update("restaurant_name", e.target.value)} />
            </Field>
            <Field label="Logo URL">
              <Input value={row.logo ?? ""} onChange={(e) => update("logo", e.target.value)} placeholder="https://..." />
            </Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Currency">
                <Input value={row.currency} onChange={(e) => update("currency", e.target.value)} maxLength={5} />
              </Field>
              <Field label="Language">
                <Input value={row.language} onChange={(e) => update("language", e.target.value)} maxLength={5} />
              </Field>
              <Field label="Theme">
                <Input value={row.theme} onChange={(e) => update("theme", e.target.value)} maxLength={12} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Phone">
              <Input value={row.phone ?? ""} onChange={(e) => update("phone", e.target.value)} />
            </Field>
            <Field label="Email">
              <Input type="email" value={row.email ?? ""} onChange={(e) => update("email", e.target.value)} />
            </Field>
            <Field label="Address">
              <Textarea value={row.address ?? ""} onChange={(e) => update("address", e.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Social & Web</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="Website"><Input value={row.website ?? ""} onChange={(e) => update("website", e.target.value)} /></Field>
            <Field label="Facebook"><Input value={row.facebook ?? ""} onChange={(e) => update("facebook", e.target.value)} /></Field>
            <Field label="Instagram"><Input value={row.instagram ?? ""} onChange={(e) => update("instagram", e.target.value)} /></Field>
            <Field label="TikTok"><Input value={row.tiktok ?? ""} onChange={(e) => update("tiktok", e.target.value)} /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Opening Hours</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {DAYS.map((d) => (
              <div key={d} className="grid grid-cols-[60px_1fr] items-center gap-3">
                <span className="text-sm font-medium">{d}</span>
                <Input
                  value={hours[d] ?? ""}
                  onChange={(e) => update("opening_hours", { ...hours, [d]: e.target.value })}
                  placeholder="09:00 – 22:00 (or Closed)"
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
