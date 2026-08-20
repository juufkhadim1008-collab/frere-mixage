import { initHeader } from './components/header.js';
import { initCatalog } from './components/catalog.js';
import { initProductModal, openProductModal } from './components/product-modal.js';
import { initCheckoutModal } from './components/checkout-modal.js';
import { initSizeGuide } from './components/size-guide.js';
import { initFloatingCTA } from './components/floating-cta.js';
import { WhatsAppService } from './services/whatsapp.js';

/**
 * Initialisation principale de l'application FRÈRE MIXAGE
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialisation des composants interactifs
  initHeader();
  initCatalog();
  initProductModal();
  initCheckoutModal();
  initSizeGuide();
  initFloatingCTA();

  // 2. Synchronisation du contenu dynamique depuis le Dashboard (Témoignages, À Propos, Contacts)
  syncDynamicContent();

  // 3. Gestion des CTAs Hero et Raccourcis
  setupGlobalActions();

  // 4. Initialisation des observateurs de défilement pour les animations fluides
  initScrollReveals();

  // 5. Écoute des mises à jour en direct depuis l'admin dans un autre onglet
  window.addEventListener('storage', () => {
    initCatalog();
    syncDynamicContent();
  });
});

/**
 * Synchronise les contenus éditables (Témoignages, À Propos, Paramètres) depuis le Dashboard
 */
