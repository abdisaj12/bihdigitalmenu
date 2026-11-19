import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { 
  ChefHat, ConciergeBell, Coins, Clock, CheckCircle, 
  Loader2, Users, BedDouble, Utensils, RefreshCw,
  TrendingUp, Package
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ETB } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({ meta: [
    {"title": "Orders Management — Bulcha International Hotel"},
    {"name": "description", "content": "Manage kitchen orders, waiter service, and cashier operations."},
    {"property": "og:title", "content": "Orders Management — Bulcha International Hotel"},
    {"property": "og:description", "content": "Manage orders for Bulcha International Hotel."},
    {"property": "og:type", "content": "website"},
    {"name": "twitter:card", "content": "summary_large_image"},
  ] }),
  component: OrdersManagement,
});

type Status = "pending" | "accepted" | "preparing" | "ready" | "delivered" | "cancelled";

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  status: Status;
  total: number;
  created_at: string;
  room_service: boolean;
  payment_status: string;
  table_id: string | null;
};

const statusConfig: Record<Status, { color: string; label: string }> = {
  pending: { color: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20", label: "New" },
  accepted: { color: "bg-blue-500/10 text-blue-700 border-blue-500/20", label: "Accepted" },
  preparing: { color: "bg-purple-500/10 text-purple-700 border-purple-500/20", label: "Preparing" },
  ready: { color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20", label: "Ready" },
  delivered: { color: "bg-muted text-muted-foreground border-border", label: "Delivered" },
  cancelled: { color: "bg-red-500/10 text-red-700 border-red-500/20", label: "Cancelled" },
};

function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kitchen" | "service" | "all">("all");

  useEffect(() => {
    loadOrders();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "orders" 
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setOrders((prev) => [payload.new as Order, ...prev]);
          toast.success("New order received!");
        } else if (payload.eventType === "UPDATE") {
          setOrders((prev) => 
            prev.map((o) => o.id === (payload.new as Order).id ? payload.new as Order : o)
          );
        } else if (payload.eventType === "DELETE") {
          setOrders((prev) => prev.filter((o) => o.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadOrders() {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    
    if (error) {
      toast.error(error.message);
    } else {
      setOrders((data as Order[]) ?? []);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, status: Status) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Order status updated to ${status}`);
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    }
  }

  const stats = useMemo(() => {
    const active = orders.filter(o => !["delivered", "cancelled"].includes(o.status));
    return {
      total: orders.length,
      active: active.length,
      pending: orders.filter(o => o.status === "pending").length,
      preparing: orders.filter(o => o.status === "preparing").length,
      ready: orders.filter(o => o.status === "ready").length,
      delivered: orders.filter(o => o.status === "delivered").length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (view === "kitchen") {
      return orders.filter(o => ["pending", "accepted", "preparing", "ready"].includes(o.status));
    } else if (view === "service") {
      return orders.filter(o => o.status === "ready" || o.status === "preparing");
    }
    return orders;
  }, [orders, view]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live kitchen orders and service tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("all")}
          >
            All Orders
          </Button>
          <Button
            variant={view === "kitchen" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("kitchen")}
            className="gap-2"
          >
            <ChefHat className="h-4 w-4" />
            Kitchen View
          </Button>
          <Button
            variant={view === "service" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("service")}
            className="gap-2"
          >
            <ConciergeBell className="h-4 w-4" />
            Service View
          </Button>
          <Button onClick={loadOrders} disabled={loading} variant="outline" size="sm" className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-gradient-to-br from-[#8B1538] to-[#A61D3F] p-2.5 text-white">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs font-medium text-muted-foreground">Total Orders</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 p-2.5 text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.active}</div>
            <div className="text-xs font-medium text-muted-foreground">Active</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-500 p-2.5 text-white">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-xs font-medium text-muted-foreground">Pending</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-gradient-to-br from-purple-600 to-purple-500 p-2.5 text-white">
                <ChefHat className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.preparing}</div>
            <div className="text-xs font-medium text-muted-foreground">Preparing</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-500 p-2.5 text-white">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.ready}</div>
            <div className="text-xs font-medium text-muted-foreground">Ready</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="rounded-lg bg-gradient-to-br from-gray-600 to-gray-500 p-2.5 text-white">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold">{stats.delivered}</div>
            <div className="text-xs font-medium text-muted-foreground">Delivered</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Grid */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>
            {view === "kitchen" ? "Kitchen Orders" : view === "service" ? "Service Queue" : "All Orders"}
          </CardTitle>
          <CardDescription>
            {filteredOrders.length} {filteredOrders.length === 1 ? "order" : "orders"} • Updates in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#8B1538]" />
              <p className="text-sm text-muted-foreground">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Package className="h-12 w-12 opacity-30" />
              <div className="text-center">
                <p className="font-medium">No orders found</p>
                <p className="text-xs text-muted-foreground">Orders will appear here automatically</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onUpdateStatus={updateStatus}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function OrderCard({ 
  order, 
  onUpdateStatus 
}: { 
  order: Order; 
  onUpdateStatus: (id: string, status: Status) => Promise<void>;
}) {
  const [items, setItems] = useState<Array<{ id: string; food_name: string; quantity: number }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadItems();
  }, [order.id]);

  async function loadItems() {
    const { data } = await supabase
      .from("order_items")
      .select("id, food_name, quantity")
      .eq("order_id", order.id);
    setItems(data ?? []);
  }

  const minutes = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
  const statusInfo = statusConfig[order.status];

  const nextStatus: Status | null = 
    order.status === "pending" ? "preparing" :
    order.status === "preparing" ? "ready" :
    order.status === "ready" ? "delivered" :
    null;

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setLoading(true);
    await onUpdateStatus(order.id, nextStatus);
    setLoading(false);
  };

  return (
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      <div className={`h-1 ${statusInfo.color.split(" ")[0]}`} />
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold">{order.order_number}</p>
          <Badge className={`${statusInfo.color} border`} variant="secondary">
            {statusInfo.label}
          </Badge>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {order.room_service ? (
              <BedDouble className="h-3.5 w-3.5" />
            ) : (
              <Utensils className="h-3.5 w-3.5" />
            )}
            <span>{order.customer_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{minutes} min ago</span>
          </div>
        </div>

        <div className="space-y-1.5 mb-3">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="text-sm">
              <span className="font-medium">{item.quantity}×</span> {item.food_name}
            </div>
          ))}
          {items.length > 3 && (
            <div className="text-xs text-muted-foreground">
              +{items.length - 3} more items
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <span className="font-semibold">{ETB(order.total)}</span>
          {nextStatus && (
            <Button
              size="sm"
              onClick={handleAdvance}
              disabled={loading}
              className="h-8 text-xs bg-gradient-to-r from-[#8B1538] to-[#A61D3F] hover:from-[#A61D3F] hover:to-[#8B1538]"
            >
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : statusConfig[nextStatus].label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
