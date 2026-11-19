ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'meal' CHECK (item_type IN ('meal','drink')),
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS prep_minutes integer CHECK (prep_minutes IS NULL OR prep_minutes BETWEEN 0 AND 600),
  ADD COLUMN IF NOT EXISTS size text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available' CHECK (status IN ('available','unavailable','sold_out','hidden')),
  ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS discount_percent numeric NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 90),
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.menu_items m SET status = CASE WHEN m.is_available THEN 'available' ELSE 'unavailable' END;
UPDATE public.menu_items m SET item_type='drink' FROM public.categories c WHERE c.id=m.category_id AND c.name_en IN ('Hot Drinks','Cold Drinks','Cocktails and Wine');

ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE RESTRICT;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS prices_include_vat boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.sync_menu_item_state() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  NEW.is_available := NEW.status='available' AND NEW.deleted_at IS NULL;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS menu_items_sync_state ON public.menu_items;
CREATE TRIGGER menu_items_sync_state BEFORE INSERT OR UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.sync_menu_item_state();

CREATE OR REPLACE FUNCTION public.is_menu_admin(_uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_uid AND role IN ('admin','super_admin'))
$$;
REVOKE ALL ON FUNCTION public.is_menu_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_menu_admin(uuid) TO authenticated;

CREATE TABLE public.price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  old_price numeric, new_price numeric NOT NULL,
  changed_by uuid, changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.price_history TO authenticated;
GRANT ALL ON public.price_history TO service_role;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY price_history_admin_read ON public.price_history FOR SELECT TO authenticated USING (public.is_menu_admin(auth.uid()));

CREATE TABLE public.admin_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid, actor_email text,
  action text NOT NULL, entity text NOT NULL, record_id text, record_label text,
  old_values jsonb, new_values jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_activity TO authenticated;
GRANT ALL ON public.admin_activity TO service_role;
ALTER TABLE public.admin_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_activity_admin_read ON public.admin_activity FOR SELECT TO authenticated USING (public.is_menu_admin(auth.uid()));
CREATE INDEX admin_activity_created_idx ON public.admin_activity(created_at DESC);

CREATE OR REPLACE FUNCTION public.log_admin_activity() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o jsonb; n jsonb; act text; rid text; lbl text;
BEGIN
  IF TG_OP='DELETE' THEN o:=to_jsonb(OLD); act:='delete';
  ELSIF TG_OP='INSERT' THEN n:=to_jsonb(NEW); act:='create';
  ELSE o:=to_jsonb(OLD); n:=to_jsonb(NEW); act:='update';
    IF o=n THEN RETURN NEW; END IF;
    IF TG_TABLE_NAME='menu_items' THEN
      IF (o->>'deleted_at') IS NULL AND (n->>'deleted_at') IS NOT NULL THEN act:='soft_delete';
      ELSIF (o->>'deleted_at') IS NOT NULL AND (n->>'deleted_at') IS NULL THEN act:='restore';
      ELSIF (o->>'price')<>(n->>'price') THEN act:='price_change';
        INSERT INTO public.price_history(item_id,old_price,new_price,changed_by) VALUES ((n->>'id')::uuid,(o->>'price')::numeric,(n->>'price')::numeric,auth.uid());
      ELSIF coalesce(o->>'image_url','')<>coalesce(n->>'image_url','') OR o->'gallery'<>n->'gallery' THEN act:='image_change';
      END IF;
    END IF;
  END IF;
  rid := coalesce(n->>'id',o->>'id', n->>'user_id', o->>'user_id');
  lbl := coalesce(n->>'name_en',o->>'name_en',n->>'hotel_name',o->>'hotel_name',n->>'role',o->>'role');
  IF TG_TABLE_NAME='user_roles' THEN act:='permission_'||act; END IF;
  INSERT INTO public.admin_activity(actor_id,actor_email,action,entity,record_id,record_label,old_values,new_values)
  VALUES (auth.uid(), auth.jwt()->>'email', act, TG_TABLE_NAME, rid, lbl, o, n);
  RETURN coalesce(NEW,OLD);
END $$;
REVOKE ALL ON FUNCTION public.log_admin_activity() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER menu_items_activity AFTER INSERT OR UPDATE OR DELETE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();
CREATE TRIGGER categories_activity AFTER INSERT OR UPDATE OR DELETE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();
CREATE TRIGGER settings_activity AFTER UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();
CREATE TRIGGER user_roles_activity AFTER INSERT OR UPDATE OR DELETE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.log_admin_activity();

-- Only super admins manage roles; nobody edits their own roles
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY roles_admin_read ON public.user_roles FOR SELECT TO authenticated USING (public.is_menu_admin(auth.uid()));
CREATE POLICY roles_super_insert ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'super_admin') AND user_id<>auth.uid());
CREATE POLICY roles_super_delete ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin') AND user_id<>auth.uid());
GRANT INSERT, DELETE ON public.user_roles TO authenticated;

-- Settings: only super admins change global settings
DROP POLICY IF EXISTS settings_admin_all ON public.settings;
CREATE POLICY settings_super_write ON public.settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY settings_super_insert ON public.settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- Block deleting categories still in use
CREATE OR REPLACE FUNCTION public.guard_category_delete() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.menu_items WHERE category_id=OLD.id) THEN RAISE EXCEPTION 'This category still has items. Move or delete them first.'; END IF;
  IF EXISTS (SELECT 1 FROM public.categories WHERE parent_id=OLD.id) THEN RAISE EXCEPTION 'This category still has subcategories.'; END IF;
  RETURN OLD;
END $$;
CREATE TRIGGER categories_guard_delete BEFORE DELETE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.guard_category_delete();