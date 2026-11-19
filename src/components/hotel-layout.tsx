import { Link } from "@tanstack/react-router";
import { MapPin, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function HotelIdentity() {
  return (
    <Link to="/" aria-label="Bulcha International Hotel home" className="flex items-center gap-3 group">
      <img 
        src="/src/assets/bulcha-logo.png" 
        alt="Bulcha International Hotel" 
        className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
      />
      <span className="leading-tight hidden sm:block">
        <span className="block font-display text-xl">Bulcha</span>
        <span className="mt-0.5 block text-[9px] uppercase tracking-[0.18em] text-muted-foreground">International Hotel</span>
      </span>
    </Link>
  );
}

export function HotelLayout({ children, immersive = false }: { children: ReactNode; immersive?: boolean }) {
  return (
    <div className={immersive ? "welcome-shell" : "min-h-svh bg-background text-foreground"}>
      <header className={`${immersive ? "absolute inset-x-0 top-0 z-20 text-on-image" : "border-b border-gold/30"} px-6 py-6 sm:px-10 sm:py-8 lg:px-16`}>
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <HotelIdentity />
          <div className="flex items-center gap-8">
            <span className="hidden items-center gap-2 text-xs sm:inline-flex"><MapPin className="size-3.5 text-gold" /> Hawassa, Ethiopia</span>
            <Button asChild variant="ghost" size="icon" className={immersive ? "text-on-image hover:bg-on-image/10 hover:text-on-image" : ""}>
              <Link to="/admin/login" aria-label="Hotel administration" title="Hotel administration"><ArrowUpRight /></Link>
            </Button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}