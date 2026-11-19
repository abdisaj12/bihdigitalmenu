import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { ItemsManager } from '@/components/admin/items-manager';
export const Route = createFileRoute('/_authenticated/admin/meals')({
  validateSearch: z.object({ q: z.string().optional(), new: z.boolean().optional() }),
  head: () => ({ meta: [{ title: 'Meals — Bulcha Admin' }, { name: 'description', content: 'Manage meals on the Bulcha digital menu.' }, { property: 'og:title', content: 'Meals — Bulcha Admin' }, { property: 'og:description', content: 'Manage meals on the Bulcha digital menu.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Page,
});
function Page() { const s = Route.useSearch(); return <ItemsManager type="meal" initialQuery={s.q ?? ''} openNew={!!s.new} />; }
