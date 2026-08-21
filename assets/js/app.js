import { initHeader } from './components/header.js';
import { initCatalog } from './components/catalog.js';
import { initProductModal, openProductModal } from './components/product-modal.js';
import { initCheckoutModal } from './components/checkout-modal.js';
import { initSizeGuide } from './components/size-guide.js';
import { initFloatingCTA } from './components/floating-cta.js';
import { WhatsAppService } from './services/whatsapp.js';
import { ContentService } from './services/content-service.js';
import { getActiveProducts } from './products.js';

// Nettoyage immédiat et définitif de tout ancien cache contenant des images fictives Unsplash
try {
  localStorage.removeItem('fm_covers_cache_v1');
  localStorage.removeItem('fm_covers_cache_v2');
  ['frere_mixage_admin_state_v1', 'frere_mixage_admin_state_v2', 'frere_mixage_admin_state_v3', 'frere_mixage_admin_state_v4'].forEach(k => {
    const val = localStorage.getItem(k);
    if (val && (val.includes('unsplash') || val.includes('1617137984095-74e4e5e3613f'))) {
      localStorage.removeItem(k);
    }
  });
} catch (e) {}

/**
 * Initialisation principale de l'application FRÈRE MIXAGE
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialisation des composants interactifs & Couvertures instantanées 0ms
  initHeader();
  updateCollectionCovers(getActiveProducts());
  initCatalog();
  initProductModal();
  initCheckoutModal();
  initSizeGuide();
  initFloatingCTA();

  // 2. Synchronisation du contenu dynamique depuis Supabase & le Dashboard (Témoignages, À Propos, Contacts)
  syncDynamicContent();

  // 3. Gestion des CTAs Hero et Raccourcis
  setupGlobalActions();

  // 4. Initialisation des observateurs de défilement pour les animations fluides
  initScrollReveals();

  // 5. Écoute des mises à jour en direct depuis Supabase et l'admin (BroadcastChannel & Storage)
  try {
    const channel = new BroadcastChannel('frere_mixage_sync');
    channel.onmessage = (event) => {
      if (event.data?.type === 'STATE_UPDATED') {
        initCatalog();
        syncDynamicContent();
      }
    };
  } catch (e) {}

  window.addEventListener('storage', () => {
    initCatalog();
    syncDynamicContent();
  });

  window.addEventListener('supabase-products-synced', (e) => {
    updateCollectionCovers(e.detail);
  });
});

/**
 * Synchronise les contenus éditables (Témoignages, À Propos, Paramètres) depuis Supabase Cloud
 */
