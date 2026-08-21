import { WhatsAppService } from '../services/whatsapp.js';

/**
 * Initialisation du CTA Flottant WhatsApp
 */
export function initFloatingCTA() {
  const floatingBtn = document.getElementById('floating-whatsapp-btn');
  if (!floatingBtn) return;

  floatingBtn.addEventListener('click', (e) => {
    e.preventDefault();
    WhatsAppService.openGeneralChat();
  });
}
