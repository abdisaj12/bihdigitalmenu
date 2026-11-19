import bulchaLogo from "@/assets/bulcha-logo.png";

export function SiteFooter() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <img src={bulchaLogo} alt="Bulcha International Hotel" width={40} height={40} loading="lazy" className="h-10 w-10 object-contain" />
            <div className="leading-tight">
              <span className="font-display text-lg font-bold">Bulcha International Hotel</span>
              <p className="text-[10px] uppercase tracking-widest text-primary-foreground/60">Bulcha Smart Menu</p>
            </div>
          </div>
          <p className="text-sm text-primary-foreground/70">
            © {new Date().getFullYear()} Bulcha International Hotel · All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