export function syncDynamicContent() {
  try {
    const raw = localStorage.getItem('frere_mixage_admin_state_v3') || 
                localStorage.getItem('frere_mixage_admin_state_v2') || 
                localStorage.getItem('frere_mixage_admin_state_v1');
    if (!raw) return;
    const state = JSON.parse(raw);

    // 1. Mise à jour des Témoignages (toujours visibles et animés)
    const testimonialsGrid = document.querySelector('.testimonials-grid');
    if (testimonialsGrid) {
      const testimonialsList = (state.testimonials && state.testimonials.length > 0) 
        ? state.testimonials.filter(t => t.isActive !== false)
        : [
            {
              name: 'Cheikh Diop',
              role: 'Dakar, Sénégal • Client vérifié',
              rating: 5,
              quote: 'Une finition incroyable et une tenue qui correspond exactement à ce que je voulais pour mon mariage. Le tissu a un tombé royal.',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
            },
            {
              name: 'Mamadou Sy',
              role: 'Paris, France • Diaspora',
              rating: 5,
              quote: 'Le boubou Royal est magnifique. La qualité de la broderie et la finesse du fil d’or sont vraiment au rendez-vous. Livraison rapide à Paris.',
              avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150'
            },
            {
              name: 'Abdoulaye Ndiaye',
              role: 'Abidjan, Côte d’Ivoire • Client vérifié',
              rating: 5,
              quote: 'Service sur mesure exceptionnel. J’ai envoyé mes mesures en ligne et le costume tombait parfaitement dès le premier essayage.',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
            }
          ];

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
              <img src="${t.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'}"
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

    // 2. Mise à jour de la section À Propos & Coulisses de l'Atelier
    if (state.about) {
      const whyTitle = document.querySelector('#pourquoi .section-title');
      if (whyTitle && state.about.sectionTitle) whyTitle.textContent = state.about.sectionTitle;

      const whySubtitle = document.querySelector('#pourquoi .section-subtitle');
      if (whySubtitle && state.about.sectionSubtitle) whySubtitle.textContent = state.about.sectionSubtitle;

      const quoteText = document.getElementById('atelier-quote-text');
      if (quoteText && state.about.quote) quoteText.textContent = state.about.quote;

      const quoteAuthor = document.getElementById('atelier-quote-author');
      if (quoteAuthor && state.about.quoteAuthor) quoteAuthor.textContent = state.about.quoteAuthor;

      const p1 = document.getElementById('atelier-story-p1');
      if (p1 && state.about.storyParagraph1) p1.textContent = state.about.storyParagraph1;

      const p2 = document.getElementById('atelier-story-p2');
      if (p2 && state.about.storyParagraph2) p2.textContent = state.about.storyParagraph2;

      // Badges Savoir-faire
      if (state.about.badges) {
        if (state.about.badges[0]) {
          const b1 = document.getElementById('atelier-badge-1');
          if (b1) b1.textContent = state.about.badges[0];
        }
        if (state.about.badges[1]) {
          const b2 = document.getElementById('atelier-badge-2');
          if (b2) b2.textContent = state.about.badges[1];
        }
        if (state.about.badges[2]) {
          const b3 = document.getElementById('atelier-badge-3');
          if (b3) b3.textContent = state.about.badges[2];
        }
      }

      // Photos Atelier (Les Coulisses)
      if (state.about.image1) {
        const img1 = document.getElementById('atelier-img-1');
        if (img1) img1.src = state.about.image1;
      }
      if (state.about.image2) {
        const img2 = document.getElementById('atelier-img-2');
        if (img2) img2.src = state.about.image2;
      }

      // Piliers
      if (state.about.pillars && state.about.pillars.length === 4) {
        const whyCards = document.querySelectorAll('.why-card');
        whyCards.forEach((card, index) => {
          const pillar = state.about.pillars[index];
          if (pillar) {
            const titleEl = card.querySelector('.why-title');
            const descEl = card.querySelector('.why-desc');
            if (titleEl) titleEl.textContent = pillar.title;
            if (descEl) descEl.textContent = pillar.desc;
          }
        });
      }
    }

    // 3. Mise à jour des coordonnées / contacts
    if (state.settings) {
      if (state.settings.phone) {
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
          link.setAttribute('href', `tel:${state.settings.phone.replace(/\s+/g, '')}`);
          link.textContent = state.settings.phone;
        });
      }
    }

    // 4. Mise à jour des images et titres d'aperçu des 4 collections
    if (state.products && state.products.length > 0) {
      document.querySelectorAll('.collection-card').forEach(card => {
        const catKey = card.dataset.category; // 'traditionnel', 'costumes', 'modernes', 'evenementiel'
        const imgEl = card.querySelector('img.collection-image');
        const titleEl = card.querySelector('.collection-title');
        const descEl = card.querySelector('.collection-desc');
        if (!imgEl || !catKey) return;

        // Vérifier si une catégorie a une image personnalisée ou des textes dans le dashboard
        const customCat = state.categories?.find(c => {
          const slug = (c.slug || '').toLowerCase();
          const name = (c.name || '').toLowerCase();
          return slug.includes(catKey) || name.includes(catKey) || 
                 (catKey === 'traditionnel' && (slug.includes('boubou') || name.includes('boubou') || slug.includes('tradition'))) ||
                 (catKey === 'evenementiel' && (slug.includes('evenement') || name.includes('evenement') || slug.includes('magal') || name.includes('magal')));
        });

        if (customCat) {
          if (titleEl && customCat.name) titleEl.textContent = customCat.name;
          if (descEl && customCat.description) descEl.textContent = customCat.description;
          if (customCat.image && customCat.image.trim()) {
            imgEl.src = customCat.image;
            return;
          }
        }

        // Sinon, trouver la dernière création publiée de cette catégorie
        const latestProd = state.products.find(p => {
          if (p.status !== 'published') return false;
          const pCat = (p.categorySlug || p.category || '').toLowerCase();
          if (catKey === 'traditionnel' && (pCat.includes('tradition') || pCat.includes('boubou'))) return true;
          if (catKey === 'costumes' && pCat.includes('costume')) return true;
          if (catKey === 'modernes' && (pCat.includes('ensemble') || pCat.includes('moderne') || pCat.includes('chemise') || pCat.includes('pantalon'))) return true;
          if (catKey === 'evenementiel' && (pCat.includes('evenement') || pCat.includes('magal') || pCat.includes('gamou') || pCat.includes('korite') || pCat.includes('fete'))) return true;
          return pCat.includes(catKey);
        });

        if (latestProd && latestProd.images && latestProd.images.length > 0) {
          imgEl.src = latestProd.images[0];
        }
      });
    }
  } catch (e) {
    console.warn('Erreur lors de la synchronisation dynamique du site public :', e);
  }
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
    bespokeBtn.addEventListener('click', () => {
      openProductModal('sur-mesure-haute-couture');
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
