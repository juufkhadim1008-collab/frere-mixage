# ⚜️ MAISON FRÈRE MIXAGE — DOCUMENTATION TECHNIQUE & GUIDE DE DÉVELOPPEMENT

> **Fichier de référence pour tout modèle d'intelligence artificielle ou développeur travaillant sur le projet.**

---

## 📌 1. RÈGLE GLOBALE OBLIGATOIRE (USER RULE)
> [!IMPORTANT]
> **Règle absolue imposée par l'administrateur :**
> À **CHAQUE DÉBUT D'INTERACTION**, vous devez impérativement saluer l'utilisateur avec la phrase exacte :
> **`Salam Mastü !`**

---

## 🌟 2. PRÉSENTATION DU PROJET
**Frère Mixage** est une plateforme web d'exception dédiée à la **Haute Couture Masculine Sénégalaise & Africaine** basée à Dakar.
L'application se compose de deux parties intimement interconnectées en temps réel :
1. **La Vitrine Publique (`/`)** : Expérience client immersive, luxueuse et fluide (présentation des 4 collections officielles, catalogue de tenues d'exception, personnalisation et commande directe par formulaire ou WhatsApp, section vidéo TikTok, histoire de la Maison et avis clients).
2. **Le Dashboard Administrateur (`/admin/`)** : Panneau de contrôle complet pour le fondateur/administrateur (gestion du catalogue, stock par taille, commandes, facturation & devis au format A4 noir luxe, comptabilité & rentabilité financière, avis clients, et éditeur du contenu de la Maison).

---

## 🎨 3. IDENTITÉ VISUELLE & DÉCISIONS DESIGN

Le design repose sur les codes stricts du **luxe contemporain africain (Dark Mode & Gold accents)** :

### Palette de Couleurs Officielles
- **Noir Profond Principal (`--bg-primary`)** : `#0A0A0C` (Noir ébène impérial).
- **Noir Carte Administrateur (`--admin-card`)** : `#121216` / `#16161C`.
- **Or Royal Frère Mixage (`--gold`)** : `#C6A868` à `#D4AF37`.
- **Dégradé Or Emblématique (`--gold-gradient`)** : `linear-gradient(135deg, #ECC880 0%, #C6A868 50%, #9E7D42 100%)`.
- **Bordures Subtiles Dorées (`--gold-border`)** : `rgba(198, 168, 104, 0.28)`.
- **Lueur Dorée (`--gold-glow`)** : `rgba(198, 168, 104, 0.35)`.
- **Blanc Éclatant (`--text-primary`)** : `#FFFFFF`.
- **Gris Doux (`--text-secondary`)** : `#A1A1AA`.

### Typographie de Prestige
- **Titres & Numéros de Haute Horlogerie** : `Playfair Display` ou `Cinzel` serif d'apparat.
- **Corps de texte & Interface** : `Inter` / `Outfit` sans-serif lisible et moderne.

---

## 👔 4. LES 4 COLLECTIONS OFFICIELLES (MODÈLE MÉTIER)

Le catalogue et la vitrine sont structurés autour de **4 univers précis** (ne jamais modifier ces clés sans demande explicite) :
1. `traditionnel` : **Tenues Traditionnelles** (Grands Boubous Royaux Bazin Getzner, 3 pièces traditionnels).
2. `costumes` : **Costumes Africains** (Smokings sahéliens, vestes structurées à col officier).
3. `modernes` : **Tenues Modernes** (Ensembles lin peigné, chemises d'apparat, coupes contemporaines).
4. `evenementiel` : **Collection Événementielle** (Ex: Collection Spéciale Magal, Tabaski, Korité, Mariages).

---

## 🚀 5. ARCHITECTURE TECHNIQUE & FONCTIONNALITÉS

### A. Vitrine Publique (`/`)
- **Navigation & En-tête Translucide** : Menu desktop & tiroir mobile fluide avec CTA de commande.
- **Hero Section Immersif** :
  - Titre noble : *« L'ÉLÉGANCE AFRICAINE, TAILLÉE POUR VOUS. »*
  - CTA Principal : *« COMMANDER MA TENUE → »*
  - **Bouton PLAY TikTok animé** : Onde dorée pulsante (`.play-pulse-ring`) redirigeant vers les défilés et vidéos de la Maison sur TikTok.
- **Cartes des 4 Collections** : Affichage dynamique avec photo mise à jour automatiquement (dernière tenue publiée ou photo sur mesure).
- **Catalogue & Modale de Commande** :
  - Filtres par collection avec indicateurs dorés actifs.
  - Modale produit détaillée (choix de taille de S à XXXL, mensurations sur mesure, calcul de prix en direct, envoi de commande instantané via WhatsApp ou système interne).
- **Les Coulisses de la Maison (`#atelier`)** :
  - Récit de l'artisanat dakarois, citation phare, badges de savoir-faire (*Coupe Main*, *Broderie Fil d'Or*, *Teinture Grand Teint*), et 2 photos d'atelier grand format.
- **Témoignages Clients (`#temoignages`)** :
  - Avis vérifiés de clients (Dakar, Diaspora Paris, Abidjan) avec étoiles dorées et photos de profil.
- **Bannière Finale & Footer Luxe** : Coordonnées directes, réseaux sociaux, liens de commande rapide.

---

### B. Dashboard Administrateur (`/admin/`)
Accessible via l'URL `/admin/` (avec routage hash `#overview`, `#products`, `#stocks`, `#orders`, `#accounting`, `#invoices`, `#customers`, `#testimonials`, `#about`, `#settings`, `#profile`).

1. **Vue d'ensemble (`#overview`)** : KPI en direct (Chiffre d'affaires, Commandes, Articles, Stock faible), graphique mensuel des ventes, raccourcis et dernières commandes.
2. **Gestion des Produits (`#products`) & Ajout (`#add-product`)** :
   - Formulaire complet : Nom, Catégorie (parmi les 4 collections), Prix (FCFA), Prix barré promo, Description, Tissu, Badges, Tailles disponibles et stock par taille.
   - **Compression d'images automatique** (`HTML5 Canvas`) : Les photos haute résolution prises par smartphone/appareil photo sont compressées automatiquement à ~80 Ko pour éviter toute saturation du stockage (`QuotaExceededError`).
