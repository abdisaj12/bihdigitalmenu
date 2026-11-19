import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ETB } from "@/lib/format";
import {
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  Star,
  Trophy,
  DollarSign,
  ConciergeBell,
  Receipt,
  QrCode,
  ScrollText,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  AlertCircle,
  Image as ImageIcon,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [
    {"title": "Dashboard — Bulcha International Hotel"},
    {"name": "description", "content": "Bulcha staff workspace dashboard overview."},
    {"property": "og:title", "content": "Dashboard — Bulcha International Hotel"},
    {"property": "og:description", "content": "Bulcha staff workspace dashboard overview."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: AdminOverview,
});

type Stats = {
  total: number;
  available: number;
  outOfStock: number;
  featured: number;
  bestSellers: number;
  avgPrice: number;
};

type RecentActivity = {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user_email: string;
};

function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      
      // Fetch menu stats
      const { data } = await supabase
        .from("foods")
        .select("price, status, is_featured, is_best_seller, archived");
      const rows = (data ?? []).filter((r: any) => !r.archived);
      const total = rows.length;
      const available = rows.filter((r: any) => r.status === "available").length;
      const outOfStock = rows.filter((r: any) => r.status === "out_of_stock").length;
      const featured = rows.filter((r: any) => r.is_featured).length;
      const bestSellers = rows.filter((r: any) => r.is_best_seller).length;
      const avgPrice = total ? rows.reduce((s: number, r: any) => s + Number(r.price || 0), 0) / total : 0;
      setStats({ total, available, outOfStock, featured, bestSellers, avgPrice });
      
      // Fetch recent activity (if audit log exists)
      const { data: activity } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      setRecentActivity(activity as any ?? []);
      
      setLoading(false);
    })();
  }, []);

  const statsCards = [
    { 
      label: "Total Menu Items", 
      value: stats?.total ?? 0, 
      icon: UtensilsCrossed, 
      color: "from-[#8B1538] to-[#A61D3F]",
      trend: "+12% from last month",
      trendUp: true
    },
    { 
      label: "Available Now", 
      value: stats?.available ?? 0, 
      icon: CheckCircle2, 
      color: "from-emerald-600 to-emerald-500",
      trend: `${stats?.available ?? 0} items in stock`,
      trendUp: true
    },
    { 
      label: "Out of Stock", 
      value: stats?.outOfStock ?? 0, 
      icon: AlertCircle, 
      color: "from-red-600 to-red-500",
      trend: "Needs attention",
      trendUp: false
    },
    { 
      label: "Featured Items", 
      value: stats?.featured ?? 0, 
      icon: Star, 
      color: "from-amber-500 to-yellow-500",
      trend: "Premium selections",
      trendUp: true
    },
    { 
      label: "Best Sellers", 
      value: stats?.bestSellers ?? 0, 
      icon: Trophy, 
      color: "from-orange-600 to-orange-500",
      trend: "Top performers",
      trendUp: true
    },
    {
      label: "Average Price",
      value: stats ? ETB(stats.avgPrice) : "—",
      icon: DollarSign,
      color: "from-blue-600 to-blue-500",
      trend: "Menu pricing",
      trendUp: true
    },
  ];

  const quickActions = [
    { 
      to: "/menu-admin", 
      icon: UtensilsCrossed, 
      title: "Manage Menu", 
      desc: "Add, edit, and organize menu items",
      color: "bg-gradient-to-br from-[#8B1538]/10 to-[#A61D3F]/10 hover:from-[#8B1538]/20 hover:to-[#A61D3F]/20",
      iconColor: "text-[#8B1538]"
    },
    { 
      to: "/dashboard", 
      icon: ConciergeBell, 
      title: "Live Orders", 
      desc: "Kitchen & service management",
      color: "bg-gradient-to-br from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20",
      iconColor: "text-blue-600"
    },
    { 
      to: "/payments", 
      icon: Receipt, 
      title: "Payments", 
      desc: "Approve and track transactions",
      color: "bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 hover:from-emerald-500/20 hover:to-emerald-600/20",
      iconColor: "text-emerald-600"
    },
    { 
      to: "/qr-codes", 
      icon: QrCode, 
      title: "QR Codes", 
      desc: "Table & room QR management",
      color: "bg-gradient-to-br from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20",
      iconColor: "text-purple-600"
    },
    { 
      to: "/admin/media", 
      icon: ImageIcon, 
      title: "Media Library", 
      desc: "Upload and manage images",
      color: "bg-gradient-to-br from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20",
      iconColor: "text-amber-600"
    },
    { 
      to: "/admin/audit", 
      icon: ScrollText, 
      title: "Activity Logs", 
      desc: "Track all system changes",
      color: "bg-gradient-to-br from-slate-500/10 to-slate-600/10 hover:from-slate-500/20 hover:to-slate-600/20",
      iconColor: "text-slate-600"
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted"></div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back! Here's what's happening with your hotel menu today.
          </p>
        </div>
        <Badge variant="outline" className="gap-1 px-3 py-1">
          <Calendar className="h-3 w-3" />
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statsCards.map((card, index) => (
          <Card key={index} className="group relative overflow-hidden border-0 shadow-sm transition-all hover:shadow-md">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
            <CardContent className="relative p-5">
              <div className="flex items-start justify-between">
                <div className={`rounded-xl bg-gradient-to-br ${card.color} p-2.5 text-white shadow-sm`}>
                  <card.icon className="h-5 w-5" />
                </div>
                {card.trendUp !== undefined && (
                  <TrendingUp className={`h-4 w-4 ${card.trendUp ? 'text-emerald-600' : 'text-red-600'} ${!card.trendUp && 'rotate-180'}`} />
                )}
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="text-xs font-medium text-muted-foreground">{card.label}</div>
              </div>
              <div className="mt-2 text-[10px] text-muted-foreground">{card.trend}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <Link to="/admin/settings" className="text-sm text-muted-foreground hover:text-foreground">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.to} to={action.to}>
              <Card className={`group border-0 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md ${action.color}`}>
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
                  <div className={`rounded-xl bg-background p-3 ${action.iconColor} shadow-sm ring-1 ring-border/50`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <CardTitle className="text-base font-semibold group-hover:text-foreground">
                      {action.title}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {action.desc}
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      {stats && stats.outOfStock > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">Attention Required</CardTitle>
                <CardDescription>
                  {stats.outOfStock} menu items are currently out of stock
                </CardDescription>
              </div>
              <Link to="/admin/availability">
                <Badge variant="destructive" className="gap-1">
                  Manage Stock <ArrowRight className="h-3 w-3" />
                </Badge>
              </Link>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest changes in the admin console</CardDescription>
              </div>
              <Link to="/admin/audit" className="text-sm text-muted-foreground hover:text-foreground">
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 rounded-full bg-primary/10 p-1.5">
                    <ScrollText className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {activity.user_email} • {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
