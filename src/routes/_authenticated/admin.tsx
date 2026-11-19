import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Plus, Search, ShieldAlert } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCatalog, usePermissions } from "@/lib/admin-catalog";
import bulchaLogo from "@/assets/bulcha-logo.png";
import { ThemeToggle } from "@/components/admin/theme-toggle";
import { BreadcrumbNav } from "@/components/admin/breadcrumb-nav";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Admin Console — Bulcha International Hotel" },
    { name: "description", content: "Manage Bulcha International Hotel's digital menu: meals, drinks, prices and availability." },
    { property: "og:title", content: "Admin Console — Bulcha International Hotel" },
    { property: "og:description", content: "Bulcha menu administration console." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { loading, signOut } = useAuth();
  const { isAdmin, user } = usePermissions();
  if (loading) return (
    <div className="admin-console flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <div className="text-center">
        <img src={bulchaLogo} alt="Bulcha" className="mx-auto h-16 w-16 animate-pulse" />
        <p className="mt-4 text-sm text-muted-foreground">Loading admin console...</p>
      </div>
    </div>
  );
  if (!isAdmin) return (
    <div className="admin-console grid min-h-screen place-items-center bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {user?.email} is signed in but does not have administrator privileges. 
          Please contact your Super Admin to request access.
        </p>
        <Button className="mt-6 w-full" onClick={() => signOut()}>Sign Out</Button>
      </div>
    </div>
  );
  return (
    <div className="admin-console">
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-muted/10">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <TopBar />
            <main className="flex-1 overflow-auto">
              <div className="mx-auto max-w-[1920px] p-4 sm:p-6 lg:p-8">
                <div className="mb-6">
                  <BreadcrumbNav />
                </div>
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}


function TopBar() {
  const { user, roleLabel, isSuper } = usePermissions();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { data } = useCatalog();
  const [q, setQ] = useState("");
  const soldOut = data?.items.filter((i) => !i.deleted_at && i.status === "sold_out") ?? [];
  const noPhoto = data?.items.filter((i) => !i.deleted_at && !i.image_url) ?? [];
  const alerts = soldOut.length + (noPhoto.length ? 1 : 0);
  
  return (
    <header className="sticky top-0 z-20 border-b bg-card/95 shadow-sm backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <SidebarTrigger className="hover:bg-accent" />
        
        {/* Search Bar */}
        <form 
          className="relative hidden max-w-md flex-1 sm:block" 
          onSubmit={(e) => { e.preventDefault(); navigate({ to: "/admin/meals", search: { q } }); }}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            aria-label="Search the menu" 
            placeholder="Search meals, drinks, categories..." 
            className="h-10 rounded-full border-muted-foreground/20 bg-background/50 pl-10 pr-4 transition-all focus:bg-background focus:ring-2 focus:ring-primary/20" 
            value={q} 
            onChange={(e) => setQ(e.target.value)} 
          />
        </form>
        
        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Quick Create Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-9 gap-2 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md">
                <Plus className="h-4 w-4" /> 
                <span className="hidden sm:inline">Create</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs font-semibold uppercase text-muted-foreground">Quick Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin/meals" search={{ new: true }} className="gap-2">
                  <span>🍽️</span> New Meal
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/drinks" search={{ new: true }} className="gap-2">
                  <span>🍷</span> New Drink
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/categories" className="gap-2">
                  <span>📁</span> New Category
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/media" className="gap-2">
                  <span>📸</span> Upload Images
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-9 w-9 rounded-full hover:bg-accent" 
                aria-label={`Notifications, ${alerts}`}
              >
                <Bell className="h-5 w-5" />
                {alerts > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-card">
                    {alerts}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                {alerts > 0 && <Badge variant="destructive" className="text-xs">{alerts} New</Badge>}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {alerts === 0 && (
                <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                  <div className="mb-2">✨</div>
                  All clear! No issues to address.
                </div>
              )}
              {soldOut.slice(0, 5).map((i) => (
                <DropdownMenuItem key={i.id} asChild>
                  <Link to="/admin/availability" className="flex items-start gap-3 py-3">
                    <span className="text-lg">🔴</span>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{i.name_en}</p>
                      <p className="text-xs text-muted-foreground">Currently sold out</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
              {noPhoto.length > 0 && (
                <DropdownMenuItem asChild>
                  <Link to="/admin/media" className="flex items-start gap-3 py-3">
                    <span className="text-lg">📷</span>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{noPhoto.length} items need photos</p>
                      <p className="text-xs text-muted-foreground">Upload images to complete listings</p>
                    </div>
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 rounded-full px-2 hover:bg-accent">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#8B1538] to-[#A61D3F] text-xs font-bold uppercase text-white shadow-sm ring-2 ring-background">
                  {user?.email?.[0] ?? "A"}
                </div>
                <Badge 
                  variant={isSuper ? "default" : "secondary"} 
                  className="hidden sm:inline-flex"
                >
                  {roleLabel}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#8B1538] to-[#A61D3F] text-sm font-bold uppercase text-white">
                    {user?.email?.[0] ?? "A"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">{roleLabel}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/admin/profile" className="gap-2">
                  <span>👤</span> Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/settings" className="gap-2">
                  <span>⚙️</span> System Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="gap-2 text-destructive focus:text-destructive">
                <span>🚪</span> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
