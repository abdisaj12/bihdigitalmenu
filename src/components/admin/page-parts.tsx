import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return <div className="flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1>{subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}</div>{actions && <div className="flex flex-wrap gap-2">{actions}</div>}</div>;
}
export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return <div className="flex flex-col items-center gap-2 px-6 py-14 text-center"><Inbox className="size-8 text-muted-foreground" /><p className="font-medium">{title}</p>{body && <p className="max-w-sm text-sm text-muted-foreground">{body}</p>}{action}</div>;
}
export function LoadingRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return <>{Array.from({ length: rows }).map((_, r) => <tr key={r} className="border-b">{Array.from({ length: cols }).map((_, c) => <td key={c} className="p-3"><div className="h-4 animate-pulse rounded bg-muted" /></td>)}</tr>)}</>;
}
export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return <div className="rounded-xl border bg-card p-5"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}</div>;
}
