CREATE OR REPLACE FUNCTION public.validate_menu_order()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE line jsonb; dish public.menu_items%ROWTYPE; q integer; unit numeric; sum_total numeric:=0; rate numeric; incl boolean; normalized jsonb:='[]';
BEGIN
 IF NEW.items='[]'::jsonb THEN RAISE EXCEPTION 'Choose at least one menu item'; END IF;
 IF char_length(trim(NEW.table_or_room))=0 OR char_length(NEW.table_or_room)>80 THEN RAISE EXCEPTION 'Enter a table or room number'; END IF;
 IF jsonb_typeof(NEW.items)<>'array' OR jsonb_array_length(NEW.items)>100 THEN RAISE EXCEPTION 'Invalid order'; END IF;
 FOR line IN SELECT value FROM jsonb_array_elements(NEW.items) LOOP
  SELECT * INTO dish FROM public.menu_items WHERE id=(line->>'id')::uuid AND is_available AND deleted_at IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'An item is no longer available'; END IF;
  q:=(line->>'quantity')::integer;
  IF q<1 OR q>50 THEN RAISE EXCEPTION 'Quantity must be between 1 and 50'; END IF;
  unit:=round(dish.price*(100-coalesce(dish.discount_percent,0))/100,2);
  sum_total:=sum_total+unit*q;
  normalized:=normalized||jsonb_build_array(jsonb_build_object('id',dish.id,'name',dish.name_en,'price',unit,'quantity',q,'note',left(coalesce(line->>'note',''),500),'image_url',dish.image_url));
 END LOOP;
 SELECT vat_percent, prices_include_vat INTO rate, incl FROM public.settings WHERE id=true; rate:=coalesce(rate,15); incl:=coalesce(incl,false);
 NEW.items:=normalized;
 IF incl THEN
   NEW.total:=round(sum_total,2); NEW.vat:=round(sum_total*rate/(100+rate),2); NEW.subtotal:=NEW.total-NEW.vat;
 ELSE
   NEW.subtotal:=round(sum_total,2); NEW.vat:=round(sum_total*rate/100,2); NEW.total:=NEW.subtotal+NEW.vat;
 END IF;
 NEW.tax:=NEW.vat; NEW.status:='new'; NEW.user_id:=NULL; NEW.discount:=0; NEW.note:=left(NEW.note,1000);
 RETURN NEW;
END $function$;