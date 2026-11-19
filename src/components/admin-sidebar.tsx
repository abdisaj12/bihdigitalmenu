import { Link, useRouterState } from "@tanstack/react-router";
import { 
  LayoutDashboard, UtensilsCrossed, Wine, FolderTree, Images, ToggleRight, 
  ScrollText, Settings, LogOut, ConciergeBell, QrCode, ExternalLink,
  Users, Receipt, ChartBar, FileText, Star, Calendar, Bell
} from "lucide-react";
import bulchaLogo from "@/assets/bulcha-logo.png";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { usePermissions } from "@/lib/admin-catalog";

const overview = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Orders", url: "/admin/orders", icon: ConciergeBell },
  { title: "Reservations", url: "/admin/reservations", icon: Calendar },
] as const;

const menu = [
  { title: "Meals", url: "/admin/meals", icon: UtensilsCrossed },
  { title: "Drinks", url: "/admin/drinks", icon: Wine },
  { title: "Categories", url: "/admin/categories", icon: FolderTree },
  { title: "Availability", url: "/admin/availability", icon: ToggleRight },
] as const;

const media = [
  { title: "Media Library", url: "/admin/media", icon: Images },
  { title: "Reviews", url: "/admin/reviews", icon: Star },
] as const;

const operations = [
  { title: "QR Codes", url: "/qr-codes", icon: QrCode },
  { title: "Payments", url: "/payments", icon: Receipt },
  { title: "Reports", url: "/admin/reports", icon: ChartBar },
] as const;

const control = [
  { title: "Activity Logs", url: "/admin/audit", icon: ScrollText, superOnly: false },
  { title: "Settings", url: "/admin/settings", icon: Settings, superOnly: false },
] as const;

export function AdminSidebar() {
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut } = useAuth();
  const { isSuper, user } = usePermissions();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const active = (url: string, exact?: boolean) => (exact ? pathname === url : pathname === url || pathname.startsWith(url + "/"));
  
  const group = (label: string, list: readonly { title: string; url: string; icon: any; exact?: boolean }[]) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent><SidebarMenu>
        {list.map((i) => (
          <SidebarMenuItem key={i.url}>
            <SidebarMenuButton asChild isActive={active(i.url, i.exact)} tooltip={i.title} className="gap-3">
              <Link to={i.url} onClick={() => setOpenMobile(false)}>
                <i.icon className="h-4 w-4" />
                <span className="font-medium">{i.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu></SidebarGroupContent>
    </SidebarGroup>
  );
  
  return (
    <Sidebar collapsible="icon" className="border-r bg-gradient-to-b from-card to-card/50">
      <SidebarHeader className="border-b border-border/40">
        <Link to="/admin" className="flex items-center gap-3 px-3 py-4 hover:bg-accent/50 rounded-lg transition-colors mx-2">
          <div className="relative">
            <img 
              src={bulchaLogo} 
              alt="Bulcha International Hotel" 
              className="size-10 shrink-0 rounded-lg object-contain shadow-sm ring-1 ring-border/50" 
            />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-foreground">Bulcha International</div>
              <div className="truncate text-xs text-muted-foreground">Hotel Management</div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="py-4">
        {group("Overview", overview)}
        {group("Menu Management", menu)}
        {group("Content", media)}
        {group("Operations", operations)}
        {group("System", control.filter((c) => isSuper || !c.superOnly))}
      </SidebarContent>
      
      <SidebarFooter className="border-t border-border/40 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="View guest menu" className="gap-3">
              <a href="/menu" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                <ExternalLink className="h-4 w-4" />
                <span className="font-medium">View Guest Menu</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()} tooltip="Sign out" className="gap-3 text-muted-foreground hover:text-destructive">
              <LogOut className="h-4 w-4" />
              <span className="truncate font-medium">{user?.email ?? "Sign out"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
