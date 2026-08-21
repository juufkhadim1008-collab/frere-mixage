import { CONFIG } from '../config.js';

/**
 * Gestionnaire du Guide des Tailles
 */
export function openSizeGuideModal() {
  const modal = document.getElementById('size-guide-modal');
  if (!modal) return;

  const tableBody = document.getElementById('size-guide-table-body');
  if (tableBody) {
    tableBody.innerHTML = CONFIG.sizeChart.map(row => `
      <tr>
        <td><strong>${row.size}</strong></td>
        <td>${row.chest}</td>
        <td>${row.waist}</td>
        <td>${row.shoulder}</td>
        <td>${row.height}</td>
      </tr>
    `).join('');
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

export function initSizeGuide() {
  const modal = document.getElementById('size-guide-modal');
  const closeBtn = document.getElementById('size-guide-close-btn');

  if (!modal) return;

  const closeModal = () => {
    modal.classList.remove('active');
    // Ne pas débloquer overflow si la modale produit est encore ouverte en dessous
    const productModal = document.getElementById('product-modal');
    if (!productModal || !productModal.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  };

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}
