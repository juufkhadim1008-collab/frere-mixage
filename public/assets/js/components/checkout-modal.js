import { CONFIG } from '../config.js';
import { formatPrice } from '../products.js';
import { OrderService } from '../services/order-service.js';
import { PaymentService } from '../services/payment-service.js';
import { WhatsAppService } from '../services/whatsapp.js';

let orderState = {
  product: null,
  size: null,
  quantity: 1,
  delivery: CONFIG.deliveryOptions[0],
  currentStep: 1,
  customer: {
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: 'Dakar',
    notes: ''
  },
  paymentMethod: 'wave',
  paymentProof: {
    senderPhone: '',
    txRef: ''
  }
};

/**
 * Ouvre le tunnel de commande avec le produit sélectionné
 */
export function openCheckoutWithProduct(product, size, quantity = 1) {
  orderState.product = product;
  orderState.size = size;
  orderState.quantity = quantity;
  orderState.currentStep = 1;
  orderState.delivery = CONFIG.deliveryOptions[0];

  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  renderCheckoutSummary();
  updateCheckoutStepUI(1);

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function renderCheckoutSummary() {
  if (!orderState.product) return;

  const itemWrap = document.getElementById('chk-summary-item');
  if (itemWrap) {
    itemWrap.innerHTML = `
      <img src="${orderState.product.images[0]}" alt="${orderState.product.name}" class="summary-img" />
      <div class="summary-info">
        <h4 class="summary-title">${orderState.product.name}</h4>
        <div class="summary-meta-badge">
          <span class="badge badge-gold">Taille : ${orderState.size}</span>
          <span>•</span>
          <span>Qté : ${orderState.quantity}</span>
        </div>
        <div class="summary-price-line">
          ${formatPrice(orderState.product.price)} / unité
        </div>
      </div>
    `;
  }

  // Remplissage du sélecteur de livraison
  const deliverySelect = document.getElementById('chk-delivery-select');
  if (deliverySelect) {
    deliverySelect.innerHTML = CONFIG.deliveryOptions.map(opt => `
      <option value="${opt.id}" ${opt.id === orderState.delivery.id ? 'selected' : ''}>
        ${opt.name} — ${opt.price > 0 ? formatPrice(opt.price) : 'Gratuit'}
      </option>
    `).join('');

    deliverySelect.onchange = (e) => {
      const selected = CONFIG.deliveryOptions.find(o => o.id === e.target.value);
      if (selected) {
        orderState.delivery = selected;
        updateTotalsTable();
        updatePaymentDetailsPanel();
      }
    };
  }

  updateTotalsTable();
}

function getGrandTotal() {
  if (!orderState.product) return 0;
  const subtotal = orderState.product.price * orderState.quantity;
  const deliveryFee = orderState.delivery ? orderState.delivery.price : 0;
  return subtotal + deliveryFee;
}

function updateTotalsTable() {
  if (!orderState.product) return;

  const subtotal = orderState.product.price * orderState.quantity;
  const deliveryFee = orderState.delivery.price;
  const grandTotal = subtotal + deliveryFee;

  const subtotalEl = document.getElementById('chk-subtotal-val');
  const deliveryEl = document.getElementById('chk-delivery-val');
  const grandTotalEl = document.getElementById('chk-grandtotal-val');

  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (deliveryEl) deliveryEl.textContent = deliveryFee > 0 ? formatPrice(deliveryFee) : 'Offerte';
  if (grandTotalEl) grandTotalEl.textContent = formatPrice(grandTotal);
}

/**
 * Met à jour le panneau d'instructions selon Wave ou Orange Money
 */
function updatePaymentDetailsPanel() {
  const method = orderState.paymentMethod || 'wave';
  const grandTotal = getGrandTotal();
  const gateway = CONFIG.paymentGateways[method] || CONFIG.paymentGateways.wave;

  // Montant à payer
  const amountEl = document.getElementById('pay-instructions-amount');
  if (amountEl) amountEl.textContent = formatPrice(grandTotal);

  // Numéro et libellé
  const iconEl = document.getElementById('merchant-method-icon');
  const labelEl = document.getElementById('merchant-account-label');
  const phoneEl = document.getElementById('merchant-account-phone');
  const waveDirectBtn = document.getElementById('btn-wave-direct-action');
  const omUssdBox = document.getElementById('om-ussd-info');
  const omUssdCode = document.getElementById('om-ussd-code');

  if (iconEl) {
    iconEl.innerHTML = method === 'wave'
      ? `<img src="./assets/images/wave-logo.jpg" alt="Wave" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;" />`
      : `<img src="./assets/images/orange-money-logo.png" alt="Orange Money" style="width:100%; height:100%; object-fit:cover; border-radius:inherit;" />`;
  }
  if (labelEl) labelEl.textContent = `Numéro ${gateway.name} officiel :`;
  if (phoneEl) phoneEl.textContent = gateway.accountNumber || '+221 78 634 76 66';

  if (method === 'wave') {
    if (waveDirectBtn) {
      waveDirectBtn.style.display = 'flex';
      waveDirectBtn.href = PaymentService.getWaveDirectPaymentUrl(grandTotal);
    }
    if (omUssdBox) omUssdBox.style.display = 'none';
  } else {
    if (waveDirectBtn) waveDirectBtn.style.display = 'none';
    if (omUssdBox) {
      omUssdBox.style.display = 'block';
      if (omUssdCode) omUssdCode.textContent = PaymentService.getOrangeMoneyUSSD(grandTotal);
    }
  }

  // Pré-remplir le numéro émetteur si vide avec le téléphone du client
  const senderPhoneInput = document.getElementById('pay-sender-phone');
  if (senderPhoneInput && !senderPhoneInput.value && orderState.customer.phone) {
    senderPhoneInput.value = orderState.customer.phone;
  }
}

function updateCheckoutStepUI(step) {
  orderState.currentStep = step;

  // Mise à jour des indicateurs d'étapes (1, 2, 3)
  for (let i = 1; i <= 3; i++) {
    const indicator = document.getElementById(`step-ind-${i}`);
    const panel = document.getElementById(`step-panel-${i}`);

    if (indicator) {
      indicator.classList.remove('active', 'completed');
      if (i === step) indicator.classList.add('active');
      else if (i < step) indicator.classList.add('completed');
    }

    if (panel) {
      if (i === step) panel.classList.add('active');
      else panel.classList.remove('active');
    }
  }

  if (step === 3) {
    updatePaymentDetailsPanel();
  }
}

/**
 * Validation des champs de coordonnées de l'Étape 2
 */
function validateCustomerForm() {
  let isValid = true;

  const firstName = document.getElementById('cust-firstname');
  const lastName = document.getElementById('cust-lastname');
  const phone = document.getElementById('cust-phone');
  const address = document.getElementById('cust-address');

  // Prénom
  if (!firstName || !firstName.value.trim()) {
    firstName?.classList.add('error');
    isValid = false;
  } else {
    firstName.classList.remove('error');
    orderState.customer.firstName = firstName.value.trim();
  }

  // Nom
  if (!lastName || !lastName.value.trim()) {
    lastName?.classList.add('error');
    isValid = false;
  } else {
    lastName.classList.remove('error');
    orderState.customer.lastName = lastName.value.trim();
  }

  // Téléphone (obligatoire)
  const phoneVal = phone ? phone.value.trim() : '';
  if (!phoneVal || phoneVal.length < 8) {
    phone?.classList.add('error');
    isValid = false;
  } else {
    phone?.classList.remove('error');
    orderState.customer.phone = phoneVal;
  }

  // Adresse
  if (!address || !address.value.trim()) {
    address?.classList.add('error');
    isValid = false;
  } else {
    address.classList.remove('error');
    orderState.customer.address = address.value.trim();
  }

  const cityInput = document.getElementById('cust-city');
  if (cityInput) orderState.customer.city = cityInput.value.trim() || 'Dakar';

  const notesInput = document.getElementById('cust-notes');
  if (notesInput) orderState.customer.notes = notesInput.value.trim();

  return isValid;
}

/**
 * Validation stricte du paiement de l'Étape 3
 */
function validatePaymentForm() {
  const senderPhoneInput = document.getElementById('pay-sender-phone');
  const txRefInput = document.getElementById('pay-tx-ref');
  const errorAlert = document.getElementById('pay-error-alert');

  let isValid = true;
  let errorMsg = '';

  const senderPhone = senderPhoneInput ? senderPhoneInput.value.trim() : '';
  const txRef = txRefInput ? txRefInput.value.trim() : '';

  if (!senderPhone || senderPhone.length < 8) {
    senderPhoneInput?.classList.add('error');
    isValid = false;
    errorMsg = 'Veuillez saisir le numéro de téléphone utilisé pour effectuer le paiement.';
  } else {
    senderPhoneInput?.classList.remove('error');
    orderState.paymentProof.senderPhone = senderPhone;
  }

  if (!txRef || txRef.length < 3) {
    txRefInput?.classList.add('error');
    isValid = false;
    if (!errorMsg) {
      errorMsg = 'Veuillez renseigner la référence de transaction ou le message SMS de confirmation de transfert.';
    }
  } else {
    txRefInput?.classList.remove('error');
    orderState.paymentProof.txRef = txRef;
  }

  if (!isValid) {
    if (errorAlert) {
      errorAlert.textContent = `⚠️ ${errorMsg}`;
      errorAlert.style.display = 'block';
    }
  } else {
    if (errorAlert) errorAlert.style.display = 'none';
  }

  return isValid;
}

/**
 * Initialisation des gestionnaires d'événements du Checkout
 */
export function initCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  const closeBtn = document.getElementById('chk-close-btn');

  // Boutons de navigation
  const btnToStep2 = document.getElementById('btn-to-step-2');
  const btnBackTo1 = document.getElementById('btn-back-to-1');
  const btnToStep3 = document.getElementById('btn-to-step-3');
  const btnBackTo2 = document.getElementById('btn-back-to-2');
  const btnSubmitOrder = document.getElementById('btn-submit-order');

  // Bouton copie numéro marchand
  const btnCopyMerchant = document.getElementById('btn-copy-merchant-phone');
  if (btnCopyMerchant) {
    btnCopyMerchant.addEventListener('click', () => {
      const phoneText = document.getElementById('merchant-account-phone')?.textContent || '+221 78 634 76 66';
      navigator.clipboard.writeText(phoneText.replace(/\s+/g, '')).then(() => {
        btnCopyMerchant.textContent = '✓ Copié !';
        setTimeout(() => {
          btnCopyMerchant.textContent = '📋 Copier';
        }, 2000);
      });
    });
  }

  // Bouton Wave direct (copie numéro + ouverture Wave)
  const btnWaveDirect = document.getElementById('btn-wave-direct-action');
  if (btnWaveDirect) {
    btnWaveDirect.addEventListener('click', () => {
      const phoneText = '786347666';
      navigator.clipboard.writeText(phoneText).then(() => {
        const origText = btnWaveDirect.innerHTML;
        btnWaveDirect.innerHTML = '✓ Numéro Wave copié (78 634 76 66) !';
        setTimeout(() => {
          btnWaveDirect.innerHTML = origText;
        }, 3000);
      });

      // Si appareil mobile, tenter de lancer directement l'application Wave
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = 'wave://';
      }
    });
  }

  // Bouton copie syntaxe USSD Orange Money
  const btnOmUssd = document.getElementById('btn-om-copy-ussd');
  if (btnOmUssd) {
    btnOmUssd.addEventListener('click', () => {
      const codeText = document.getElementById('om-ussd-code')?.textContent || '#144#391*786347666#';
      navigator.clipboard.writeText(codeText.trim()).then(() => {
        const strongEl = document.getElementById('om-ussd-code');
        if (strongEl) {
          const orig = strongEl.textContent;
          strongEl.textContent = '✓ Code USSD copié !';
          setTimeout(() => { strongEl.textContent = orig; }, 2500);
        }
      });
    });
  }

  if (!modal) return;

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  closeBtn?.addEventListener('click', closeModal);

  // Navigation Étape 1 -> Étape 2
  btnToStep2?.addEventListener('click', () => {
    updateCheckoutStepUI(2);
  });

  // Navigation Étape 2 -> Étape 1
  btnBackTo1?.addEventListener('click', () => {
    updateCheckoutStepUI(1);
  });

  // Navigation Étape 2 -> Étape 3 (avec validation formulaire)
  btnToStep3?.addEventListener('click', () => {
    if (validateCustomerForm()) {
      updateCheckoutStepUI(3);
    }
  });

  // Navigation Étape 3 -> Étape 2
  btnBackTo2?.addEventListener('click', () => {
    updateCheckoutStepUI(2);
  });

  // Sélection du moyen de paiement (Wave Sénégal ou Orange Money uniquement)
  const paymentCards = document.querySelectorAll('.payment-method-card');
  paymentCards.forEach(card => {
    card.addEventListener('click', () => {
      paymentCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      orderState.paymentMethod = card.dataset.method || 'wave';
      updatePaymentDetailsPanel();
    });
  });

  // Soumission finale de la commande & Paiement
  btnSubmitOrder?.addEventListener('click', async () => {
    // 1. Contrôle strict : Aucun validation de commande sans paiement renseigné sur le numéro
    if (!validatePaymentForm()) {
      return;
    }

    btnSubmitOrder.disabled = true;
    const originalText = btnSubmitOrder.innerHTML;
    btnSubmitOrder.innerHTML = `<span class="spinner"></span> Validation & Enregistrement...`;

    try {
      const grandTotal = getGrandTotal();
      const fullName = `${orderState.customer.firstName || ''} ${orderState.customer.lastName || ''}`.trim() || 'Client Frère Mixage';
      const methodLabel = orderState.paymentMethod === 'wave' ? 'Wave Sénégal' : 'Orange Money Sénégal';
      
      // 2. Création atomique de la commande (Supabase + LocalStorage synchronisé)
      const serverResult = await OrderService.createOrderAtomic({
        customerName: fullName,
        customerPhone: orderState.customer.phone,
        customerEmail: orderState.customer.email || null,
        deliveryAddress: orderState.customer.address || 'Dakar',
        deliveryCity: orderState.customer.city || 'Dakar',
        paymentMethod: methodLabel,
        senderPhone: orderState.paymentProof.senderPhone,
        txRef: orderState.paymentProof.txRef,
        totalAmount: grandTotal,
        notes: orderState.customer.notes || null,
        items: [{
          productId: orderState.product?.dbId || null,
          productSlug: orderState.product?.id,
          productName: orderState.product?.name,
          size: orderState.size,
          quantity: orderState.quantity,
          unitPrice: orderState.product?.price || 0
        }]
      });

      const order = {
        orderNumber: serverResult.order_number,
        id: serverResult.order_id,
        customer: orderState.customer,
        product: orderState.product,
        size: orderState.size,
        quantity: orderState.quantity,
        delivery: orderState.delivery,
        totalAmount: grandTotal,
        payment: {
          method: orderState.paymentMethod,
          methodLabel,
          senderPhone: orderState.paymentProof.senderPhone,
          txRef: orderState.paymentProof.txRef
        }
      };

      // 3. Envoi automatique du message WhatsApp avec TOUTES les informations de commande
      try {
        WhatsAppService.openPaymentConfirmationChat(order);
      } catch (waErr) {
        console.warn('[CheckoutModal] Envoi WhatsApp auto :', waErr);
      }

      // 4. Fermeture du tunnel & Affichage de la confirmation de commande et du reçu
      closeModal();
      showConfirmationModal(order);
    } catch (error) {
      alert(error.message || 'Une erreur est survenue lors de la validation du paiement. Veuillez réessayer.');
      console.error('[CheckoutModal] Erreur création commande :', error);
    } finally {
      btnSubmitOrder.disabled = false;
      btnSubmitOrder.innerHTML = originalText;
    }
  });
}

