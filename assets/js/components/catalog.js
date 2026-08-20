import { getActiveCategories, formatPrice, getProductsByCategory } from '../products.js';
import { openProductModal } from './product-modal.js';
import { openCheckoutWithProduct } from './checkout-modal.js';

/**
 * Gestionnaire du catalogue de produits et des filtres
 */
export function initCatalog() {
  const filterContainer = document.getElementById('catalog-filter-bar');
  const productsGrid = document.getElementById('products-grid');

  if (!productsGrid) return;

  const categories = getActiveCategories();

  // 1. Rendu des boutons de filtre de catégories
  if (filterContainer) {
    filterContainer.innerHTML = categories.map((cat, index) => `
      <button 
        class="filter-pill ${index === 0 ? 'active' : ''}" 
        data-category="${cat.id}"
        aria-label="Filtrer par ${cat.label}"
      >
        ${cat.label}
        <span class="filter-pill-count">(${cat.count})</span>
      </button>
    `).join('');

    // Écouteurs de clic sur les filtres
    filterContainer.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        filterContainer.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const categoryId = btn.dataset.category;
        renderProducts(categoryId);
      });
    });
  }

  // 2. Rendu initial des produits
  renderProducts('all');

  function renderProducts(category) {
    const products = getProductsByCategory(category);
    
    if (products.length === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
          <p style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 1rem;">Aucune pièce dans cette catégorie pour le moment.</p>
          <button class="btn btn-secondary btn-sm" onclick="document.querySelector('.filter-pill[data-category=all]').click()">Voir toutes les créations</button>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = products.map((product, idx) => {
      const badgeHtml = product.badge ? `
        <div class="product-badge-container">
          <span class="badge ${product.badge === 'Bestseller' ? 'badge-gold' : 'badge-exclusive'}">
            ${product.badge}
          </span>
        </div>
      ` : '';

      const originalPriceHtml = product.originalPrice ? `
        <span class="product-original-price">${formatPrice(product.originalPrice)}</span>
      ` : '';

      const sizesPreviewHtml = product.availableSizes.map(s => `
        <span class="size-pill-mini">${s}</span>
      `).join('');

      return `
        <article class="product-card reveal-on-scroll stagger-${(idx % 3) + 1}" data-product-id="${product.id}">
          <div class="product-media">
            ${badgeHtml}
            <img 
              src="${product.images[0]}" 
              alt="${product.name} — Frère Mixage Haute Couture" 
              class="product-image"
              loading="lazy"
            />
            <div class="product-quick-view-overlay">
              <button class="btn-quick-preview" data-action="view" data-id="${product.id}">
                Voir la tenue
              </button>
            </div>
          </div>
          
          <div class="product-info">
            <div class="product-meta-row">
              <span class="product-category-tag">${product.categoryLabel}</span>
              <span class="product-availability">En stock</span>
            </div>
            
            <h3 class="product-title">${product.name}</h3>
            
            <div class="product-price-row">
              <span class="product-price">${formatPrice(product.price)}</span>
              ${originalPriceHtml}
            </div>

            <div class="product-sizes-preview">
              <span>Tailles :</span>
              ${sizesPreviewHtml}
            </div>

            <div class="product-card-actions">
              <button class="btn btn-secondary btn-card-view" data-action="view" data-id="${product.id}">
                Détails
              </button>
              <button class="btn btn-primary btn-card-order" data-action="order" data-id="${product.id}">
                Commander
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attacher les écouteurs sur les boutons produits
    attachProductEventListeners();

    // Réinitialiser les animations d'apparition
    initScrollObserverForElements(productsGrid.querySelectorAll('.reveal-on-scroll'));
  }

  function attachProductEventListeners() {
    productsGrid.querySelectorAll('[data-action="view"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openProductModal(id);
      });
    });

    productsGrid.querySelectorAll('[data-action="order"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        openProductModal(id); // Ouvre la fiche pour sélection taille garantie avant commande
      });
    });

    productsGrid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.productId;
        openProductModal(id);
      });
    });
  }
}

/**
 * Fonction utilitaire pour observer les éléments révélés au défilement
 */
function initScrollObserverForElements(elements) {
  if (!('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}
