// Runtime contrast auditor. Reads computed CSS token colors, computes
// WCAG relative-luminance contrast, and nudges token lightness on
// documentElement when a pair falls below the AA threshold.
//
// This is a safety net on top of the values in styles.css — if a token is
// ever changed to something insufficiently accessible, it self-corrects at
// runtime rather than shipping an unreadable UI.

type Mode = "dark" | "light";

// Parse any CSS color the browser understands (oklch, hsl, rgb, hex, alpha).
// Returns straight sRGB in 0..1 plus alpha.
function parseColor(input: string): { r: number; g: number; b: number; a: number } | null {
  if (typeof document === "undefined") return null;
  const probe = document.createElement("div");
  probe.style.color = input;
  probe.style.display = "none";
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  const m = computed.match(/rgba?\(([^)]+)\)/i);
  if (!m) return null;
  const parts = m[1].split(/[ ,/]+/).filter(Boolean).map((v) => v.trim());
  if (parts.length < 3) return null;
  const toUnit = (v: string, scale: number) => {
    if (v.endsWith("%")) return parseFloat(v) / 100;
    return parseFloat(v) / scale;
  };
  const r = toUnit(parts[0], 255);
  const g = toUnit(parts[1], 255);
  const b = toUnit(parts[2], 255);
  const a = parts[3] != null ? toUnit(parts[3], 1) : 1;
  return { r, g, b, a };
}

function relLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// Composite a semi-transparent foreground over an opaque background.
function composite(
  fg: { r: number; g: number; b: number; a: number },
  bg: { r: number; g: number; b: number; a: number },
) {
  const a = fg.a + bg.a * (1 - fg.a);
  const mix = (fc: number, bc: number) => (fc * fg.a + bc * bg.a * (1 - fg.a)) / (a || 1);
  return { r: mix(fg.r, bg.r), g: mix(fg.g, bg.g), b: mix(fg.b, bg.b), a };
}

function contrastRatio(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) {
  const la = relLuminance(a);
  const lb = relLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

interface AuditResult {
  pair: string;
  ratio: number;
  ok: boolean;
}

export function auditThemeContrast(mode: Mode): AuditResult[] {
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const bgRaw = cs.getPropertyValue("--background").trim();
  const fgRaw = cs.getPropertyValue("--foreground").trim();
  const mutedRaw = cs.getPropertyValue("--muted-foreground").trim();

  const bg = parseColor(bgRaw);
  const fg = parseColor(fgRaw);
  const muted = parseColor(mutedRaw);
  if (!bg || !fg || !muted) return [];

  // Solid background for compositing (should already be opaque).
  const solidBg = { ...bg, a: 1 };
  const fgOnBg = fg.a < 1 ? composite(fg, solidBg) : fg;
  const mutedOnBg = muted.a < 1 ? composite(muted, solidBg) : muted;

  const results: AuditResult[] = [
    { pair: "foreground/background", ratio: contrastRatio(fgOnBg, solidBg), ok: true },
    { pair: "muted-foreground/background", ratio: contrastRatio(mutedOnBg, solidBg), ok: true },
  ];

  const MIN = 4.5;

  // If muted-foreground fails, nudge it toward the extreme lightness.
  // Dark mode → lighter (higher L); light mode → darker (lower L).
  if (results[1].ratio < MIN) {
    const target = mode === "dark" ? "oklch(0.86 0.02 60)" : "oklch(0.32 0.02 40)";
    root.style.setProperty("--muted-foreground", target);
    results[1].ok = false;
  }

  // If body foreground fails (shouldn't with the shipped tokens, but a safety
  // net if someone customises them), snap to a maximum-contrast fallback.
  if (results[0].ratio < MIN) {
    const target = mode === "dark" ? "oklch(0.985 0.01 80)" : "oklch(0.12 0.02 25)";
    root.style.setProperty("--foreground", target);
    results[0].ok = false;
  }

  return results;
}
