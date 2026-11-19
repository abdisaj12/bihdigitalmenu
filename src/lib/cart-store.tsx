import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CartFood = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  subcategory: string | null;
};
export type CartLine = { food: CartFood; qty: number; note?: string };

interface CartCtx {
  lines: CartLine[];
  add: (f: CartFood, quantity?: number, note?: string) => void;
  update: (id: string, delta: number) => void;
  setNote: (id: string, note: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "bulcha-cart-v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) { const saved = JSON.parse(raw); if (Array.isArray(saved)) setLines(saved.filter(x => x.food?.id && Number.isInteger(x.qty) && x.qty > 0 && x.qty <= 50)); }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    try { if (ready) localStorage.setItem(KEY, JSON.stringify(lines)); } catch {}
  }, [lines, ready]);

  const add = (f: CartFood, quantity = 1, note = "") =>
    setLines((l) => {
      const i = l.findIndex((x) => x.food.id === f.id);
      if (i >= 0) return l.map((x, j) => (j === i ? { ...x, qty: Math.min(50, x.qty + quantity), note: note || x.note } : x));
      return [...l, { food: f, qty: Math.min(50, quantity), note }];
    });
  const update = (id: string, delta: number) =>
    setLines((l) =>
      l.map((x) => (x.food.id === id ? { ...x, qty: Math.min(50, Math.max(0, x.qty + delta)) } : x)).filter((x) => x.qty > 0),
    );
  const setNote = (id: string, note: string) =>
    setLines((l) => l.map((x) => (x.food.id === id ? { ...x, note } : x)));
  const clear = () => setLines([]);

  const count = lines.reduce((s, x) => s + x.qty, 0);
  const subtotal = lines.reduce((s, x) => s + x.food.price * x.qty, 0);

  return <Ctx.Provider value={{ lines, add, update, setNote, clear, count, subtotal }}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}
