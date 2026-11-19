import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRound, Save, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/admin/profile")({
  head: () => ({ meta: [
    {"title": "Profile — Bulcha International Hotel"},
    {"name": "description", "content": "Bulcha staff workspace for profile."},
    {"property": "og:title", "content": "Profile — Bulcha International Hotel"},
    {"property": "og:description", "content": "Bulcha staff workspace for profile."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: ProfilePage,
});

function ProfilePage() {
  const { user, roles } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles").select("display_name, phone").eq("id", user.id).maybeSingle();
      if (error) toast.error(error.message);
      setDisplayName(data?.display_name ?? "");
      setPhone(data?.phone ?? "");
      setLoading(false);
    })();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName || null, phone: phone || null })
        .eq("id", user.id);
      if (error) throw error;
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPwBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated");
      setNewPassword("");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to change password");
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <UserRound className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Personal information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : (
              <>
                <Field label="Email">
                  <Input value={user?.email ?? ""} disabled />
                </Field>
                <Field label="Display name">
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} />
                </Field>
                <Field label="Phone">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} />
                </Field>
                <Field label="Roles">
                  <div className="flex flex-wrap gap-2">
                    {roles.length === 0 ? (
                      <span className="text-sm text-muted-foreground">No roles assigned</span>
                    ) : roles.map((r) => (
                      <span key={r} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                        {r}
                      </span>
                    ))}
                  </div>
                </Field>
                <Button onClick={saveProfile} disabled={saving}>
                  <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save profile"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="New password">
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                minLength={8} maxLength={72} placeholder="At least 8 characters" />
            </Field>
            <Button onClick={changePassword} disabled={pwBusy || newPassword.length < 8}>
              <KeyRound className="h-4 w-4" /> {pwBusy ? "Updating..." : "Update password"}
            </Button>
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
