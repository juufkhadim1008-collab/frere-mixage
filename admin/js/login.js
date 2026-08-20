import { AuthService } from '../../assets/js/services/auth-service.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('admin-login-form');
  const phoneInput = document.getElementById('input-phone');
  const passwordInput = document.getElementById('input-password');
  const submitBtn = document.getElementById('btn-login-submit');
  const errorBox = document.getElementById('login-error-box');
  const errorText = document.getElementById('login-error-text');
  const forgotLink = document.getElementById('link-forgot-password');

  // Vérifier si déjà connecté
  AuthService.getSession().then(session => {
    if (session) {
      window.location.href = './index.html';
    }
  });

  // Formatage automatique en direct du numéro sénégalais
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let val = e.target.value;
      if (val.startsWith('7') && val.length === 9) {
        e.target.value = `+221 ${val.slice(0, 2)} ${val.slice(2, 5)} ${val.slice(5, 7)} ${val.slice(7, 9)}`;
      }
    });
  }

  // Soumission du formulaire
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (errorBox) errorBox.style.display = 'none';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Vérification en cours...</span>`;
      }

      try {
        const phone = phoneInput.value.trim();
        const password = passwordInput.value;

        await AuthService.loginWithPhone(phone, password);
        
        // Redirection vers le dashboard
        window.location.href = './index.html';
      } catch (err) {
        if (errorText) errorText.textContent = err.message || 'Échec de la connexion.';
        if (errorBox) errorBox.style.display = 'flex';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span>Se connecter</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          `;
        }
      }
    });
  }

  // Mot de passe oublié
  if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      alert("Pour réinitialiser votre mot de passe, veuillez contacter le Propriétaire de la Maison Frère Mixage.");
    });
  }
});
