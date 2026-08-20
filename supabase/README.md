# Supabase — Frère Mixage

Ce dossier contient toute la structure backend versionnée du projet. Rien ici n'est encore connecté au site public.

## Contenu

- `migrations/` — schéma SQL reproductible (tables, RLS, storage), à appliquer dans l'ordre du nom de fichier.
- `seed/migrate-products.mjs` — script de migration des 7 produits actuels (préparé, non exécuté — voir en-tête du fichier).

## Mise en place (à faire manuellement, une seule fois)

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Récupérer l'URL du projet et la clé `anon` dans *Project Settings > API*, les mettre dans `.env` (copié depuis `.env.example`).
3. Appliquer les migrations, deux méthodes possibles :
   - **Dashboard** : coller le contenu de chaque fichier de `migrations/`, dans l'ordre, dans le *SQL Editor* et l'exécuter.
   - **CLI Supabase** (recommandé pour la suite du projet, garde tout reproductible) :
     ```
     npx supabase login
     npx supabase link --project-ref <votre-project-ref>
     npx supabase db push
     ```
     `npx supabase init` régénère au besoin `supabase/config.toml` (absent ici volontairement, son contenu dépend de la version de CLI) sans toucher au dossier `migrations/`.
4. Créer le tout premier compte administrateur (owner) :
   - Créer l'utilisateur via *Authentication > Users > Add user* (email + mot de passe).
   - Un profil `assistant` est créé automatiquement par le trigger `on_auth_user_created`. Le promouvoir en owner :
     ```sql
     update public.profiles set role = 'owner' where email = 'owner@freremixage.com';
     ```
5. `npm install` (ajoute `@supabase/supabase-js`), puis `npm run dev` pour vérifier que le site public démarre toujours normalement.

## Prochaines migrations

Toute évolution future du schéma doit être ajoutée comme **nouveau fichier** dans `migrations/` (jamais en modifiant un fichier déjà appliqué), nommé `YYYYMMDDHHMMSS_description.sql`.