3. **Gestion des Stocks (`#stocks`)** : Matrice de disponibilité en temps réel par taille (XS, S, M, L, XL, XXL, XXXL, Sur-mesure) avec alertes de réapprovisionnement.
4. **Gestion des Commandes (`#orders`)** :
   - Menu latéral épuré menant directement à la table des commandes.
   - Onglets de filtrage par état (*Toutes*, *En attente*, *Confirmées*, *En préparation*, *Expédiées*, *Livrées*).
   - Fiche détaillée de commande avec statut modifiable et bouton de contact client WhatsApp direct.
5. **Comptabilité & Finance (`#accounting`)** :
   - **4 Cartes KPI Financiers** : Recettes Totales, Dépenses Totales, Bénéfice Net (avec marge en %), Factures Impayées.
   - **Graphique d'Évolution Mensuelle** : Barres interactives (Recettes en Or, Dépenses en Bronze, Bénéfice en Émeraude).
   - **Graphique Donut des Dépenses par Catégorie** (*Équipement & Atelier*, *Tissus & Bazin*, *Transport & Logistique*, *Divers*).
   - **Journal des Dépenses** avec formulaire d'ajout popup et **Export Excel / CSV** en un clic.
   - Bouton doré standardisé `btn-primary`.
6. **Facturation & Devis (`#invoices` & `#create-invoice`)** :
   - Création de factures et devis avec ajout dynamique de lignes, calcul automatique de TVA/remise/livraison.
   - **Aperçu A4 Noir & Or Haute Définition** : Fond noir luxe, logo Frère Mixage, typographie noble, prêt à imprimer ou exporter en PDF.
   - Création automatique du client dans la base lors de l'émission d'une facture.
7. **Gestion des Clients (`#customers`)** : Répertoire complet des clients (Nom, Téléphone, Email, Adresse, Total commandé).
8. **Témoignages Clients (`#testimonials`)** : Ajout, modification, note sur 5 étoiles et bascule d'activation sur le site.
9. **Éditeur des Coulisses & À Propos (`#about`)** :
   - Modification en direct de l'histoire, de la citation, des badges de savoir-faire et des **2 photos de l'atelier** (upload avec prévisualisation).
