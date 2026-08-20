-- ==============================================================================
-- Frère Mixage — Authentification par Téléphone, Gestion d'Équipe & Rôles
-- ==============================================================================

-- 1. Mise à jour de la table profiles pour supporter l'authentification par téléphone
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Index unique sur le téléphone normalisé
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_idx ON public.profiles(phone) WHERE phone IS NOT NULL;

-- 2. Fonction trigger pour la création automatique de profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    role,
    is_active
  ) VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Membre Atelier'),
    new.email,
    COALESCE(new.phone, new.raw_user_meta_data->>'phone'),
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'assistant'),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Procédure sécurisée : Création d'un assistant par le Propriétaire (OWNER uniquement)
CREATE OR REPLACE FUNCTION public.admin_create_assistant(
  p_full_name TEXT,
  p_phone TEXT,
  p_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_new_user_id UUID;
  v_norm_phone TEXT;
BEGIN
  -- Vérifier que l'utilisateur exécutant est bien OWNER
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Action non autorisée. Seul le propriétaire peut ajouter un membre à l''équipe.';
  END IF;

  -- Validation des entrées
  IF p_full_name IS NULL OR TRIM(p_full_name) = '' THEN
    RAISE EXCEPTION 'Le nom complet est obligatoire.';
  END IF;
  IF p_phone IS NULL OR TRIM(p_phone) = '' THEN
    RAISE EXCEPTION 'Le numéro de téléphone est obligatoire.';
  END IF;
  IF p_password IS NULL OR LENGTH(p_password) < 6 THEN
    RAISE EXCEPTION 'Le mot de passe doit comporter au moins 6 caractères.';
  END IF;

  v_norm_phone := TRIM(p_phone);

  -- Vérifier si le numéro existe déjà
  IF EXISTS (SELECT 1 FROM auth.users WHERE phone = v_norm_phone) THEN
    RAISE EXCEPTION 'Un compte avec ce numéro de téléphone existe déjà.';
  END IF;

  -- Créer l'utilisateur dans auth.users
  v_new_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    phone,
    encrypted_password,
    phone_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    v_new_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    v_norm_phone,
    crypt(p_password, gen_salt('bf')),
    NOW(),
    '{"provider":"phone","providers":["phone"]}'::jsonb,
    jsonb_build_object('full_name', TRIM(p_full_name), 'role', 'assistant', 'phone', v_norm_phone),
    NOW(),
    NOW()
  );

  -- Enregistrer dans le journal d'activité
  INSERT INTO public.activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    description
  ) VALUES (
    auth.uid(),
    'create_assistant',
    'profile',
    v_new_user_id,
    'Ajout du nouvel assistant : ' || TRIM(p_full_name) || ' (' || v_norm_phone || ')'
  );

  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_new_user_id,
    'full_name', TRIM(p_full_name),
    'phone', v_norm_phone,
    'role', 'assistant'
  );
END;
$$;

-- 4. Procédure sécurisée : Activer / Désactiver un assistant
CREATE OR REPLACE FUNCTION public.admin_toggle_user_status(
  p_user_id UUID,
  p_is_active BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_target_role user_role;
  v_target_name TEXT;
BEGIN
  IF NOT public.is_owner() THEN
    RAISE EXCEPTION 'Action non autorisée. Seul le propriétaire peut modifier le statut d''un membre.';
  END IF;

  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Vous ne pouvez pas modifier votre propre statut.';
  END IF;

  SELECT role, full_name INTO v_target_role, v_target_name
  FROM public.profiles
  WHERE id = p_user_id;

  IF v_target_role = 'owner' THEN
    RAISE EXCEPTION 'Impossible de désactiver le compte du propriétaire.';
  END IF;

  UPDATE public.profiles
  SET is_active = p_is_active,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Journal d'activité
  INSERT INTO public.activity_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    description
  ) VALUES (
    auth.uid(),
    CASE WHEN p_is_active THEN 'enable_user' ELSE 'disable_user' END,
    'profile',
    p_user_id,
    CASE WHEN p_is_active THEN 'Réactivation du compte de ' || v_target_name ELSE 'Désactivation du compte de ' || v_target_name END
  );

  RETURN jsonb_build_object('success', true, 'user_id', p_user_id, 'is_active', p_is_active);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_assistant TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_toggle_user_status TO authenticated;
