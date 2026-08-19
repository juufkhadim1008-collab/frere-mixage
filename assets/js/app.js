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

  // 2. Gestion des CTAs Hero et Raccourcis
  setupGlobalActions();

  // 3. Initialisation des observateurs de défilement pour les animations fluides
  initScrollReveals();
});

/**
 * Configuration des déclencheurs globaux (boutons collections, bannière finale, WhatsApp)
 */
function setupGlobalActions() {
  // Boutons Commander dans le header et hero
  document.querySelectorAll('[data-cta="order-now"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Ouvre directement la pièce maîtresse ou défile vers le catalogue
      const catalogSection = document.getElementById('pieces');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Clic sur les cartes de catégories de collections -> filtre automatique
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

  // Bouton création sur-mesure dans la section Savoir-Faire
  const bespokeBtn = document.getElementById('btn-bespoke-cta');
  if (bespokeBtn) {
    bespokeBtn.addEventListener('click', () => {
      openProductModal('sur-mesure-haute-couture');
    });
  }

  // Bouton WhatsApp de la bannière finale
  const finalWaBtn = document.getElementById('btn-final-whatsapp');
  if (finalWaBtn) {
    finalWaBtn.addEventListener('click', () => {
      WhatsAppService.openGeneralChat();
    });
  }

  // Bouton Commander de la bannière finale
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
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => observer.observe(el));
}
