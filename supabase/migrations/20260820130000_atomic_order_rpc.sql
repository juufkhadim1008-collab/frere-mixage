-- ==============================================================================
-- Frère Mixage — Procédure Transactionnelle Atomique de Commande & Stock (RPC)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.process_order_atomic(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT DEFAULT NULL,
  p_delivery_address TEXT DEFAULT 'Dakar',
  p_delivery_city TEXT DEFAULT 'Dakar',
  p_payment_method TEXT DEFAULT 'cash_on_delivery',
  p_notes TEXT DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_customer_id UUID;
  v_order_id UUID;
  v_order_number TEXT;
  v_subtotal NUMERIC := 0;
  v_delivery_fee NUMERIC := 0;
  v_total NUMERIC := 0;
  v_item RECORD;
  v_product RECORD;
  v_item_price NUMERIC;
  v_item_total NUMERIC;
  v_current_stock INT;
BEGIN
  -- 1. Validation des paramètres obligatoires
  IF p_customer_name IS NULL OR TRIM(p_customer_name) = '' THEN
    RAISE EXCEPTION 'Le nom du client est obligatoire.';
  END IF;
  IF p_customer_phone IS NULL OR TRIM(p_customer_phone) = '' THEN
    RAISE EXCEPTION 'Le numéro de téléphone du client est obligatoire.';
  END IF;
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'La commande doit contenir au moins un article.';
  END IF;

  -- 2. Gestion / Création du client (upsert sur téléphone)
  SELECT id INTO v_customer_id
  FROM public.customers
  WHERE phone = TRIM(p_customer_phone);

  IF v_customer_id IS NULL THEN
    INSERT INTO public.customers (full_name, phone, email, city, address)
    VALUES (TRIM(p_customer_name), TRIM(p_customer_phone), p_customer_email, p_delivery_city, p_delivery_address)
    RETURNING id INTO v_customer_id;
  ELSE
    UPDATE public.customers
    SET full_name = TRIM(p_customer_name),
        email = COALESCE(p_customer_email, email),
        city = COALESCE(p_delivery_city, city),
        address = COALESCE(p_delivery_address, address),
        updated_at = NOW()
    WHERE id = v_customer_id;
  END IF;

  -- 3. Frais de livraison calculés côté serveur
  IF LOWER(TRIM(p_delivery_city)) = 'dakar' THEN
    v_delivery_fee := 2500;
  ELSE
    v_delivery_fee := 5000;
  END IF;

  -- 4. Création initiale de la commande
  INSERT INTO public.orders (
    customer_id,
    status,
    subtotal,
    delivery_fee,
    total,
    payment_method,
    payment_status,
    delivery_address,
    notes
  ) VALUES (
    v_customer_id,
    'new',
    0,
    v_delivery_fee,
    0,
    COALESCE(p_payment_method, 'cash_on_delivery'),
    'pending',
    COALESCE(p_delivery_address, 'Dakar'),
    p_notes
  ) RETURNING id, order_number INTO v_order_id, v_order_number;

  -- 5. Boucle sur les articles : prix serveur + verrouillage atomique du stock
  FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
    product_id UUID,
    product_slug TEXT,
    size TEXT,
    quantity INT
  )
  LOOP
    IF v_item.quantity <= 0 THEN
      RAISE EXCEPTION 'La quantité doit être supérieure à 0.';
    END IF;

    -- Récupération du produit
    IF v_item.product_id IS NOT NULL THEN
      SELECT * INTO v_product FROM public.products WHERE id = v_item.product_id AND status = 'published';
    ELSE
      SELECT * INTO v_product FROM public.products WHERE slug = v_item.product_slug AND status = 'published';
    END IF;

    IF v_product.id IS NULL THEN
      RAISE EXCEPTION 'Le produit sélectionné est introuvable ou n''est plus disponible.';
    END IF;

    -- Prix garanti depuis la base (sale_price si promo, sinon price normal)
    v_item_price := COALESCE(v_product.sale_price, v_product.price);
    v_item_total := v_item_price * v_item.quantity;
    v_subtotal := v_subtotal + v_item_total;

    -- Gestion du stock physique (sauf sur-mesure)
    IF LOWER(TRIM(v_item.size)) <> 'sur mesure' AND LOWER(TRIM(v_item.size)) <> 'sur-mesure' THEN
      SELECT stock INTO v_current_stock
      FROM public.product_variants
      WHERE product_id = v_product.id AND size = v_item.size
      FOR UPDATE;

      IF v_current_stock IS NULL THEN
        RAISE EXCEPTION 'La taille % n''est pas configurée pour la tenue %.', v_item.size, v_product.name;
      END IF;

      IF v_current_stock < v_item.quantity THEN
        RAISE EXCEPTION 'Stock insuffisant pour % en taille % (Stock restant: %, Demandé: %).',
          v_product.name, v_item.size, v_current_stock, v_item.quantity;
      END IF;

      -- Décrémentation atomique
      UPDATE public.product_variants
      SET stock = stock - v_item.quantity,
          updated_at = NOW()
      WHERE product_id = v_product.id AND size = v_item.size;
    END IF;

    -- Création du snapshot de ligne de commande
    INSERT INTO public.order_items (
      order_id,
      product_id,
      product_name_snapshot,
      size,
      quantity,
      unit_price,
      total_price
    ) VALUES (
      v_order_id,
      v_product.id,
      v_product.name,
      v_item.size,
      v_item.quantity,
      v_item_price,
      v_item_total
    );
  END LOOP;

  -- 6. Calcul final et enregistrement des montants
  v_total := v_subtotal + v_delivery_fee;
  UPDATE public.orders
  SET subtotal = v_subtotal,
      total = v_total,
      updated_at = NOW()
  WHERE id = v_order_id;

  -- 7. Retour du payload JSON
  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total', v_total,
    'customer_name', p_customer_name,
    'customer_phone', p_customer_phone,
    'created_at', NOW()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_order_atomic TO anon, authenticated;
