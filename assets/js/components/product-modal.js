import { getProductById, formatPrice } from '../products.js';
import { WhatsAppService } from '../services/whatsapp.js';
import { openCheckoutWithProduct } from './checkout-modal.js';
import { openSizeGuideModal } from './size-guide.js';

let currentProduct = null;
let currentSize = null;
let currentQuantity = 1;

/**
 * Ouvre la fiche produit détaillée
 */
export function openProductModal(productId) {
  const product = getProductById(productId);
  if (!product) return;

  currentProduct = product;
  currentQuantity = 1;

  // Sélectionner la première taille disponible par défaut
  currentSize = product.availableSizes.length > 0 ? product.availableSizes[0] : null;

  const modal = document.getElementById('product-modal');
  if (!modal) return;

  // 1. Remplissage des éléments
  document.getElementById('pm-category').textContent = product.categoryLabel;
  document.getElementById('pm-leadtime').textContent = product.leadTime;
  document.getElementById('pm-title').textContent = product.name;
  document.getElementById('pm-price').textContent = formatPrice(product.price);
  document.getElementById('pm-fabric').textContent = product.fabric;
  document.getElementById('pm-description').textContent = product.description;

  // Détails de confection
  const detailsList = document.getElementById('pm-details-list');
  detailsList.innerHTML = product.details.map(d => `<li>${d}</li>`).join('');

  // Galerie photo
  const mainImg = document.getElementById('pm-main-img');
  mainImg.src = product.images[0];
  mainImg.alt = `${product.name} — Frère Mixage`;

  const thumbsWrap = document.getElementById('pm-thumbnails');
  thumbsWrap.innerHTML = product.images.map((img, idx) => `
    <div class="product-thumb ${idx === 0 ? 'active' : ''}" data-index="${idx}">
      <img src="${img}" alt="${product.name} vue ${idx + 1}" />
    </div>
  `).join('');

  thumbsWrap.querySelectorAll('.product-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbsWrap.querySelectorAll('.product-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      const idx = parseInt(thumb.dataset.index);
      mainImg.src = product.images[idx];
    });
  });

  // 2. Sélecteur de taille (uniquement tailles disponibles)
  renderSizeOptions();

  // 3. Sélecteur de quantité & Total
  updateQuantityDisplay();

  // 4. Affichage de la modale
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function renderSizeOptions() {
  const container = document.getElementById('pm-sizes-grid');
  if (!container || !currentProduct) return;

  // Liste de toutes les tailles standard pour affichage avec état désactivé si hors stock
  const standardSizes = currentProduct.category === 'sur-mesure' 
    ? ['Sur Mesure', 'S', 'M', 'L', 'XL', 'XXL']
    : ['S', 'M', 'L', 'XL', 'XXL'];

  container.innerHTML = standardSizes.map(size => {
    const isAvailable = currentProduct.availableSizes.includes(size);
    const isSelected = currentSize === size;
    const disabledAttr = isAvailable ? '' : 'disabled title="Taille actuellement épuisée pour cette pièce"';

    return `
      <button 
        type="button"
        class="size-option-btn ${isSelected ? 'selected' : ''}" 
        data-size="${size}"
        ${disabledAttr}
      >
        ${size}
      </button>
    `;
  }).join('');

  // Écouteurs de clic sur les tailles
  container.querySelectorAll('.size-option-btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.size-option-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentSize = btn.dataset.size;
    });
  });
}

function updateQuantityDisplay() {
  const qtyVal = document.getElementById('pm-quantity-value');
  const totalAmount = document.getElementById('pm-total-amount');
  
  if (qtyVal) qtyVal.textContent = currentQuantity;
  if (totalAmount && currentProduct) {
    totalAmount.textContent = formatPrice(currentProduct.price * currentQuantity);
  }
}

/**
 * Initialisation des événements de la modale produit
 */
export function initProductModal() {
  const modal = document.getElementById('product-modal');
  const closeBtn = document.getElementById('pm-close-btn');
  const btnDec = document.getElementById('pm-qty-decrement');
  const btnInc = document.getElementById('pm-qty-increment');
  const btnCheckout = document.getElementById('pm-btn-checkout');
  const btnWhatsapp = document.getElementById('pm-btn-whatsapp');
  const btnSizeGuide = document.getElementById('pm-size-guide-link');

  if (!modal) return;

  // Fermeture
  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Quantité Stepper
  btnDec?.addEventListener('click', () => {
    if (currentQuantity > 1) {
      currentQuantity--;
      updateQuantityDisplay();
    }
  });

  btnInc?.addEventListener('click', () => {
    if (currentQuantity < 10) {
      currentQuantity++;
      updateQuantityDisplay();
    }
  });

  // Guide des tailles
  btnSizeGuide?.addEventListener('click', (e) => {
    e.preventDefault();
    openSizeGuideModal();
  });

  // Action : Commander Maintenant (Lance le tunnel de commande sur le site)
  btnCheckout?.addEventListener('click', () => {
    if (!currentProduct) return;
    if (!currentSize) {
      alert('Veuillez sélectionner une taille pour votre tenue.');
      return;
    }
    closeModal();
    openCheckoutWithProduct(currentProduct, currentSize, currentQuantity);
  });

  // Action : Commander sur WhatsApp direct
  btnWhatsapp?.addEventListener('click', () => {
    if (!currentProduct) return;
    WhatsAppService.openOrderChat({
      product: currentProduct,
      size: currentSize,
      quantity: currentQuantity
    });
  });
}