10. **Profil & Paramètres (`#profile` & `#settings`)** :
    - Changement de nom d'administrateur, rôle, numéro de téléphone et **photo de profil** personnalisée.
    - Paramètres généraux de la boutique (frais de livraison Dakar / Régions, message de bannière).

---

## 🔄 6. SYNCHRONISATION DES DONNÉES (DATA ARCHITECTURE)

- **Clé de stockage LocalStorage principale** : `'frere_mixage_admin_state_v3'` (avec mécanismes de fallback vers v2 et v1).
- **Communication en temps réel** : Les modifications faites dans le Dashboard (`admin/js/dashboard.js`) émettent un événement `window.dispatchEvent(new Event('storage'))` et sont synchronisées instantanément sur la vitrine publique (`assets/js/app.js` -> `syncDynamicContent()`).
- **Préparation Supabase** : Des migrations et configurations RLS sont prêtes dans le dossier `/supabase/` pour brancher une base PostgreSQL distante dès que nécessaire.

---

## 📁 7. STRUCTURE DÉTAILLÉE DES FICHIERS

```text
frere-mixage/
├── index.html                     # Vitrine publique officielle
├── package.json                   # Configuration Vite & dépendances
├── vite.config.js                 # Configuration du build multi-pages (Vite MPA)
├── vercel.json                    # Configuration du déploiement Vercel & réécritures
├── server.ps1                     # Serveur local PowerShell stable (port 5173)
├── GEMINI.md                      # Fiche maîtresse du projet (ce fichier)
│
├── admin/                         # Module Dashboard Administrateur
│   ├── index.html                 # Interface unique SPA du Dashboard
│   ├── css/
│   │   └── dashboard.css          # Design System Admin (Noir, Or, KPI, Tables, A4)
│   └── js/
│       ├── dashboard.js           # Contrôleur JS Admin (Routage, CRUD, Comptabilité, Charts)
│       └── mock-data.js           # Jeu de données d'initialisation complet
│
├── assets/                        # Ressources de la Vitrine Publique
│   ├── css/
│   │   ├── variables.css          # Variables CSS Design System (Or, Noir, Espacements)
│   │   ├── base.css               # Typographie & styles globaux
│   │   ├── header.css             # Navigation & Logo
│   │   ├── hero.css               # Hero Section & Bouton Play TikTok
│   │   ├── collections.css        # Section des 4 Collections
│   │   ├── products.css           # Grille du catalogue & filtres
│   │   ├── storytelling.css       # Les Coulisses de la Maison
│   │   ├── testimonials.css       # Avis clients
│   │   ├── modals.css             # Modales de commande produit
│   │   ├── footer.css             # Pied de page
│   │   └── animations.css         # Animations luxueuses & scintillement
│   ├── js/
│   │   ├── app.js                 # Script principal vitrine & sync dynamique
│   │   ├── products.js            # Définition du catalogue & des 4 collections
│   │   ├── components/
│   │   │   ├── catalog.js         # Rendu du catalogue & cartes
│   │   │   └── modal.js           # Gestion de la modale de commande
│   │   └── services/
│   │       ├── whatsapp.js        # Formateur de messages de commande WhatsApp
│   │       └── supabase-client.js # Client Supabase optionnel
│   └── images/                    # Logos, visuels héros et photos atelier
│
└── supabase/                      # Scripts de base de données PostgreSQL
    ├── migrations/                # Schémas SQL, RLS policies et Storage
    └── seed/                      # Script de migration des produits
```

---

## 🛠️ 8. INSTRUCTIONS POUR LES FUTURS MODÈLES D'IA

Lorsque vous reprenez le travail sur ce projet :
1. **Toujours saluer l'utilisateur avec `Salam Mastü !`**.
2. **Conserver l'harmonie des 4 Collections** : `traditionnel`, `costumes`, `modernes`, `evenementiel`.
3. **Respecter la charte graphique** : Dégradé doré `#C6A868` à `#D4AF37`, fond noir `#0A0A0C` / `#121216`, boutons `btn-primary` avec dégradé or.
4. **Toujours compresser les images avant enregistrement** dans le `localStorage` pour préserver le quota navigateur.
5. **Maintenir la compatibilité Vercel** : Conserver `rollupOptions.input` dans `vite.config.js` et les règles de réécriture dans `vercel.json` pour que le déploiement multi-pages fonctionne sans erreur.
