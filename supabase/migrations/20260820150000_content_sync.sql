-- ==============================================================================
-- Frère Mixage — Synchronisation Complète du Contenu Public (Témoignages & Paramètres)
-- ==============================================================================

-- 1. Table des Témoignages Clients
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Dakar, Sénégal • Client vérifié',
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table des Paramètres Généraux et Contenu de la Maison (À Propos, Atelier)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "public_read_active_testimonials" ON public.testimonials
  FOR SELECT USING (is_active = true);

CREATE POLICY "staff_all_testimonials" ON public.testimonials
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

CREATE POLICY "public_read_store_settings" ON public.store_settings
  FOR SELECT USING (true);

CREATE POLICY "staff_all_store_settings" ON public.store_settings
  FOR ALL USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Données initiales pour les témoignages
INSERT INTO public.testimonials (name, role, quote, rating, avatar_url, is_active)
VALUES
  ('Ousmane Ba', 'Dakar, Sénégal • Client VIP', 'La qualité du Bazin Getzner et la précision des broderies dorées sont incomparables. Pour la Tabaski et les grands mariages, Frère Mixage est ma seule référence.', 5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', true),
  ('Cheikh Tidiane Diop', 'Paris, France • Diaspora', 'Commande reçue en 48h à Paris. Les mesures prises en ligne étaient d’une justesse chirurgicale. Une fierté de porter l’élégance sénégalaise en Europe.', 5, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', true),
  ('Mamadou Lamine Fall', 'Abidjan, Côte d’Ivoire', 'Le costume sahélien commandé pour une cérémonie officielle a fait l’unanimité. Finitions dignes de la haute horlogerie.', 5, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', true)
ON CONFLICT DO NOTHING;

-- Données initiales pour le contenu de l'Atelier
INSERT INTO public.store_settings (key, value)
VALUES (
  'about',
  '{
    "sectionTitle": "L''Art de la Haute Couture Sénégalaise",
    "sectionSubtitle": "Au cœur de notre atelier dakarois, chaque fil d''or et chaque pan de Bazin Getzner sont assemblés à la main pour sublimer la prestance masculine.",
    "quote": "« L''élégance n''est pas une question d''apparence, c''est l''expression suprême de notre identité et de notre fierté. »",
    "quoteAuthor": "Maison Frère Mixage • Dakar",
    "storyParagraph1": "Dans notre atelier de Dakar, chaque vêtement naît d’un dialogue intime entre tradition ancestrale et silhouette contemporaine. Nos artisans découpent, assemblent et brodent à la main chaque pièce avec une rigueur absolue.",
    "storyParagraph2": "Du drapé majestueux du Bazin teinté artisanalement à la précision géométrique de nos boutonnières, rien n’est laissé au hasard. Porter Frère Mixage, c’est affirmer un statut, une fierté et un raffinement sans compromis.",
    "badges": ["Coupe & Assemblage Main", "Broderie Fil d’Or Noble", "Teinture Grand Teint Fixe"],
    "image1": "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&q=80&w=800",
    "image2": "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=800"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
