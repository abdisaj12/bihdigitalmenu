import { Link } from "@tanstack/react-router";
import { LogIn, LayoutDashboard } from "lucide-react";
import bulchaLogo from "@/assets/bulcha-logo.png";
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const { user, roles } = useAuth();
  const isStaff = roles.some((r) => r !== "customer");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={bulchaLogo} alt="Bulcha International Hotel" width={40} height={40} className="h-10 w-10 object-contain" />
          <div className="leading-tight">
            <p className="font-display text-base font-bold tracking-tight sm:text-lg">Bulcha</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">International Hotel</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">Features</a>
          <a href="#how" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">How it works</a>
          <Link to="/menu" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">Menu</Link>
        </nav>
        <div className="flex items-center gap-2">
          {isStaff && (
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium shadow-soft transition-smooth hover:shadow-elegant"
            >
              <LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
            </Link>
          )}
          {!user ? (
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-xs font-medium shadow-soft transition-smooth hover:shadow-elegant"
            >
              <LogIn className="h-3.5 w-3.5" /> Staff Login
            </Link>
          ) : null}
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-smooth hover:shadow-gold"
          >
            View Menu
          </Link>
        </div>
      </div>
    </header>
  );
}