/**
 * Affiche l'écran de confirmation et reçu de commande
 */
export function showConfirmationModal(order) {
  const confirmModal = document.getElementById('confirmation-modal');
  if (!confirmModal) return;

  // Numéro de commande
  const orderIdEl = document.getElementById('conf-order-id');
  if (orderIdEl) orderIdEl.textContent = order.orderNumber;

  // Message de remerciement personnalisé
  const thankEl = document.getElementById('conf-thank-msg');
  if (thankEl) {
    thankEl.textContent = `Merci ${order.customer.firstName}, votre paiement a été pris en compte et votre commande est validée !`;
  }

  // Reçu détaillé
  const receiptEl = document.getElementById('conf-receipt-box');
  if (receiptEl) {
    const paymentLabel = order.payment?.method === 'wave' ? 'Wave Sénégal ⚡' : 'Orange Money Sénégal 🟠';
    receiptEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:8px; border-bottom:1px solid rgba(197,160,89,0.2); padding-bottom:6px;">
        <strong style="color:var(--gold-light); font-size:0.95rem;">${order.product.name} (Taille ${order.size})</strong>
        <span style="color:var(--gold-light); font-weight:700; font-size:1rem;">${formatPrice(order.totalAmount)}</span>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:0.78rem; line-height:1.5;">
        <div><strong>Quantité :</strong> ${order.quantity}</div>
        <div><strong>Mode :</strong> <span style="color:var(--gold);">${paymentLabel}</span></div>
        <div><strong>Tél. Payeur :</strong> ${order.payment?.senderPhone || order.customer.phone}</div>
        <div><strong>Réf. Paiement :</strong> ${order.payment?.txRef || 'Validé'}</div>
        <div style="grid-column:1 / -1;"><strong>Livraison :</strong> ${order.customer.address}, ${order.customer.city} (${order.delivery?.name || 'Standard'})</div>
        <div style="grid-column:1 / -1;"><strong>Contact Client :</strong> ${order.customer.phone}</div>
      </div>
    `;
  }

  // Bouton de copie du numéro de commande
  const copyBtn = document.getElementById('btn-copy-order-id');
  if (copyBtn) {
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(order.orderNumber).then(() => {
        copyBtn.textContent = '✓ Copié !';
        setTimeout(() => { copyBtn.textContent = '📋 Copier'; }, 2000);
      });
    };
  }

  // Bouton WhatsApp de suivi & transmission
  const waFollowBtn = document.getElementById('conf-btn-whatsapp');
  if (waFollowBtn) {
    waFollowBtn.onclick = () => {
      WhatsAppService.openPaymentConfirmationChat(order);
    };
  }

  // Bouton Continuer mes achats
  const continueBtn = document.getElementById('conf-btn-continue');
  if (continueBtn) {
    continueBtn.onclick = () => {
      confirmModal.classList.remove('active');
      document.body.style.overflow = '';
    };
  }

  confirmModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