export async function syncDynamicContent() {
  try {
    let state = {};
    try {
      const raw = localStorage.getItem('frere_mixage_admin_state_v9');
      if (raw) state = JSON.parse(raw);
    } catch (e) {}

    // 1. Chargement et rendu des témoignages depuis Supabase ou état local
    try {
      const remoteTestimonials = await ContentService.getPublicTestimonials();
      const testimonialsGrid = document.querySelector('.testimonials-grid');
      if (testimonialsGrid && remoteTestimonials && remoteTestimonials.length > 0) {
        testimonialsGrid.innerHTML = remoteTestimonials.map((t, idx) => {
          const stars = '★'.repeat(t.rating || 5);
          return `
            <div class="testimonial-card revealed stagger-${(idx % 3) + 1}">
              <div>
                <div class="testimonial-rating">${stars}</div>
                <p class="testimonial-quote">
                  « ${t.quote} »
                </p>
              </div>
              <div class="testimonial-author-box">
                <img src="${t.avatar_url || t.avatar || './assets/images/hero-frere-mixage.jpg'}"
                  alt="Client ${t.name}" class="testimonial-avatar" loading="lazy" />
                <div>
                  <div class="testimonial-name">${t.name}</div>
                  <div class="testimonial-role">${t.role}</div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      } else if (testimonialsGrid && state.testimonials && state.testimonials.length > 0) {
        const testimonialsList = state.testimonials.filter(t => t.isActive !== false);
        testimonialsGrid.innerHTML = testimonialsList.map((t, idx) => {
          const stars = '★'.repeat(t.rating || 5);
          return `
            <div class="testimonial-card revealed stagger-${(idx % 3) + 1}">
              <div>
                <div class="testimonial-rating">${stars}</div>
                <p class="testimonial-quote">
                  « ${t.quote} »
                </p>
              </div>
              <div class="testimonial-author-box">
                <img src="${t.avatar || './assets/images/hero-frere-mixage.jpg'}"
                  alt="Client ${t.name}" class="testimonial-avatar" loading="lazy" />
                <div>
                  <div class="testimonial-name">${t.name}</div>
                  <div class="testimonial-role">${t.role}</div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (e) {
      console.warn('[Sync] Testimonials live error:', e);
    }

    // 2. Chargement et rendu de l'Atelier / À Propos depuis Supabase ou état local
    try {
      const remoteAbout = await ContentService.getAboutContent();
      const about = remoteAbout || state.about;
      if (about) {
        const whyTitle = document.querySelector('#pourquoi .section-title');
        if (whyTitle && about.sectionTitle) whyTitle.textContent = about.sectionTitle;

        const whySubtitle = document.querySelector('#pourquoi .section-subtitle');
        if (whySubtitle && about.sectionSubtitle) whySubtitle.textContent = about.sectionSubtitle;

        const quoteText = document.getElementById('atelier-quote-text');
        if (quoteText && about.quote) quoteText.textContent = about.quote;

        const quoteAuthor = document.getElementById('atelier-quote-author');
        if (quoteAuthor && about.quoteAuthor) quoteAuthor.textContent = about.quoteAuthor;

        const p1 = document.getElementById('atelier-story-p1');
        if (p1 && about.storyParagraph1) p1.textContent = about.storyParagraph1;

        const p2 = document.getElementById('atelier-story-p2');
        if (p2 && about.storyParagraph2) p2.textContent = about.storyParagraph2;

        // Badges
        if (about.badges) {
          if (about.badges[0]) {
            const b1 = document.getElementById('atelier-badge-1');
            if (b1) b1.textContent = about.badges[0];
          }
          if (about.badges[1]) {
            const b2 = document.getElementById('atelier-badge-2');
            if (b2) b2.textContent = about.badges[1];
          }
          if (about.badges[2]) {
            const b3 = document.getElementById('atelier-badge-3');
            if (b3) b3.textContent = about.badges[2];
          }
        }

        // Photos
        if (about.image1) document.getElementById('atelier-img-1')?.setAttribute('src', about.image1);
        if (about.image2) document.getElementById('atelier-img-2')?.setAttribute('src', about.image2);

        // Piliers
        if (about.pillars && about.pillars.length === 4) {
          const whyCards = document.querySelectorAll('.why-card');
          whyCards.forEach((card, index) => {
            const pillar = about.pillars[index];
            if (pillar) {
              const titleEl = card.querySelector('.why-title');
              const descEl = card.querySelector('.why-desc');
              if (titleEl) titleEl.textContent = pillar.title;
              if (descEl) descEl.textContent = pillar.desc;
            }
          });
        }
      }
    } catch (e) {
      console.warn('[Sync] About live error:', e);
    }

    // 3. Mise à jour des coordonnées / contacts
    if (state.settings && state.settings.phone) {
      document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.setAttribute('href', `tel:${state.settings.phone.replace(/\s+/g, '')}`);
        link.textContent = state.settings.phone;
      });
    }

    // 4. Mise à jour des images et titres d'aperçu des 4 collections
    updateCollectionCovers(state.products);
  } catch (e) {
    console.warn('Erreur lors de la synchronisation dynamique du site public :', e);
  }
}

/**
 * Met à jour les 4 cartes de collections instantanément avec cache ultra-rapide
 */
export function updateCollectionCovers(products = null) {
  const currentProds = products || getActiveProducts();
  const defaultImages = {
    traditionnel: './assets/images/ab8459f150d5d7db346654de338434e5.jpg',
    costumes: './assets/images/hero-frere-mixage.jpg',
    modernes: './assets/images/ab8459f150d5d7db346654de338434e5.jpg',
    evenementiel: './assets/images/hero-frere-mixage.jpg'
  };

  let cachedCovers = {};
  try {
    const rawCache = localStorage.getItem('fm_covers_cache_v2');
    if (rawCache) {
      const parsed = JSON.parse(rawCache);
      // Supprimer les vieilles images Unsplash
      Object.keys(parsed).forEach(k => {
        if (parsed[k] && !parsed[k].includes('unsplash') && !parsed[k].includes('1617137984095')) {
          cachedCovers[k] = parsed[k];
        }
      });
    }
  } catch (e) {}

  const updatedCache = { ...cachedCovers };

  document.querySelectorAll('.collection-card').forEach(card => {
    const catKey = card.dataset.category;
    const imgEl = card.querySelector('img.collection-image');
    if (!imgEl || !catKey) return;

    let targetSrc = '';

    // Trouver la dernière création publiée de cette catégorie
    const latestProd = (currentProds || []).find(p => {
      if (p.status === 'draft') return false;
      const pCat = (p.categorySlug || p.category || '').toLowerCase();
      if (catKey === 'traditionnel' && (pCat.includes('tradition') || pCat.includes('boubou'))) return true;
      if (catKey === 'costumes' && pCat.includes('costume')) return true;
      if (catKey === 'modernes' && (pCat.includes('ensemble') || pCat.includes('moderne') || pCat.includes('chemise') || pCat.includes('pantalon'))) return true;
      if (catKey === 'evenementiel' && (pCat.includes('evenement') || pCat.includes('magal') || pCat.includes('gamou') || pCat.includes('korite') || pCat.includes('fete'))) return true;
      return pCat.includes(catKey);
    });

    if (latestProd && latestProd.images && latestProd.images.length > 0 && latestProd.images[0] && !latestProd.images[0].includes('unsplash') && !latestProd.images[0].includes('1617137984095')) {
      targetSrc = latestProd.images[0];
      updatedCache[catKey] = targetSrc;
    } else if (cachedCovers[catKey]) {
      targetSrc = cachedCovers[catKey];
    } else {
      targetSrc = defaultImages[catKey] || './assets/images/hero-frere-mixage.jpg';
      updatedCache[catKey] = targetSrc;
    }

    if (targetSrc && imgEl.src !== targetSrc && !imgEl.src.endsWith(targetSrc.replace(/^\.?\//, ''))) {
      imgEl.src = targetSrc;
    }
  });

  try {
    localStorage.setItem('fm_covers_cache_v2', JSON.stringify(updatedCache));
  } catch (e) {}
}

/**
 * Configuration des déclencheurs globaux (boutons collections, bannière finale, WhatsApp)
 */
function setupGlobalActions() {
  document.querySelectorAll('[data-cta="order-now"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const catalogSection = document.getElementById('pieces');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  document.querySelectorAll('.collection-card').forEach(card => {
    card.addEventListener('click', () => {
      const category = card.dataset.category;
      if (category) {
        const filterBtn = document.querySelector(`.filter-pill[data-category="${category}"]`);
        if (filterBtn) filterBtn.click();

        const catalogSection = document.getElementById('pieces');
        if (catalogSection) {
          catalogSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  const bespokeBtn = document.getElementById('btn-bespoke-cta');
  if (bespokeBtn) {
    bespokeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      WhatsAppService.openBespokeChat();
    });
  }

  const finalWaBtn = document.getElementById('btn-final-whatsapp');
  if (finalWaBtn) {
    finalWaBtn.addEventListener('click', () => {
      WhatsAppService.openGeneralChat();
    });
  }

  const finalOrderBtn = document.getElementById('btn-final-order');
  if (finalOrderBtn) {
    finalOrderBtn.addEventListener('click', () => {
      const catalogSection = document.getElementById('pieces');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/**
 * Observateur d'intersection pour les animations de défilement douces et luxueuses
 */
function initScrollReveals() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-scale');

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}
