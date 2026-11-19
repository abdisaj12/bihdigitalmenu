import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion, MotionConfig } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { auditThemeContrast } from "@/lib/contrast-audit";

const KEY = "bulcha-theme";
type Mode = "dark" | "light";

function apply(mode: Mode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("light", mode === "light");
  root.classList.toggle("dark", mode === "dark");
  root.style.colorScheme = mode;
  // Clear any prior runtime overrides so the fresh tokens can be audited.
  root.style.removeProperty("--foreground");
  root.style.removeProperty("--muted-foreground");
  // Defer to next frame so computed styles reflect the new class.
  requestAnimationFrame(() => {
    try { auditThemeContrast(mode); } catch {}
  });
}

interface ThemeCtx {
  mode: Mode;
  toggle: () => void;
}
const Ctx = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("light");
  const [flash, setFlash] = useState<Mode | null>(null);
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const userIdRef = useRef<string | null>(null);
  const hydratedFromRemoteRef = useRef(false);

  // Initialise once on the client, apply stored preference, and inject
  // a global smooth-transition rule for token-driven colors/shadows.
  useEffect(() => {
    let saved: Mode = "light";
    try {
      const v = localStorage.getItem(KEY);
      if (v === "light" || v === "dark") saved = v;
    } catch {}
    setMode(saved);
    apply(saved);

    const style = document.createElement("style");
    style.setAttribute("data-theme-transition", "");
    // Honour prefers-reduced-motion: no color/shadow transition when the
    // user has requested reduced motion.
    style.textContent = `
      @media (prefers-reduced-motion: no-preference) {
        html, body, *, *::before, *::after {
          transition:
            background-color .55s cubic-bezier(.22,1,.36,1),
            color .55s cubic-bezier(.22,1,.36,1),
            border-color .55s cubic-bezier(.22,1,.36,1),
            box-shadow .55s cubic-bezier(.22,1,.36,1),
            fill .35s ease,
            stroke .35s ease;
        }
      }
    `;
    document.head.appendChild(style);
    setMounted(true);
    return () => { style.remove(); };
  }, []);

  // Sync with the signed-in user's profile: pull remote theme on login,
  // push local theme when it changes.
  useEffect(() => {
    const loadRemoteTheme = async (uid: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("theme")
        .eq("id", uid)
        .maybeSingle();
      const remote = (data as { theme?: string } | null)?.theme;
      if (remote === "light" || remote === "dark") {
        hydratedFromRemoteRef.current = true;
        setMode(remote);
        apply(remote);
        try { localStorage.setItem(KEY, remote); } catch {}
      } else {
        // No remote preference yet — push whatever the user has locally.
        try {
          const local = localStorage.getItem(KEY);
          if (local === "light" || local === "dark") {
            await supabase.from("profiles").update({ theme: local }).eq("id", uid);
          }
        } catch {}
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      userIdRef.current = uid;
      if (uid) loadRemoteTheme(uid);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const uid = session?.user?.id ?? null;
      userIdRef.current = uid;
      if (event === "SIGNED_IN" && uid) loadRemoteTheme(uid);
      if (event === "SIGNED_OUT") hydratedFromRemoteRef.current = false;
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const toggle = () => {
    const next: Mode = mode === "dark" ? "light" : "dark";
    const commit = () => {
      setMode(next);
      apply(next);
      try { localStorage.setItem(KEY, next); } catch {}
      const uid = userIdRef.current;
      if (uid) {
        supabase.from("profiles").update({ theme: next }).eq("id", uid).then(() => {});
      }
    };

    if (prefersReducedMotion) {
      // Skip the crossfade overlay entirely.
      commit();
      return;
    }

    setFlash(next);
    // Let overlay fade in first, then swap tokens under it, then fade out.
    window.setTimeout(commit, 140);
    window.setTimeout(() => setFlash(null), 620);
  };

  return (
    <MotionConfig reducedMotion="user">
      <Ctx.Provider value={{ mode, toggle }}>
        {children}
        <AnimatePresence>
          {mounted && flash && !prefersReducedMotion && (
            <motion.div
              key={flash}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden
              className="theme-crossfade pointer-events-none fixed inset-0 z-[9999]"
            />
          )}
        </AnimatePresence>
      </Ctx.Provider>
    </MotionConfig>
  );
}

export function useTheme() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useTheme must be used inside ThemeProvider");
  return c;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { mode, toggle } = useTheme();
  const isDark = mode === "dark";
  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.06 }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full glass border border-border text-foreground shadow-soft transition-smooth hover:shadow-gold ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Moon className="h-4 w-4 text-[color:var(--gold)]" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Sun className="h-4 w-4 text-[color:var(--gold)]" />
          </motion.span>
        )}
      </AnimatePresence>
      <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-br from-[color:var(--gold)]/0 via-[color:var(--gold)]/10 to-transparent" />
    </motion.button>
  );
}
