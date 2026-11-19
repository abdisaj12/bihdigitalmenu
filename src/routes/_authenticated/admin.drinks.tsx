import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { ItemsManager } from '@/components/admin/items-manager';
export const Route = createFileRoute('/_authenticated/admin/drinks')({
  validateSearch: z.object({ q: z.string().optional(), new: z.boolean().optional() }),
  head: () => ({ meta: [{ title: 'Drinks — Bulcha Admin' }, { name: 'description', content: 'Manage drinks on the Bulcha digital menu.' }, { property: 'og:title', content: 'Drinks — Bulcha Admin' }, { property: 'og:description', content: 'Manage drinks on the Bulcha digital menu.' }, { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary' }] }),
  component: Page,
});
function Page() { const s = Route.useSearch(); return <ItemsManager type="drink" initialQuery={s.q ?? ''} openNew={!!s.new} />; }
