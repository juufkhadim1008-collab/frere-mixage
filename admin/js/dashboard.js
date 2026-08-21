/**
 * FRÈRE MIXAGE — Moteur du Dashboard Administrateur (Vanilla JS)
 * Gestion d'état locale, routage SPA, Factures & Devis avec live preview, et interactions riches.
 */

import { INITIAL_DATA } from './mock-data.js';
import { ProductService } from '/assets/js/services/product-service.js';
import { OrderService } from '/assets/js/services/order-service.js';
import { ContentService } from '/assets/js/services/content-service.js';
import { StockService } from '/assets/js/services/stock-service.js';
import { getSupabaseClient } from '/assets/js/services/supabase-client.js';

class AdminDashboard {
  constructor() {
    window.dashboard = this;
    this.storageKey = 'frere_mixage_admin_state_v11';
    
    // Purge immédiate de TOUTES les anciennes versions de cache (v1 à v10)
    ['frere_mixage_admin_state_v1', 'frere_mixage_admin_state_v2', 'frere_mixage_admin_state_v3', 'frere_mixage_admin_state_v4', 'frere_mixage_admin_state_v5', 'frere_mixage_admin_state_v6', 'frere_mixage_admin_state_v7', 'frere_mixage_admin_state_v8', 'frere_mixage_admin_state_v9', 'frere_mixage_admin_state_v10'].forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });

    this.state = this.loadState();
    this.currentView = 'overview';
    this.currentOrderFilter = 'all';
    this.currentProductFilter = 'all';
    this.currentInvoiceFilter = 'all';
    this.currentMeasurementFilter = 'all';
    this.selectedOrderId = 'FM-00125';
    this.isSubmittingProduct = false;
    this.uploadedImages = [];
    this.invoiceLines = [
      { description: 'Grand Boubou Royal Getzner (Broderies Or)', quantity: 1, unitPrice: 150000 }
    ];

    this.init();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Impossible de charger le localStorage, utilisation des données initiales.');
    }
    const initial = JSON.parse(JSON.stringify(INITIAL_DATA));
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(initial));
    } catch (e) {}
    return initial;
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      ['frere_mixage_admin_state_v1', 'frere_mixage_admin_state_v2', 'frere_mixage_admin_state_v3', 'frere_mixage_admin_state_v4', 'frere_mixage_admin_state_v5', 'frere_mixage_admin_state_v6', 'frere_mixage_admin_state_v7', 'frere_mixage_admin_state_v8', 'frere_mixage_admin_state_v9', 'frere_mixage_admin_state_v10'].forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });
      window.dispatchEvent(new Event('storage'));
      try {
        const channel = new BroadcastChannel('frere_mixage_sync');
        channel.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
      } catch (e) {}
    } catch (e) {
      console.warn('Erreur localStorage (quota), tentative de nettoyage...', e);
      try {
        ['frere_mixage_admin_state_v1', 'frere_mixage_admin_state_v2', 'frere_mixage_admin_state_v3', 'frere_mixage_admin_state_v4', 'frere_mixage_admin_state_v5', 'frere_mixage_admin_state_v6', 'frere_mixage_admin_state_v7', 'frere_mixage_admin_state_v8', 'frere_mixage_admin_state_v9', 'frere_mixage_admin_state_v10'].forEach(k => {
          try { localStorage.removeItem(k); } catch (err) {}
        });
        localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        window.dispatchEvent(new Event('storage'));
        try {
          const channel = new BroadcastChannel('frere_mixage_sync');
          channel.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
        } catch (e) {}
      } catch (err2) {
        console.error('Erreur critique de sauvegarde locale :', err2);
      }
    }
  }

  compressImage(file, maxWidth = 1000, quality = 0.82) {
    return new Promise((resolve) => {
      if (!file || !file.type.startsWith('image/')) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
          } catch (err) {
            resolve(e.target.result);
          }
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  }

  async init() {
    window.dashboard = this;
    // 1. Accès direct Administrateur (sans écran de connexion intermédiaire)
    this.currentUserRole = 'owner';
    this.currentProfile = {
      id: 'owner-session',
      full_name: 'Maison Frère Mixage',
      role: 'owner',
      phone: '+221 78 634 76 66',
      is_active: true
    };

    if (!this.state) this.state = {};
    if (!Array.isArray(this.state.products)) this.state.products = [];
    if (!Array.isArray(this.state.orders)) this.state.orders = JSON.parse(JSON.stringify(INITIAL_DATA.orders || []));
    if (!Array.isArray(this.state.customers)) this.state.customers = JSON.parse(JSON.stringify(INITIAL_DATA.customers || []));
    if (!Array.isArray(this.state.categories)) this.state.categories = JSON.parse(JSON.stringify(INITIAL_DATA.categories || []));
    if (!Array.isArray(this.state.invoices)) this.state.invoices = JSON.parse(JSON.stringify(INITIAL_DATA.invoices || []));
    if (!Array.isArray(this.state.measurements)) this.state.measurements = JSON.parse(JSON.stringify(INITIAL_DATA.measurements || []));
    if (!Array.isArray(this.state.testimonials)) this.state.testimonials = JSON.parse(JSON.stringify(INITIAL_DATA.testimonials || []));
    if (!this.state.about) this.state.about = JSON.parse(JSON.stringify(INITIAL_DATA.about || {}));
    if (!this.state.accounting) this.state.accounting = JSON.parse(JSON.stringify(INITIAL_DATA.accounting || {}));
    if (!this.state.settings) this.state.settings = JSON.parse(JSON.stringify(INITIAL_DATA.settings || {}));

    try {
      this.bindEvents();
      this.setupHashRouting();
      this.renderAll();
      this.renderSalesChart();
      this.renderUserHeader();
    } catch (err) {
      console.error('[Dashboard Init Warning]', err);
    }
    
    // Synchronisation en direct avec la base Supabase
    this.syncWithSupabase();
  }

  async syncWithSupabase() {
    try {
      // 1. Charger les produits réels depuis Supabase (uniquement publiés)
      const dbProducts = await ProductService.getAllProductsAdmin();
      if (Array.isArray(dbProducts)) {
        if (dbProducts.length === 0) {
          this.state.products = [];
        } else {
          const seenNames = new Set();
          const uniqueDbProducts = [];
          for (const p of dbProducts) {
            const norm = (p.name || '').trim().toLowerCase();
            if (norm && !seenNames.has(norm)) {
              seenNames.add(norm);
              uniqueDbProducts.push(p);
            }
          }

          this.state.products = uniqueDbProducts.map(p => {
            const stockMap = {};
            if (p.product_variants) {
              p.product_variants.forEach(v => { stockMap[v.size] = v.stock; });
            }
            const realImages = (p.images && p.images.length > 0) ? p.images : [];

            return {
              id: p.slug || p.id,
              dbId: p.id,
              name: p.name,
              code: (p.slug || 'FM-REF').toUpperCase(),
              category: p.categories ? p.categories.name : 'Tenue Traditionnelle',
              categorySlug: p.categories ? p.categories.slug : 'traditionnel',
              price: p.sale_price || p.price,
              originalPrice: p.sale_price ? p.price : null,
              status: p.status,
              badge: p.sale_price ? 'Promotion' : (p.is_featured ? 'Prestige' : ''),
              description: p.description || '',
              fabric: p.fabric || '',
              images: realImages,
              stock: stockMap
            };
          });
        }
        this.saveState();
        this.renderProducts();
        this.renderStocks();
      }

      // 2. Charger les commandes réelles depuis Supabase
      const dbOrders = await OrderService.getAllOrdersAdmin();
      if (dbOrders && dbOrders.length > 0) {
        this.state.orders = dbOrders.map(o => ({
          id: o.order_number || o.id,
          dbId: o.id,
          customer: {
            name: o.customers ? o.customers.full_name : 'Client',
            phone: o.customers ? o.customers.phone : '',
            email: o.customers ? o.customers.email : '',
            address: o.customers ? `${o.customers.address || ''}, ${o.customers.city || ''}` : o.delivery_address
          },
          status: o.status,
          totalAmount: o.total,
          subtotal: o.subtotal,
          deliveryFee: o.delivery_fee,
          paymentMethod: o.payment_method,
          paymentStatus: o.payment_status,
          date: new Date(o.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
          items: (o.order_items || []).map(it => ({
            name: it.product_name_snapshot,
            size: it.size,
            qty: it.quantity,
            price: it.unit_price
          }))
        }));
        this.saveState();
      }

      // 3. Charger les témoignages réels depuis Supabase
      const dbTestimonials = await ContentService.getAllTestimonialsAdmin();
      if (dbTestimonials && dbTestimonials.length > 0) {
        this.state.testimonials = dbTestimonials.map(t => ({
          id: t.id,
          name: t.name,
          role: t.role,
          rating: t.rating,
          quote: t.quote,
          avatar: t.avatar_url || '/assets/images/ab8459f150d5d7db346654de338434e5.jpg',
          isActive: t.is_active
        }));
        this.saveState();
        this.renderTestimonials();
      }

      // 4. Charger le contenu À Propos / Atelier depuis Supabase
      const dbAbout = await ContentService.getAboutContent();
      if (dbAbout) {
        this.state.about = dbAbout;
        this.saveState();
        this.renderAboutForm();
      }
    } catch (err) {
      console.warn('[Dashboard.syncWithSupabase] Mode local actif :', err.message);
    }
  }

  bindEvents() {
    // Navigation Sidebar Links
    document.querySelectorAll('[data-view]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const view = link.getAttribute('data-view');
        const filter = link.getAttribute('data-filter');
        if (filter) this.currentOrderFilter = filter;
        this.navigateTo(view);
      });
    });

    // Mobile Sidebar Toggle
    const mobileToggle = document.getElementById('mobile-toggle-btn');
    const sidebar = document.getElementById('admin-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = sidebar.classList.toggle('mobile-open');
        if (backdrop) backdrop.classList.toggle('active', isOpen);
      });
      if (backdrop) {
        backdrop.addEventListener('click', () => {
          sidebar.classList.remove('mobile-open');
          backdrop.classList.remove('active');
        });
      }
      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
          sidebar.classList.remove('mobile-open');
          if (backdrop) backdrop.classList.remove('active');
        }
      });
    }

    // Recherche Globale
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length > 1) {
          this.navigateTo('products');
          const pSearch = document.getElementById('products-search-input');
          if (pSearch) {
            pSearch.value = query;
            this.renderProducts();
          }
        }
      });
    }

    // Modal Close buttons
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });

    // Formulaires
    this.setupAddProductForm();
    this.setupInvoiceForm();
    this.setupAboutForm();
    this.setupSettingsForm();
    this.setupProfileForm();
  }

  setupHashRouting() {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') || 'overview';
      if (hash.startsWith('orders-')) {
        this.currentOrderFilter = hash.replace('orders-', '');
        this.navigateTo('orders', false);
      } else if (hash.startsWith('order-detail/')) {
        const orderId = hash.split('/')[1];
        if (orderId) this.selectedOrderId = orderId;
        this.navigateTo('order-detail', false);
      } else {
        this.navigateTo(hash, false);
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
  }

  navigateTo(viewId, updateHash = true) {
    // Protection stricte des routes selon le rôle
    if ((viewId === 'team' || viewId === 'settings') && this.currentUserRole === 'assistant') {
      this.showToast('Accès non autorisé : Cette section est réservée au Propriétaire.', 'error');
      if (updateHash) window.location.hash = 'overview';
      this.navigateTo('overview', false);
      return;
    }

    const targetSection = document.getElementById(`view-${viewId}`);
    if (!targetSection) return;

    // Fermeture automatique du tiroir mobile lors de la navigation
    const sidebar = document.getElementById('admin-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');

    this.currentView = viewId;
    if (updateHash) {
      window.location.hash = viewId;
    }

    if (viewId === 'add-product' && !document.getElementById('edit-prod-id')?.value) {
      this.resetProductForm();
    }

    if (viewId === 'create-invoice') {
      this.initCreateInvoiceForm();
    }

    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    targetSection.classList.add('active');

    document.querySelectorAll('[data-view]').forEach(link => {
      const v = link.getAttribute('data-view');
      const f = link.getAttribute('data-filter');
      if (v === viewId && (!f || f === this.currentOrderFilter)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    const sidebar = document.getElementById('admin-sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    this.renderActiveView(viewId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  renderAll() {
    this.renderOverview();
    this.renderProducts();
    this.renderStocks();
    this.renderAccounting();
    this.renderOrders();
    this.renderOrderDetail();
    this.renderCustomers();
    this.renderMeasurements();
    this.renderInvoices();
    this.renderTestimonials();
    this.renderAboutForm();
    this.renderTeam();
    this.renderSettings();
    this.renderProfile();
    this.renderUserHeader();
  }

  renderActiveView(viewId) {
    switch (viewId) {
      case 'overview':
        this.renderOverview();
        this.renderSalesChart();
        break;
      case 'products':
        this.renderProducts();
        break;
      case 'add-product':
        const editIdInput = document.getElementById('edit-prod-id');
        if (!editIdInput || !editIdInput.value) {
          this.resetProductForm();
        }
        break;
      case 'stocks':
        this.renderStocks();
        break;
      case 'accounting':
        this.renderAccounting();
        break;
      case 'orders':
        this.renderOrders();
        break;
      case 'order-detail':
        this.renderOrderDetail();
        break;
      case 'customers':
        this.renderCustomers();
        break;
      case 'measurements':
        this.renderMeasurements();
        break;
      case 'add-measurement':
        this.populateMeasurementDatalist();
        break;
      case 'invoices':
        this.renderInvoices();
        break;
      case 'create-invoice':
        this.initCreateInvoiceForm();
        break;
      case 'testimonials':
        this.renderTestimonials();
        break;
      case 'about':
        this.renderAboutForm();
        break;
      case 'team':
        this.renderTeam();
        break;
      case 'settings':
        this.renderSettings();
        break;
      case 'profile':
        this.renderProfile();
        break;
    }
  }

  // ===================================================================
  // 1. OVERVIEW
  // ===================================================================
  renderOverview() {
    const totalRev = this.state.orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalAmount : 0), 0);
    const totalOrders = this.state.orders.length;
    const totalProducts = this.state.products.length;
    
    const lowStockCount = this.state.products.filter(p => {
      const sum = Object.values(p.stock || {}).reduce((a, b) => a + b, 0);
      return sum > 0 && sum <= 3;
    }).length;

    const ordersPendingBadge = document.getElementById('nav-pending-count');
    const pendingOrdersCount = this.state.orders.filter(o => o.status === 'new').length;
    if (ordersPendingBadge) ordersPendingBadge.textContent = pendingOrdersCount;

    const navStockBadge = document.getElementById('nav-stock-count');
    if (navStockBadge) navStockBadge.textContent = lowStockCount;

    const kpiRev = document.getElementById('kpi-revenue');
    if (kpiRev) kpiRev.textContent = `${totalRev.toLocaleString('fr-FR')} FCFA`;

    const kpiOrd = document.getElementById('kpi-orders');
    if (kpiOrd) kpiOrd.textContent = totalOrders;

    const kpiProd = document.getElementById('kpi-products');
    if (kpiProd) kpiProd.textContent = totalProducts;

    const kpiStock = document.getElementById('kpi-low-stock');
    if (kpiStock) kpiStock.textContent = lowStockCount;

    const recentOrdersTbody = document.getElementById('overview-recent-orders-tbody');
    if (recentOrdersTbody) {
      recentOrdersTbody.innerHTML = this.state.orders.slice(0, 4).map(o => `
        <tr>
          <td><strong style="color: var(--gold-light);">${o.id}</strong></td>
          <td>${o.customer.name}</td>
          <td>${o.items.map(i => `${i.name} (${i.size})`).join(', ')}</td>
          <td><strong>${o.totalAmount.toLocaleString('fr-FR')} FCFA</strong></td>
          <td style="color: var(--text-dim); font-size: 0.75rem;">${o.date}</td>
          <td>${this.getStatusBadge(o.status, o.statusLabel)}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="window.dashboard.openOrderDetail('${o.id}')">
              Détail →
            </button>
          </td>
        </tr>
      `).join('');
    }

    const popList = document.getElementById('overview-popular-products');
    if (popList) {
      const sorted = [...this.state.products].sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0)).slice(0, 4);
      popList.innerHTML = sorted.map(p => `
        <div class="popular-product-item">
          <img src="${p.images[0] || '../assets/images/logo-frere-mixage.png'}" alt="${p.name}" class="popular-product-img">
          <div class="popular-product-info">
            <div class="popular-product-name">${p.name}</div>
            <div class="popular-product-category">${p.category}</div>
          </div>
          <div class="popular-product-sales">
            <div class="popular-product-price">${p.price.toLocaleString('fr-FR')} FCFA</div>
            <div class="popular-product-count">${p.salesCount || 0} ventes</div>
          </div>
        </div>
      `).join('');
    }

    const actList = document.getElementById('overview-activity-timeline');
    if (actList) {
      actList.innerHTML = this.state.recentActivity.map(act => `
        <div class="activity-item">
          <div class="activity-dot"></div>
          <div class="activity-title">${act.title}</div>
          <div class="activity-detail">${act.detail}</div>
          <div class="activity-time">${act.time}</div>
        </div>
      `).join('');
    }

    const alertsBox = document.getElementById('overview-alerts-list');
    if (alertsBox) {
      alertsBox.innerHTML = this.state.alerts.map(al => `
        <div class="alert-card ${al.type}" style="cursor: pointer;" onclick="window.location.hash='${al.link}'">
          <div class="alert-content">
            <h4>${al.title}</h4>
            <p>${al.message}</p>
          </div>
        </div>
      `).join('');
    }
  }

  renderSalesChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.clientWidth;
    const height = canvas.parentElement.clientHeight || 280;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const history = this.state.salesHistory;
    const maxVal = Math.max(...history.map(h => h.revenue)) * 1.15;
    const paddingLeft = 60;
    const paddingBottom = 40;
    const paddingTop = 20;
    const paddingRight = 20;

    const chartW = width - paddingLeft - paddingRight;
    const chartH = height - paddingTop - paddingBottom;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = paddingTop + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      const val = Math.round((maxVal - (maxVal / 4) * i) / 1000);
      ctx.fillStyle = '#6B665D';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${val}k`, paddingLeft - 10, y + 4);
    }

    const points = history.map((item, idx) => {
      const x = paddingLeft + (chartW / (history.length - 1)) * idx;
      const y = paddingTop + chartH - (item.revenue / maxVal) * chartH;
      return { x, y, item };
    });

    const gradient = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartH);
    gradient.addColorStop(0, 'rgba(197, 160, 89, 0.35)');
    gradient.addColorStop(1, 'rgba(197, 160, 89, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, idx) => {
      if (idx > 0) {
        const prev = points[idx - 1];
        const cpX = (prev.x + p.x) / 2;
        ctx.bezierCurveTo(cpX, prev.y, cpX, p.y, p.x, p.y);
      }
    });
    ctx.lineTo(points[points.length - 1].x, paddingTop + chartH);
    ctx.lineTo(points[0].x, paddingTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach((p, idx) => {
      if (idx > 0) {
        const prev = points[idx - 1];
        const cpX = (prev.x + p.x) / 2;
        ctx.bezierCurveTo(cpX, prev.y, cpX, p.y, p.x, p.y);
      }
    });
    ctx.strokeStyle = '#DFBF7D';
    ctx.lineWidth = 3;
    ctx.stroke();

    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0A0A0D';
      ctx.fill();
      ctx.strokeStyle = '#DFBF7D';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#9E988D';
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(p.item.month, p.x, height - 12);
    });
  }

  // ===================================================================
  // 2. PRODUITS & FILTRES
  // ===================================================================
  formatImageUrl(url) {
    if (!url || typeof url !== 'string') {
      return '';
    }
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) return trimmed;
    if (trimmed.startsWith('./')) return '/' + trimmed.slice(2);
    if (trimmed.startsWith('../')) return '/' + trimmed.slice(3);
    return '/' + trimmed;
  }

  setProductFilter(filterId, btnEl = null) {
    this.currentProductFilter = filterId;
    document.querySelectorAll('#products-filters .filter-pill-btn').forEach(btn => {
      const isMatch = btn.getAttribute('data-pfilter') === filterId;
      btn.classList.toggle('active', isMatch);
    });
    this.renderProducts();
  }

  renderProducts() {
    const grid = document.getElementById('products-grid-container');
    const searchInput = document.getElementById('products-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (!grid) return;

    // Synchronisation de l'état actif doré des boutons de filtres
    document.querySelectorAll('#products-filters .filter-pill-btn').forEach(btn => {
      const isMatch = btn.getAttribute('data-pfilter') === this.currentProductFilter;
      btn.classList.toggle('active', isMatch);
    });

    let filtered = this.state.products || [];

    if (this.currentProductFilter === 'nouveautes') {
      filtered = filtered.filter(p => (p.badge && p.badge.toLowerCase().includes('nouveau')) || p.status === 'published');
    } else if (this.currentProductFilter === 'promotions') {
      filtered = filtered.filter(p => p.originalPrice && p.originalPrice > p.price);
    } else if (this.currentProductFilter !== 'all') {
      const f = this.currentProductFilter.toLowerCase();
      filtered = filtered.filter(p => {
        const slug = (p.categorySlug || '').toLowerCase();
        const catName = (p.category || '').toLowerCase();
        if (f === 'traditionnel') {
          return slug.includes('tradition') || slug.includes('boubou') || catName.includes('tradition') || catName.includes('boubou');
        }
        if (f === 'costumes') {
          return slug.includes('costume') || catName.includes('costume');
        }
        if (f === 'modernes') {
          return slug.includes('moderne') || slug.includes('ensemble') || slug.includes('chemise') || slug.includes('pantalon') || catName.includes('moderne') || catName.includes('ensemble');
        }
        if (f === 'evenementiel') {
          return slug.includes('evenement') || slug.includes('magal') || slug.includes('gamou') || slug.includes('fete') || slug.includes('ceremonie') || catName.includes('evenement') || catName.includes('magal');
        }
        return slug === f || catName.includes(f);
      });
    }

    if (query) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query) ||
        (p.fabric && p.fabric.toLowerCase().includes(query))
      );
    }

    if (!this.state.products || this.state.products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4.5rem 1.5rem; background: var(--admin-card); border: 1px dashed var(--gold-border); border-radius: 16px;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">👔</div>
          <h3 style="font-family: var(--font-title); font-size: 1.4rem; color: #FFFFFF; margin-bottom: 0.5rem;">Catalogue vierge</h3>
          <p style="font-size: 0.95rem; color: var(--text-dim); max-width: 480px; margin: 0 auto 1.5rem auto; line-height: 1.6;">
            Toutes les tenues de démonstration ont été supprimées. Vous pouvez maintenant ajouter vos propres créations avec vos photos, descriptions, tarifs et tailles.
          </p>
          <button class="btn btn-primary" onclick="window.dashboard.navigateTo('add-product')">
            <span>+ Ajouter ma première création</span>
          </button>
        </div>
      `;
      return;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-dim);">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Aucune création trouvée dans cette catégorie.</p>
          <button class="btn btn-secondary btn-sm" onclick="window.dashboard.resetProductFilters()">Voir toutes les créations</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(p => {
      const totalStock = Object.values(p.stock || {}).reduce((a, b) => a + b, 0);
      const stockBadge = totalStock === 0 
        ? '<span class="badge badge-stock-out">Épuisé</span>' 
        : totalStock <= 3 
          ? `<span class="badge badge-stock-low">Stock faible (${totalStock})</span>` 
          : `<span class="badge badge-stock-ok">En stock (${totalStock})</span>`;

      const firstImage = (p.images && p.images.length > 0) ? p.images[0] : '';
      const displayImage = this.formatImageUrl(firstImage);
      const imageHtml = displayImage
        ? `<img src="${displayImage}" alt="${p.name}" class="product-admin-image" loading="lazy" onerror="this.style.display='none'">`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#16161C;color:#4a4a5a;font-size:3rem;">👔</div>`;

      return `
        <div class="product-admin-card">
          <div class="product-admin-image-box">
            ${imageHtml}
            <div class="product-admin-status-badge">
              ${this.getProductStatusBadge(p.status)}
            </div>
          </div>
          <div class="product-admin-body">
            <div class="product-admin-cat">${p.category}</div>
            <h3 class="product-admin-title">${p.name}</h3>
            
            <div class="product-admin-meta-row">
              <div class="product-admin-price">${p.price.toLocaleString('fr-FR')} FCFA</div>
              <div class="product-admin-stock-info">${stockBadge}</div>
            </div>

            <div class="product-admin-footer">
              <span style="font-size: 0.72rem; color: var(--text-dim);">${p.code || 'FM-REF'}</span>
              <div class="table-actions">
                <button class="btn-action-icon" title="Voir les détails" onclick="window.dashboard.viewProductModal('${p.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="btn-action-icon" title="Modifier la création" onclick="window.dashboard.editProduct('${p.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button class="btn-action-icon danger" title="Supprimer" onclick="window.dashboard.deleteProduct('${p.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  resetProductFilters() {
    this.setProductFilter('all');
    const searchInput = document.getElementById('products-search-input');
    if (searchInput) searchInput.value = '';
  }

  // ===================================================================
  // 3. AJOUTER / MODIFIER PRODUIT
  // ===================================================================
  setupAddProductForm() {
    const form = document.getElementById('form-add-product');
    const dropzone = document.getElementById('product-image-dropzone');
    const fileInput = document.getElementById('product-file-input');

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      // Gestion du Glisser-Déposer (Drag & Drop)
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--gold)';
        dropzone.style.background = 'rgba(197, 160, 89, 0.08)';
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = '';
        dropzone.style.background = '';
      });

      dropzone.addEventListener('drop', async (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '';
        dropzone.style.background = '';
        const files = Array.from(e.dataTransfer.files);
        for (const file of files) {
          const compressed = await this.compressImage(file, 1000, 0.82);
          if (compressed) {
            this.uploadedImages.push(compressed);
            this.renderUploadedPreviews();
          }
        }
      });

      fileInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
          const compressed = await this.compressImage(file, 1000, 0.82);
          if (compressed) {
            this.uploadedImages.push(compressed);
            this.renderUploadedPreviews();
          }
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProduct('published');
      });

      const draftBtn = document.getElementById('btn-save-draft');
      if (draftBtn) {
        draftBtn.addEventListener('click', () => this.saveProduct('draft'));
      }
    }
  }

  resetProductForm() {
    const form = document.getElementById('form-add-product');
    if (form) form.reset();

    const editIdInput = document.getElementById('edit-prod-id');
    if (editIdInput) editIdInput.value = '';

    const titleEl = document.getElementById('add-product-page-title');
    if (titleEl) titleEl.textContent = 'Ajouter une nouvelle tenue';

    const subTitleEl = document.getElementById('add-product-page-subtitle');
    if (subTitleEl) subTitleEl.textContent = 'Renseignez les détails, photos, tarifs et stocks par taille pour la publication.';

    this.uploadedImages = [];
    this.renderUploadedPreviews();
  }

  editProduct(productId) {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) return;

    this.navigateTo('add-product');

    const editIdInput = document.getElementById('edit-prod-id');
    if (editIdInput) editIdInput.value = product.id;

    const titleEl = document.getElementById('add-product-page-title');
    if (titleEl) titleEl.textContent = `Modifier : ${product.name}`;

    const subTitleEl = document.getElementById('add-product-page-subtitle');
    if (subTitleEl) subTitleEl.textContent = `Mettez à jour les caractéristiques, prix ou stocks de cette création (${product.code || 'FM'}).`;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val !== undefined && val !== null ? val : '';
    };

    setVal('input-prod-name', product.name);
    setVal('select-prod-category', product.categorySlug || 'traditionnel');
    setVal('input-prod-fabric', product.fabric);
    setVal('textarea-prod-desc', product.description);
    setVal('input-prod-badge', product.badge);
    setVal('input-prod-price', product.price);
    setVal('input-prod-orig-price', product.originalPrice);

    const stock = product.stock || {};
    ['xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'].forEach(sz => {
      setVal(`stock-${sz}`, stock[sz.toUpperCase()] || 0);
    });

    const radio = document.querySelector(`input[name="prod_status"][value="${product.status}"]`);
    if (radio) radio.checked = true;

    this.uploadedImages = product.images ? [...product.images] : [];
    this.renderUploadedPreviews();
  }

  renderUploadedPreviews() {
    const previewsBox = document.getElementById('upload-previews-container');
    if (!previewsBox) return;

    if (!this.uploadedImages || this.uploadedImages.length === 0) {
      previewsBox.innerHTML = '';
      return;
    }

    previewsBox.innerHTML = this.uploadedImages.map((src, idx) => `
      <div class="upload-preview-thumb">
        <img src="${src}" alt="Photo de la tenue">
        <button type="button" class="btn-remove-thumb" onclick="window.dashboard.removeUploadedImage(${idx})" title="Supprimer cette photo">×</button>
      </div>
    `).join('');
  }

  removeUploadedImage(index) {
    this.uploadedImages.splice(index, 1);
    this.renderUploadedPreviews();
  }

  async saveProduct(statusOverride = null) {
    if (this.isSubmittingProduct) {
      console.warn('[saveProduct] Soumission déjà en cours, clic ignoré.');
      return;
    }

    const editId = document.getElementById('edit-prod-id')?.value;
    const name = document.getElementById('input-prod-name')?.value.trim();
    const cat = document.getElementById('select-prod-category')?.value || 'traditionnel';
    const price = parseFloat(document.getElementById('input-prod-price')?.value) || 0;
    const origPrice = parseFloat(document.getElementById('input-prod-orig-price')?.value) || null;
    const desc = document.getElementById('textarea-prod-desc')?.value.trim();
    const fabric = document.getElementById('input-prod-fabric')?.value.trim();
    const badge = document.getElementById('input-prod-badge')?.value.trim();

    if (!name || !price) {
      this.showToast('Veuillez renseigner au moins le nom et le prix.', 'error');
      return;
    }

    const submitBtn = document.querySelector('#form-add-product button[type="submit"]');
    const draftBtn = document.getElementById('btn-save-draft');
    const origSubmitHtml = submitBtn ? submitBtn.innerHTML : 'Publier la tenue';

    // Verrouillage immédiat
    this.isSubmittingProduct = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span style="display:inline-block;width:14px;height:14px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;vertical-align:middle;"></span>
        Publication en cours...
      `;
    }
    if (draftBtn) draftBtn.disabled = true;

    try {
      const stockObj = {
        XS: parseInt(document.getElementById('stock-xs')?.value || 0, 10),
        S: parseInt(document.getElementById('stock-s')?.value || 0, 10),
        M: parseInt(document.getElementById('stock-m')?.value || 0, 10),
        L: parseInt(document.getElementById('stock-l')?.value || 0, 10),
        XL: parseInt(document.getElementById('stock-xl')?.value || 0, 10),
        XXL: parseInt(document.getElementById('stock-xxl')?.value || 0, 10),
        XXXL: parseInt(document.getElementById('stock-xxxl')?.value || 0, 10)
      };

      const status = statusOverride || document.querySelector('input[name="prod_status"]:checked')?.value || 'published';
      
      const catMap = {
        'traditionnel': 'Tenues Traditionnelles',
        'costumes': 'Costumes Africains',
        'modernes': 'Tenues Modernes',
        'evenementiel': 'Collection Événementielle'
      };

      const catObj = this.state.categories?.find(c => c.slug === cat) || { 
        name: catMap[cat] || 'Tenues Traditionnelles', 
        slug: cat || 'traditionnel' 
      };

      const imagesToUse = (this.uploadedImages && this.uploadedImages.length > 0) 
        ? [...this.uploadedImages] 
        : [];

      if (editId) {
        const index = this.state.products.findIndex(p => p.id === editId);
        if (index !== -1) {
          const existing = this.state.products[index];
          const dbId = existing.dbId || existing.id;

          try {
            const res = await ProductService.updateProduct(dbId, {
              name,
              categorySlug: catObj.slug,
              price,
              sale_price: origPrice,
              description: desc,
              fabric,
              status,
              is_featured: status === 'published',
              images: imagesToUse,
              stock: stockObj
            });
            if (res && res.id) {
              existing.dbId = res.id;
            }
          } catch (e) {
            console.warn('[Supabase] Erreur mise à jour produit :', e);
          }

          this.state.products[index] = {
            ...this.state.products[index],
            name,
            category: catObj.name,
            categorySlug: catObj.slug,
            price,
            originalPrice: origPrice,
            badge: badge || '',
            status,
            fabric: fabric || 'Bazin / Laine d’exception',
            description: desc || 'Création haute couture sur mesure.',
            images: imagesToUse,
            stock: stockObj
          };

          this.saveState();
          this.resetProductForm();
          this.renderProducts();
          this.renderStocks();
          this.renderCategories();
          this.renderOverview();
          this.showToast(`La tenue « ${name} » a été modifiée et synchronisée !`, 'success');
          this.navigateTo('products');
          return;
        }
      }

      // Création d'un nouveau produit sur Supabase Cloud avec protection anti-doublon
      let createdDbId = null;
      try {
        const res = await ProductService.createProduct({
          name,
          categorySlug: catObj.slug,
          price,
          sale_price: origPrice,
          description: desc,
          fabric,
          status,
          is_featured: status === 'published',
          images: imagesToUse,
          stock: stockObj
        });
        if (res && res.id) createdDbId = res.id;
      } catch (e) {
        console.warn('[Supabase] Erreur création produit :', e);
      }

      const newProduct = {
        id: createdDbId || `prod-${Date.now()}`,
        dbId: createdDbId,
        code: `FM-${Math.floor(100 + Math.random() * 900)}`,
        name,
        category: catObj.name,
        categorySlug: catObj.slug,
        price,
        originalPrice: origPrice,
        badge: badge || 'Nouveau',
        status,
        fabric: fabric || 'Tissu haute couture sélectionné',
        description: desc || 'Création d’exception taillée sur mesure.',
        images: imagesToUse,
        stock: stockObj,
        salesCount: 0
      };

      // Éviter tout doublon local avec le même nom
      this.state.products = this.state.products.filter(p => (p.name || '').trim().toLowerCase() !== name.toLowerCase());
      this.state.products.unshift(newProduct);
      
      this.saveState();
      this.resetProductForm();
      this.renderProducts();
      this.renderStocks();
      this.renderCategories();
      this.renderOverview();
      this.showToast(`La tenue « ${name} » a été enregistrée avec succès !`, 'success');
      this.navigateTo('products');
    } finally {
      // Déverrouillage dans tous les cas
      this.isSubmittingProduct = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origSubmitHtml;
      }
      if (draftBtn) draftBtn.disabled = false;
    }
  }

  async deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette création ?')) return;

    const target = this.state.products.find(p => p.id === productId);
    const dbId = target?.dbId || productId;

    if (dbId) {
      try {
        await ProductService.deleteProduct(dbId);
      } catch (e) {
        console.warn('[Supabase] Erreur suppression produit :', e);
      }
    }

    this.state.products = this.state.products.filter(p => p.id !== productId);
    this.saveState();
    this.renderProducts();
    this.renderStocks();
    this.renderOverview();
    this.showToast('Création supprimée du catalogue.', 'info');
  }

  // ===================================================================
  // 4. STOCKS
  // ===================================================================
  renderStocks() {
    const tbody = document.getElementById('stocks-table-tbody');
    if (!tbody) return;

    let totalStockAll = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    tbody.innerHTML = this.state.products.map(p => {
      const stock = p.stock || { XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0 };
      const sum = Object.values(stock).reduce((a, b) => a + b, 0);

      totalStockAll += sum;
      if (sum === 0) outOfStockCount++;
      else if (sum <= 3) lowStockCount++;

      const sizePills = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(sz => {
        const qty = stock[sz] || 0;
        return `<span class="size-badge-pill ${qty === 0 ? 'out' : ''}"><strong>${sz}</strong>: ${qty}</span>`;
      }).join(' ');

      const statusBadge = sum === 0 
        ? '<span class="badge badge-stock-out">Épuisé</span>' 
        : sum <= 3 
          ? `<span class="badge badge-stock-low">Stock Faible</span>` 
          : `<span class="badge badge-stock-ok">Disponible</span>`;

      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${this.formatImageUrl(p.images ? p.images[0] : null)}" style="width: 36px; height: 36px; border-radius: 4px; object-fit: cover;" onerror="this.onerror=null; this.src='../assets/images/logo-frere-mixage.png'">
              <div>
                <strong>${p.name}</strong>
                <div style="font-size: 0.72rem; color: var(--text-dim);">${p.category}</div>
              </div>
            </div>
          </td>
          <td>${sizePills}</td>
          <td><strong>${sum} pièces</strong></td>
          <td>${statusBadge}</td>
          <td>
            <button class="btn btn-secondary btn-sm" onclick="window.dashboard.openQuickStockModal('${p.id}')">
              Ajuster stock
            </button>
          </td>
        </tr>
      `;
    }).join('');

    const stTot = document.getElementById('stock-kpi-total');
    if (stTot) stTot.textContent = totalStockAll;

    const stLow = document.getElementById('stock-kpi-low');
    if (stLow) stLow.textContent = lowStockCount;

    const stOut = document.getElementById('stock-kpi-out');
    if (stOut) stOut.textContent = outOfStockCount;
  }

  openQuickStockModal(productId) {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) return;

    const modalBox = document.getElementById('modal-generic-body');
    const modalTitle = document.getElementById('modal-generic-title');
    if (!modalBox || !modalTitle) return;

    modalTitle.textContent = `Ajuster les stocks — ${product.name}`;

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    modalBox.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 1.5rem 0;">
        ${sizes.map(sz => `
          <div class="size-stock-card">
            <div class="size-stock-label">Taille ${sz}</div>
            <input type="number" min="0" id="quick-stock-${sz}" class="size-stock-input" value="${product.stock?.[sz] || 0}">
          </div>
        `).join('')}
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary btn-sm" onclick="window.dashboard.closeModals()">Annuler</button>
        <button class="btn btn-primary btn-sm" onclick="window.dashboard.saveQuickStock('${product.id}')">Enregistrer les stocks</button>
      </div>
    `;

    document.getElementById('admin-generic-modal')?.classList.add('active');
  }

  saveQuickStock(productId) {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) return;

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    sizes.forEach(sz => {
      const val = parseInt(document.getElementById(`quick-stock-${sz}`)?.value || 0, 10);
      product.stock[sz] = Math.max(0, val);
    });

    // Synchronisation Cloud Supabase
    if (product.dbId) {
      sizes.forEach(sz => {
        StockService.updateStock(product.dbId, sz, product.stock[sz]).catch(e => console.warn('[Supabase] Stock sync:', e));
      });
    }

    this.saveState();
    this.closeModals();
    this.renderStocks();
    this.renderOverview();
    this.showToast(`Stock mis à jour pour ${product.name}.`, 'success');
  }

  // ===================================================================
  // 5. CATÉGORIES & COLLECTIONS
  // ===================================================================
  getCategoryCoverImage(category) {
    if (category.image && category.image.trim()) {
      return { 
        url: category.image, 
        isCustom: true, 
        label: 'Photo personnalisée' 
      };
    }

    // Recherche automatique : dernière création publiée dans cette catégorie
    const catSlug = (category.slug || '').toLowerCase();
    const catName = (category.name || '').toLowerCase();

    const latestProd = this.state.products.find(p => {
      if (p.status !== 'published') return false;
      const pCatSlug = (p.categorySlug || '').toLowerCase();
      const pCatName = (p.category || '').toLowerCase();
      return pCatSlug.includes(catSlug) || catSlug.includes(pCatSlug) ||
             pCatName.includes(catName) || catName.includes(pCatName);
    });

    if (latestProd && latestProd.images && latestProd.images.length > 0) {
      return { 
        url: latestProd.images[0], 
        isCustom: false, 
        label: `Dernière tenue : ${latestProd.name}` 
      };
    }

    // Image de repli standard
    const fallbackMap = {
      'cat-traditionnel': '/assets/images/ab8459f150d5d7db346654de338434e5.jpg',
      'cat-costumes': '/assets/images/hero-frere-mixage.jpg',
      'cat-modernes': '/assets/images/ab8459f150d5d7db346654de338434e5.jpg',
      'cat-evenementiel': '/assets/images/hero-frere-mixage.jpg',
      'traditionnel': '/assets/images/ab8459f150d5d7db346654de338434e5.jpg',
      'costumes': '/assets/images/hero-frere-mixage.jpg',
      'modernes': '/assets/images/ab8459f150d5d7db346654de338434e5.jpg',
      'evenementiel': '/assets/images/hero-frere-mixage.jpg'
    };

    return { 
      url: fallbackMap[category.id] || fallbackMap[category.slug] || '/assets/images/hero-frere-mixage.jpg', 
      isCustom: false, 
      label: 'Photo officielle' 
    };
  }

  renderCategories() {
    const grid = document.getElementById('categories-grid-container');
    if (!grid) return;

    // Recalculer le nombre de produits par catégorie
    this.state.categories.forEach(c => {
      const catSlug = (c.slug || '').toLowerCase();
      const catName = (c.name || '').toLowerCase();
      const matchingCount = this.state.products.filter(p => {
        const pSlug = (p.categorySlug || '').toLowerCase();
        const pName = (p.category || '').toLowerCase();
        return pSlug.includes(catSlug) || catSlug.includes(pSlug) ||
               pName.includes(catName) || catName.includes(pName);
      }).length;
      c.count = matchingCount;
    });

    grid.innerHTML = this.state.categories.map(c => {
      const cover = this.getCategoryCoverImage(c);

      return `
        <div class="card" style="display: flex; flex-direction: column; overflow: hidden; padding: 0;">
          <div style="position: relative; height: 160px; width: 100%; background: #000; overflow: hidden;">
            <img src="${cover.url}" alt="${c.name}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <div style="position: absolute; inset: 0; background: linear-gradient(to top, rgba(14,14,19,0.95) 0%, rgba(14,14,19,0.2) 60%, transparent 100%);"></div>
            
            <!-- Badge Source Image -->
            <div style="position: absolute; top: 10px; left: 10px;">
              <span class="badge ${cover.isCustom ? 'badge-confirmed' : 'badge-preparing'}" style="font-size: 0.68rem; backdrop-filter: blur(4px);">
                ${cover.isCustom ? '✦ Image personnalisée' : '⚡ ' + cover.label}
              </span>
            </div>

            <!-- Titre et Nombre de pièces sur l'image -->
            <div style="position: absolute; bottom: 12px; left: 14px; right: 14px;">
              <h3 style="font-size: 1.15rem; color: #FFFFFF; font-weight: 700; margin-bottom: 2px;">${c.name}</h3>
              <span style="font-size: 0.75rem; color: var(--gold-light); font-weight: 600;">${c.count} création(s) en catalogue</span>
            </div>
          </div>

          <!-- Actions de la catégorie -->
          <div style="padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; background: var(--admin-card-bg); border-top: 1px solid var(--border-subtle);">
            <button class="btn btn-secondary btn-sm" onclick="window.dashboard.openEditCategoryImageModal('${c.id}')" style="font-size: 0.75rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Changer l'image
            </button>
            <button class="btn-action-icon danger" title="Supprimer la catégorie" onclick="window.dashboard.deleteCategory('${c.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  openEditCategoryImageModal(catId) {
    const category = this.state.categories.find(c => c.id === catId);
    if (!category) return;

    const modalBox = document.getElementById('modal-generic-body');
    const modalTitle = document.getElementById('modal-generic-title');
    if (!modalBox || !modalTitle) return;

    const cover = this.getCategoryCoverImage(category);

    modalTitle.textContent = `Modifier la Collection — ${category.name}`;
    modalBox.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
          Personnalisez le nom, la description et l'image d'aperçu de cette collection. Par défaut, la photo de la dernière tenue publiée est utilisée automatiquement.
        </p>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Nom de la Collection (ex: Collection Magal 2026)</label>
          <input type="text" id="input-cat-edit-name" class="form-input" value="${category.name}" required>
        </div>

        <div class="form-group" style="margin-bottom: 1.25rem;">
          <label class="form-label">Courte description affichée sur le site</label>
          <textarea id="input-cat-edit-desc" class="form-textarea" rows="2" placeholder="Description de la collection...">${category.description || ''}</textarea>
        </div>

        <!-- Aperçu actuel -->
        <div style="display: flex; gap: 15px; align-items: center; background: var(--admin-card-inner); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); margin-bottom: 1.25rem;">
          <img id="cat-modal-preview-img" src="${cover.url}" style="width: 90px; height: 90px; border-radius: 6px; object-fit: cover; border: 1px solid var(--gold-border);" alt="Aperçu">
          <div>
            <div style="font-size: 0.72rem; color: var(--gold); text-transform: uppercase; font-weight: 700;">Aperçu Actuel</div>
            <strong style="font-size: 0.95rem; color: #FFF;" id="cat-modal-preview-name">${category.name}</strong>
            <div style="font-size: 0.75rem; color: var(--text-dim); margin-top: 2px;">${cover.label}</div>
          </div>
        </div>

        <!-- Saisie Image URL -->
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">URL de l'image personnalisée</label>
          <input type="text" id="input-cat-custom-image" class="form-input" placeholder="https://..." value="${category.image || ''}" oninput="document.getElementById('cat-modal-preview-img').src = this.value || '${cover.url}'">
        </div>

        <!-- Option Upload fichier local -->
        <div class="form-group" style="margin-bottom: 1.25rem;">
          <label class="form-label">Ou importer une image depuis votre ordinateur</label>
          <input type="file" id="input-cat-file-upload" class="form-input" accept="image/*" onchange="window.dashboard.handleCatFileChange(event)">
        </div>

        <!-- Bouton Retour à la dernière tenue publiée -->
        <div style="margin-bottom: 0.5rem;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('input-cat-custom-image').value = ''; window.dashboard.saveCategoryImage('${category.id}', null)">
            ⚡ Utiliser automatiquement la dernière tenue publiée
          </button>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary btn-sm" onclick="window.dashboard.closeModals()">Annuler</button>
        <button class="btn btn-primary btn-sm" onclick="window.dashboard.saveCategoryImage('${category.id}', document.getElementById('input-cat-custom-image').value)">
          Enregistrer les modifications
        </button>
      </div>
    `;

    document.getElementById('admin-generic-modal')?.classList.add('active');
  }

  handleCatFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const preview = document.getElementById('cat-modal-preview-img');
      const input = document.getElementById('input-cat-custom-image');
      if (preview) preview.src = dataUrl;
      if (input) input.value = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  saveCategoryImage(catId, imageUrl) {
    const category = this.state.categories.find(c => c.id === catId);
    if (!category) return;

    const newName = document.getElementById('input-cat-edit-name')?.value.trim();
    const newDesc = document.getElementById('input-cat-edit-desc')?.value.trim();

    if (newName) category.name = newName;
    if (newDesc !== undefined) category.description = newDesc;

    if (imageUrl && imageUrl.trim()) {
      category.image = imageUrl.trim();
      this.showToast(`Collection « ${category.name} » mise à jour avec image personnalisée !`, 'success');
    } else {
      delete category.image;
      this.showToast(`« ${category.name} » mise à jour (photo de la dernière création publiée).`, 'info');
    }

    this.saveState();
    this.closeModals();
    this.renderCategories();
  }

  openAddCategoryModal() {
    const modalBox = document.getElementById('modal-generic-body');
    const modalTitle = document.getElementById('modal-generic-title');
    if (!modalBox || !modalTitle) return;

    modalTitle.textContent = "Ajouter une nouvelle catégorie";
    modalBox.innerHTML = `
      <div class="form-group" style="margin-bottom: 1.2rem;">
        <label class="form-label">Nom de la catégorie</label>
        <input type="text" id="input-cat-name" class="form-input" placeholder="Ex: Tuniques Royales">
      </div>
      <div class="form-group" style="margin-bottom: 1.5rem;">
        <label class="form-label">Description (optionnelle)</label>
        <textarea id="input-cat-desc" class="form-textarea" rows="2" placeholder="Courte description"></textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary btn-sm" onclick="window.dashboard.closeModals()">Annuler</button>
        <button class="btn btn-primary btn-sm" onclick="window.dashboard.saveNewCategory()">Ajouter la catégorie</button>
      </div>
    `;

    document.getElementById('admin-generic-modal')?.classList.add('active');
  }

  saveNewCategory() {
    const name = document.getElementById('input-cat-name')?.value.trim();
    if (!name) {
      this.showToast('Veuillez saisir un nom de catégorie.', 'error');
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    this.state.categories.push({
      id: `cat-${Date.now()}`,
      name,
      slug,
      count: 0,
      isActive: true,
      order: this.state.categories.length + 1
    });

    this.saveState();
    this.closeModals();
    this.renderCategories();
    this.showToast(`Catégorie « ${name} » ajoutée avec succès.`, 'success');
  }

  deleteCategory(catId) {
    if (!confirm('Supprimer cette catégorie ?')) return;
    this.state.categories = this.state.categories.filter(c => c.id !== catId);
    this.saveState();
    this.renderCategories();
    this.showToast('Catégorie supprimée.', 'info');
  }

  // ===================================================================
  // 6. COMMANDES
  // ===================================================================
  renderOrders() {
    const tbody = document.getElementById('orders-table-tbody');
    const searchInput = document.getElementById('orders-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (!tbody) return;

    let filtered = this.state.orders;

    if (this.currentOrderFilter && this.currentOrderFilter !== 'all') {
      filtered = filtered.filter(o => o.status === this.currentOrderFilter);
    }

    if (query) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(query) || 
        o.customer.name.toLowerCase().includes(query) ||
        o.customer.phone.includes(query) ||
        o.items.some(i => i.name.toLowerCase().includes(query))
      );
    }

    document.querySelectorAll('#orders-filters .filter-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-ofilter') === this.currentOrderFilter);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: var(--text-dim);">
            Aucune commande ne correspond à ces critères.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(o => `
      <tr>
        <td><strong style="color: var(--gold-light);">${o.id}</strong></td>
        <td>
          <div>
            <strong>${o.customer.name}</strong>
            <div style="font-size: 0.72rem; color: var(--text-dim);">${o.customer.phone}</div>
          </div>
        </td>
        <td>${o.items.map(i => `${i.name} (Taille ${i.size})`).join(', ')}</td>
        <td><strong>${o.totalAmount.toLocaleString('fr-FR')} FCFA</strong></td>
        <td style="font-size: 0.75rem; color: var(--text-muted);">${o.date}</td>
        <td>${this.getStatusBadge(o.status, o.statusLabel)}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="window.dashboard.openOrderDetail('${o.id}')">
            Détail →
          </button>
        </td>
      </tr>
    `).join('');
  }

  openCreateOrderModal() {
    const modalBox = document.getElementById('modal-generic-body');
    const modalTitle = document.getElementById('modal-generic-title');
    if (!modalBox || !modalTitle) return;

    modalTitle.textContent = "Créer une commande manuelle (Sur-mesure / Atelier)";

    const prodOptions = this.state.products.map(p => `
      <option value="${p.id}" data-price="${p.price}">${p.name} (${p.price.toLocaleString('fr-FR')} FCFA)</option>
    `).join('');

    modalBox.innerHTML = `
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Client *</label>
          <input type="text" id="new-ord-client-name" class="form-input" placeholder="Nom complet du client" required>
        </div>
        <div class="form-group">
          <label class="form-label">Téléphone (Sénégal) *</label>
          <input type="text" id="new-ord-client-phone" class="form-input" placeholder="+221 77 000 00 00" required>
        </div>
      </div>
      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Adresse de livraison (Dakar)</label>
        <input type="text" id="new-ord-client-address" class="form-input" placeholder="Quartier, Rue, Villa...">
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Création / Tenue *</label>
          <select id="new-ord-product-select" class="form-select" onchange="window.dashboard.handleOrderProdSelect(this)">
            ${prodOptions}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Taille *</label>
          <select id="new-ord-size-select" class="form-select">
            <option value="M">M</option>
            <option value="L" selected>L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
            <option value="Sur-mesure">Sur-mesure</option>
          </select>
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Montant Total (FCFA) *</label>
          <input type="number" id="new-ord-amount" class="form-input" value="${this.state.products[0]?.price || 150000}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Mode de paiement</label>
          <select id="new-ord-payment" class="form-select">
            <option value="Wave Sénégal">Wave Sénégal</option>
            <option value="Orange Money">Orange Money</option>
            <option value="Espèces">Espèces à la livraison</option>
            <option value="Virement bancaire">Virement bancaire</option>
          </select>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem;">
        <button class="btn btn-secondary btn-sm" onclick="window.dashboard.closeModals()">Annuler</button>
        <button class="btn btn-primary btn-sm" onclick="window.dashboard.saveNewOrder()">Créer la commande</button>
      </div>
    `;

    document.getElementById('admin-generic-modal')?.classList.add('active');
  }

  handleOrderProdSelect(selectEl) {
    const selectedOption = selectEl.options[selectEl.selectedIndex];
    const price = selectedOption.getAttribute('data-price');
    const amountInput = document.getElementById('new-ord-amount');
    if (amountInput && price) amountInput.value = price;
  }

  saveNewOrder() {
    const name = document.getElementById('new-ord-client-name')?.value.trim();
    const phone = document.getElementById('new-ord-client-phone')?.value.trim();
    const address = document.getElementById('new-ord-client-address')?.value.trim() || 'Dakar';
    const prodId = document.getElementById('new-ord-product-select')?.value;
    const size = document.getElementById('new-ord-size-select')?.value || 'L';
    const amount = parseFloat(document.getElementById('new-ord-amount')?.value) || 0;
    const payment = document.getElementById('new-ord-payment')?.value || 'Wave Sénégal';

    if (!name || !phone) {
      this.showToast('Veuillez renseigner le nom et téléphone du client.', 'error');
      return;
    }

    const prod = this.state.products.find(p => p.id === prodId) || this.state.products[0];
    const orderId = `FM-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder = {
      id: orderId,
      customer: {
        id: `cust-${Date.now()}`,
        name,
        phone,
        email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
        city: 'Dakar',
        address
      },
      items: [
        { productId: prod.id, name: prod.name, size, quantity: 1, price: amount }
      ],
      totalAmount: amount,
      paymentMethod: payment,
      paymentStatus: 'payé',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'new',
      statusLabel: 'En attente'
    };

    this.state.orders.unshift(newOrder);

    const existingCust = this.state.customers.find(c => c.phone === phone);
    if (existingCust) {
      existingCust.ordersCount += 1;
      existingCust.totalSpent += amount;
      existingCust.lastOrder = 'Aujourd’hui';
    } else {
      this.state.customers.unshift({
        id: `cust-${Date.now()}`,
        name,
        phone,
        email: newOrder.customer.email,
        ordersCount: 1,
        totalSpent: amount,
        lastOrder: 'Aujourd’hui',
        city: address,
        status: 'Nouveau'
      });
    }

    this.saveState();
    this.closeModals();
    this.renderOrders();
    this.renderOverview();
    this.showToast(`Commande #${orderId} créée avec succès !`, 'success');
  }

  // ===================================================================
  // 7. DÉTAIL COMMANDE
  // ===================================================================
  openOrderDetail(orderId) {
    this.selectedOrderId = orderId;
    this.navigateTo('order-detail');
  }

  renderOrderDetail() {
    const order = this.state.orders.find(o => o.id === this.selectedOrderId) || this.state.orders[0];
    if (!order) return;

    const titleEl = document.getElementById('order-detail-title');
    if (titleEl) titleEl.textContent = `Commande #${order.id}`;

    const dateEl = document.getElementById('order-detail-date');
    if (dateEl) dateEl.textContent = `Passée le ${order.date} • ${order.paymentMethod}`;

    const statusBadgeBox = document.getElementById('order-detail-status-badge');
    if (statusBadgeBox) statusBadgeBox.innerHTML = this.getStatusBadge(order.status, order.statusLabel);

    const custCard = document.getElementById('order-detail-customer-box');
    if (custCard) {
      custCard.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1.25rem;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--gold-gradient); color: #0A0A0D; display: flex; align-items: center; justify-content: center; font-weight: 700;">
            ${order.customer.name.charAt(0)}
          </div>
          <div>
            <h4 style="font-size: 1rem; color: var(--text-main);">${order.customer.name}</h4>
            <span style="font-size: 0.75rem; color: var(--text-dim);">${order.customer.city}</span>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.82rem;">
          <div><span style="color: var(--text-dim);">Téléphone :</span> <a href="tel:${order.customer.phone}" style="color: var(--gold-light);">${order.customer.phone}</a></div>
          <div><span style="color: var(--text-dim);">Email :</span> ${order.customer.email}</div>
          <div><span style="color: var(--text-dim);">Adresse de livraison :</span> ${order.customer.address}</div>
        </div>
        <div style="margin-top: 1.25rem; display: flex; gap: 8px;">
          <a href="https://wa.me/${order.customer.phone.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(order.customer.name)},%20concernant%20votre%20commande%20Frère%20Mixage%20${order.id}..." target="_blank" class="btn btn-secondary btn-sm" style="flex-grow: 1; justify-content: center; background: #25D366; color: #FFF; border: none;">
            WhatsApp direct
          </a>
        </div>
      `;
    }

    const itemsTbody = document.getElementById('order-detail-items-tbody');
    if (itemsTbody) {
      itemsTbody.innerHTML = order.items.map(item => `
        <tr>
          <td><strong>${item.name}</strong></td>
          <td><span class="size-badge-pill">${item.size}</span></td>
          <td>${item.quantity}</td>
          <td>${item.price.toLocaleString('fr-FR')} FCFA</td>
          <td><strong>${(item.price * item.quantity).toLocaleString('fr-FR')} FCFA</strong></td>
        </tr>
      `).join('');
    }

    const totalBox = document.getElementById('order-detail-total-amount');
    if (totalBox) totalBox.textContent = `${order.totalAmount.toLocaleString('fr-FR')} FCFA`;

    const stepperBox = document.getElementById('order-detail-stepper');
    if (stepperBox) {
      const stages = [
        { key: 'new', label: 'Commande reçue' },
        { key: 'confirmed', label: 'Confirmée' },
        { key: 'preparing', label: 'En préparation' },
        { key: 'shipped', label: 'Expédiée' },
        { key: 'delivered', label: 'Livrée' }
      ];

      const stageIndex = stages.findIndex(s => s.key === order.status);

      stepperBox.innerHTML = stages.map((s, idx) => {
        const isDone = idx < stageIndex;
        const isActive = idx === stageIndex;
        const stateClass = isDone ? 'done' : isActive ? 'active' : '';

        return `
          <div class="step-item ${stateClass}" onclick="window.dashboard.updateOrderStatus('${order.id}', '${s.key}')" title="Cliquer pour passer la commande à cet état">
            <div class="step-circle">${isDone ? '✓' : idx + 1}</div>
            <div class="step-label">${s.label}</div>
          </div>
        `;
      }).join('');
    }
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;

    const labels = {
      new: 'En attente',
      confirmed: 'Confirmée',
      preparing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };

    order.status = newStatus;
    order.statusLabel = labels[newStatus] || newStatus;

    // Synchronisation Supabase Cloud
    const dbId = order.dbId || (orderId && orderId.length > 20 ? orderId : null);
    if (dbId) {
      OrderService.updateOrderStatus(dbId, newStatus).catch(e => console.warn('[Supabase] Sync statut commande:', e));
    }

    this.state.recentActivity.unshift({
      type: 'status_change',
      title: `Commande #${order.id} mise à jour`,
      detail: `Nouveau statut : ${order.statusLabel}`,
      time: 'À l’instant'
    });

    this.saveState();
    this.renderOrderDetail();
    this.renderOrders();
    this.renderOverview();
    this.showToast(`Statut de la commande #${order.id} mis à jour : ${order.statusLabel}`, 'success');
  }

  // ===================================================================
  // 8. CLIENTS
  // ===================================================================
  renderCustomers() {
    const tbody = document.getElementById('customers-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = this.state.customers.map(c => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="customer-avatar" style="background: var(--admin-card-inner); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--gold);">
              ${c.name.charAt(0)}
            </div>
            <div>
              <strong>${c.name}</strong>
              <div style="font-size: 0.72rem; color: var(--text-dim);">${c.city}</div>
            </div>
          </div>
        </td>
        <td><a href="tel:${c.phone}" style="color: var(--gold-light);">${c.phone}</a></td>
        <td>${c.email}</td>
        <td><strong>${c.ordersCount} commandes</strong></td>
        <td><strong>${c.totalSpent.toLocaleString('fr-FR')} FCFA</strong></td>
        <td style="font-size: 0.75rem; color: var(--text-muted);">${c.lastOrder}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="window.dashboard.openCustomerModal('${c.id}')">
            Fiche client
          </button>
        </td>
      </tr>
    `).join('');
  }

  openCreateCustomerModal() {
    const modalBox = document.getElementById('modal-generic-body');
    const modalTitle = document.getElementById('modal-generic-title');
    if (!modalBox || !modalTitle) return;

    modalTitle.textContent = "Ajouter un nouveau client";
    modalBox.innerHTML = `
      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Nom complet *</label>
        <input type="text" id="new-cust-name" class="form-input" placeholder="Ex: Souleymane Diallo" required>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Téléphone (Sénégal) *</label>
          <input type="text" id="new-cust-phone" class="form-input" placeholder="+221 77 123 45 67" required>
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input type="email" id="new-cust-email" class="form-input" placeholder="client@domaine.com">
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Adresse / Quartier à Dakar</label>
          <input type="text" id="new-cust-city" class="form-input" placeholder="Ex: Almadies, Mermoz...">
        </div>
        <div class="form-group">
          <label class="form-label">Catégorie Client</label>
          <select id="new-cust-status" class="form-select">
            <option value="Nouveau">Nouveau</option>
            <option value="Régulier">Régulier</option>
            <option value="VIP">VIP</option>
          </select>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem;">
        <button class="btn btn-secondary btn-sm" onclick="window.dashboard.closeModals()">Annuler</button>
        <button class="btn btn-primary btn-sm" onclick="window.dashboard.saveNewCustomer()">Enregistrer le client</button>
      </div>
    `;

    document.getElementById('admin-generic-modal')?.classList.add('active');
  }

  saveNewCustomer() {
    const name = document.getElementById('new-cust-name')?.value.trim();
    const phone = document.getElementById('new-cust-phone')?.value.trim();
    const email = document.getElementById('new-cust-email')?.value.trim() || 'client@freremixage.com';
    const city = document.getElementById('new-cust-city')?.value.trim() || 'Dakar';
    const status = document.getElementById('new-cust-status')?.value || 'Nouveau';

    if (!name || !phone) {
      this.showToast('Veuillez renseigner au moins le nom et le téléphone.', 'error');
      return;
    }

    this.state.customers.unshift({
      id: `cust-${Date.now()}`,
      name,
      phone,
      email,
      ordersCount: 0,
      totalSpent: 0,
      lastOrder: '—',
      city,
      status
    });

    this.saveState();
    this.closeModals();
    this.renderCustomers();
    this.showToast(`Client « ${name} » ajouté au répertoire.`, 'success');
  }

  openCustomerModal(custId) {
    const customer = this.state.customers.find(c => c.id === custId);
    if (!customer) return;

    const modalBox = document.getElementById('modal-generic-body');
    const modalTitle = document.getElementById('modal-generic-title');
    if (!modalBox || !modalTitle) return;

    modalTitle.textContent = `Fiche Client — ${customer.name}`;
    modalBox.innerHTML = `
      <div style="display: flex; gap: 1.5rem; margin-bottom: 1.5rem; align-items: center;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: var(--gold-gradient); color: #0A0A0D; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700;">
          ${customer.name.charAt(0)}
        </div>
        <div>
          <h3 style="font-size: 1.25rem; color: var(--text-main); margin-bottom: 2px;">${customer.name}</h3>
          <p style="font-size: 0.8rem; color: var(--gold-light);">Client ${customer.status} • ${customer.city}</p>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: var(--admin-card-inner); padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
        <div>
          <span style="font-size: 0.72rem; color: var(--text-dim); display: block;">Total Dépensé</span>
          <strong style="font-size: 1.1rem; color: var(--gold-light);">${customer.totalSpent.toLocaleString('fr-FR')} FCFA</strong>
        </div>
        <div>
          <span style="font-size: 0.72rem; color: var(--text-dim); display: block;">Commandes</span>
          <strong style="font-size: 1.1rem; color: var(--text-main);">${customer.ordersCount} passées</strong>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <a href="https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-secondary btn-sm" style="background: #25D366; color: #FFF; border: none;">Contacter sur WhatsApp</a>
        <button class="btn btn-primary btn-sm" onclick="window.dashboard.closeModals()">Fermer</button>
      </div>
    `;

    document.getElementById('admin-generic-modal')?.classList.add('active');
  }

  // ===================================================================
  // 8.1 MENSURATIONS CLIENTS & FICHES D'ATELIER
  // ===================================================================
  renderMeasurements() {
    const grid = document.getElementById('measurements-grid');
    if (!grid) return;

    // Mise à jour du badge de comptage dans le menu
    const badge = document.getElementById('nav-measurements-count');
    if (badge) badge.textContent = (this.state.measurements || []).length;

    const list = this.state.measurements || [];
    const searchInput = document.getElementById('measurements-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let filtered = list.filter(m => {
      // Filtre par catégorie
      if (this.currentMeasurementFilter === 'boubou') {
        const type = (m.garmentType || '').toLowerCase();
        if (!type.includes('boubou')) return false;
      } else if (this.currentMeasurementFilter === 'costume') {
        const type = (m.garmentType || '').toLowerCase();
        if (!type.includes('costume')) return false;
      } else if (this.currentMeasurementFilter === 'moderne') {
        const type = (m.garmentType || '').toLowerCase();
        if (!type.includes('lin') && !type.includes('moderne') && !type.includes('chemise')) return false;
      }

      // Filtre par recherche textuelle
      if (query) {
        const matchName = (m.clientName || '').toLowerCase().includes(query);
        const matchPhone = (m.clientPhone || '').toLowerCase().includes(query);
        const matchCity = (m.clientCity || '').toLowerCase().includes(query);
        const matchOccasion = (m.occasion || '').toLowerCase().includes(query);
        const matchGarment = (m.garmentType || '').toLowerCase().includes(query);
        return matchName || matchPhone || matchCity || matchOccasion || matchGarment;
      }

      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1.5rem; background: var(--admin-card); border: 1px dashed var(--gold-border); border-radius: var(--radius-md);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5" style="margin-bottom: 1rem;"><path d="M21.3 8.7 8.7 21.3c-.4.4-1 .4-1.4 0l-4.6-4.6c-.4-.4-.4-1 0-1.4L15.3 2.7c.4-.4 1-.4 1.4 0l4.6 4.6c.4.4.4 1 0 1.4z"/><path d="m7.5 13.5 2 2"/><path d="m10.5 10.5 2 2"/><path d="m13.5 7.5 2 2"/><path d="m16.5 4.5 2 2"/></svg>
          <h3 style="font-size: 1.2rem; color: #fff; margin-bottom: 0.5rem;">Aucune fiche de mensuration trouvée</h3>
          <p style="color: var(--text-dim); max-width: 420px; margin: 0 auto 1.5rem auto; font-size: 0.9rem;">
            Enregistrez les mensurations de vos clients pour confectionner leurs tenues et imprimer leur fiche d'atelier en 1 clic.
          </p>
          <button class="btn btn-primary" onclick="window.dashboard.navigateTo('add-measurement')">
            + Prendre les premières mesures
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(m => `
      <div class="measurement-card">
        <div>
          <div class="measurement-card-header">
            <div>
              <div class="measurement-client-title">${m.clientName}</div>
              <div class="measurement-client-meta">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span>${m.clientPhone}</span>
                ${m.clientCity ? `• <span>${m.clientCity}</span>` : ''}
              </div>
            </div>
            <span class="measurement-badge-garment">${m.occasion || 'Sur-Mesure'}</span>
          </div>

          <div style="font-size: 0.82rem; color: var(--gold-light); margin-bottom: 0.75rem; font-weight: 600;">
            👔 ${m.garmentType} • <span style="color: var(--text-dim);">${m.fitPreference || 'Coupe Royale'}</span>
          </div>

          <div class="measurement-metrics-section">
            <!-- Haut -->
            <div class="measurement-metrics-box">
              <div class="measurement-metrics-box-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
                Haut / Boubou
              </div>
              <div class="measurement-metrics-list">
                <div class="measurement-metrics-item"><span>Longueur :</span> <strong>${m.boubouLength ? m.boubouLength + ' cm' : '—'}</strong></div>
                <div class="measurement-metrics-item"><span>Épaules :</span> <strong>${m.shoulderWidth ? m.shoulderWidth + ' cm' : '—'}</strong></div>
                <div class="measurement-metrics-item"><span>Poitrine :</span> <strong>${m.chestCircumference ? m.chestCircumference + ' cm' : '—'}</strong></div>
                <div class="measurement-metrics-item"><span>Manches :</span> <strong>${m.sleeveLength ? m.sleeveLength + ' cm' : '—'}</strong></div>
              </div>
            </div>

            <!-- Bas -->
            <div class="measurement-metrics-box">
              <div class="measurement-metrics-box-title">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 2v20l4-2 4 2V2z"/><path d="M12 2v20l4-2 4 2V2z"/></svg>
                Bas / Pantalon
              </div>
              <div class="measurement-metrics-list">
                <div class="measurement-metrics-item"><span>Longueur :</span> <strong>${m.pantsLength ? m.pantsLength + ' cm' : '—'}</strong></div>
                <div class="measurement-metrics-item"><span>Ceinture :</span> <strong>${m.waistCircumference ? m.waistCircumference + ' cm' : '—'}</strong></div>
                <div class="measurement-metrics-item"><span>Bassin :</span> <strong>${m.hipsCircumference ? m.hipsCircumference + ' cm' : '—'}</strong></div>
                <div class="measurement-metrics-item"><span>Cuisse :</span> <strong>${m.thighCircumference ? m.thighCircumference + ' cm' : '—'}</strong></div>
              </div>
            </div>
          </div>

          ${m.notes ? `
            <div class="measurement-notes-preview">
              « ${m.notes} »
            </div>
          ` : ''}
        </div>

        <div class="measurement-card-actions">
          <div style="font-size: 0.72rem; color: var(--text-dim);">
            ${m.date || 'Août 2026'}
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm" title="Envoyer par WhatsApp" style="background: rgba(37, 211, 102, 0.15); color: #25D366; border-color: rgba(37, 211, 102, 0.3); padding: 4px 8px;" onclick="window.dashboard.sendMeasurementWhatsApp('${m.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.677.15-.2.301-.777.979-.953 1.18-.175.2-.351.226-.652.076-.301-.15-1.272-.469-2.424-1.496-.897-.799-1.503-1.786-1.68-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.2-.301.301-.501.1-.2.05-.376-.025-.527-.076-.15-.677-1.633-.928-2.235-.245-.586-.494-.506-.677-.516h-.577c-.2 0-.527.075-.803.376s-1.054 1.029-1.054 2.508c0 1.48 1.079 2.909 1.229 3.11.151.2 2.124 3.243 5.145 4.549.719.311 1.28.497 1.718.636.723.23 1.38.197 1.9.12.58-.087 1.78-.727 2.03-1.429.251-.702.251-1.304.176-1.43-.075-.125-.276-.201-.577-.351z"/></svg>
            </button>
            <button class="btn btn-secondary btn-sm" title="Imprimer la Fiche d'Atelier A4" style="padding: 4px 8px;" onclick="window.dashboard.openMeasurementSheetModal('${m.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            </button>
            <button class="btn btn-secondary btn-sm" title="Modifier" style="padding: 4px 8px;" onclick="window.dashboard.editMeasurement('${m.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </button>
            <button class="btn btn-secondary btn-sm" title="Supprimer" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.3); padding: 4px 8px;" onclick="window.dashboard.deleteMeasurement('${m.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  setMeasurementFilter(filter, btn) {
    this.currentMeasurementFilter = filter;
    const container = document.getElementById('measurements-filter-pills');
    if (container) {
      container.querySelectorAll('.filter-pill-btn').forEach(b => b.classList.remove('active'));
    }
    if (btn) btn.classList.add('active');
    this.renderMeasurements();
  }

  populateMeasurementDatalist() {
    const datalist = document.getElementById('mes-clients-datalist');
    if (!datalist) return;

    const customers = this.state.customers || [];
    datalist.innerHTML = customers.map(c => `
      <option value="${c.name}">Tél: ${c.phone} • ${c.city || 'Dakar'}</option>
    `).join('');

    // Remplissage automatique lors du choix du nom
    const nameInput = document.getElementById('mes-client-name');
    if (nameInput) {
      nameInput.onchange = () => {
        const found = customers.find(c => c.name.toLowerCase() === nameInput.value.toLowerCase());
        if (found) {
          const phoneInput = document.getElementById('mes-client-phone');
          const cityInput = document.getElementById('mes-client-city');
          if (phoneInput && !phoneInput.value) phoneInput.value = found.phone || '';
          if (cityInput && !cityInput.value) cityInput.value = found.city || '';
        }
      };
    }
  }

  resetMeasurementForm() {
    const form = document.getElementById('form-add-measurement');
    if (form) form.reset();
    const editId = document.getElementById('edit-measurement-id');
    if (editId) editId.value = '';
    const title = document.getElementById('add-measurement-title');
    if (title) title.textContent = "Prise de Mesures — Haute Couture";
    this.populateMeasurementDatalist();
  }

  handleSaveMeasurement(event, andWhatsApp = false) {
    if (event) event.preventDefault();

    const editId = document.getElementById('edit-measurement-id')?.value;
    const clientName = document.getElementById('mes-client-name')?.value.trim();
    const clientPhone = document.getElementById('mes-client-phone')?.value.trim();
    const clientCity = document.getElementById('mes-client-city')?.value.trim();
    const occasion = document.getElementById('mes-occasion')?.value.trim() || 'Haute Couture';
    const garmentType = document.getElementById('mes-garment-type')?.value;
    const fitPreference = document.getElementById('mes-fit-preference')?.value;

    const parseNum = (id) => {
      const val = parseFloat(document.getElementById(id)?.value);
      return isNaN(val) ? null : val;
    };

    const measurementData = {
      id: editId || `MES-${Math.floor(1000 + Math.random() * 9000)}`,
      clientName,
      clientPhone,
      clientCity,
      occasion,
      garmentType,
      fitPreference,
      date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
      // Haut
      boubouLength: parseNum('mes-boubou-length'),
      shoulderWidth: parseNum('mes-shoulder-width'),
      chestCircumference: parseNum('mes-chest-circ'),
      sleeveLength: parseNum('mes-sleeve-length'),
      neckCircumference: parseNum('mes-neck-circ'),
      bicepCircumference: parseNum('mes-bicep-circ'),
      wristCircumference: parseNum('mes-wrist-circ'),
      // Bas
      pantsLength: parseNum('mes-pants-length'),
      waistCircumference: parseNum('mes-waist-circ'),
      hipsCircumference: parseNum('mes-hips-circ'),
      thighCircumference: parseNum('mes-thigh-circ'),
      ankleWidth: parseNum('mes-ankle-width'),
      // Notes
      notes: document.getElementById('mes-notes')?.value.trim()
    };

    if (!this.state.measurements) this.state.measurements = [];

    if (editId) {
      const idx = this.state.measurements.findIndex(m => m.id === editId);
      if (idx !== -1) {
        this.state.measurements[idx] = measurementData;
      }
      this.showToast(`Fiche de mesures de ${clientName} mise à jour avec succès !`, 'success');
    } else {
      this.state.measurements.unshift(measurementData);
      
      // Synchroniser avec le fichier client s'il n'existe pas encore
      if (!this.state.customers) this.state.customers = [];
      const existingCustomer = this.state.customers.find(c => c.phone === clientPhone || c.name.toLowerCase() === clientName.toLowerCase());
      if (!existingCustomer) {
        this.state.customers.unshift({
          id: `cust-${Date.now()}`,
          name: clientName,
          phone: clientPhone,
          email: `${clientName.toLowerCase().replace(/\s+/g, '.')}@client.sn`,
          city: clientCity || 'Dakar',
          status: 'Actif',
          ordersCount: 1,
          totalSpent: 0,
          lastOrder: 'Fiche Mesure'
        });
      }

      this.showToast(`Nouvelle fiche de mesures enregistrée pour ${clientName} !`, 'success');
    }

    this.saveState();
    this.renderMeasurements();
    this.renderCustomers();

    if (andWhatsApp) {
      this.sendMeasurementWhatsApp(measurementData.id);
    }

    this.navigateTo('measurements');
  }

  saveAndShareMeasurementWhatsApp() {
    const form = document.getElementById('form-add-measurement');
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    this.handleSaveMeasurement(null, true);
  }

  editMeasurement(id) {
    const item = (this.state.measurements || []).find(m => m.id === id);
    if (!item) return;

    this.navigateTo('add-measurement');

    const setVal = (fieldId, val) => {
      const el = document.getElementById(fieldId);
      if (el) el.value = val !== null && val !== undefined ? val : '';
    };

    const title = document.getElementById('add-measurement-title');
    if (title) title.textContent = `Modifier les Mesures de ${item.clientName}`;

    setVal('edit-measurement-id', item.id);
    setVal('mes-client-name', item.clientName);
    setVal('mes-client-phone', item.clientPhone);
    setVal('mes-client-city', item.clientCity);
    setVal('mes-occasion', item.occasion);
    setVal('mes-garment-type', item.garmentType);
    setVal('mes-fit-preference', item.fitPreference);

    // Haut
    setVal('mes-boubou-length', item.boubouLength);
    setVal('mes-shoulder-width', item.shoulderWidth);
    setVal('mes-chest-circ', item.chestCircumference);
    setVal('mes-sleeve-length', item.sleeveLength);
    setVal('mes-neck-circ', item.neckCircumference);
    setVal('mes-bicep-circ', item.bicepCircumference);
    setVal('mes-wrist-circ', item.wristCircumference);

    // Bas
    setVal('mes-pants-length', item.pantsLength);
    setVal('mes-waist-circ', item.waistCircumference);
    setVal('mes-hips-circ', item.hipsCircumference);
    setVal('mes-thigh-circ', item.thighCircumference);
    setVal('mes-ankle-width', item.ankleWidth);

    // Notes
    setVal('mes-notes', item.notes);
  }

  deleteMeasurement(id) {
    const item = (this.state.measurements || []).find(m => m.id === id);
    if (!item) return;

    if (!confirm(`Confirmez-vous la suppression de la fiche de mesures de ${item.clientName} ?`)) return;

    this.state.measurements = this.state.measurements.filter(m => m.id !== id);
    this.saveState();
    this.renderMeasurements();
    this.showToast(`Fiche de mesures de ${item.clientName} supprimée.`, 'info');
  }

  sendMeasurementWhatsApp(id) {
    const m = (this.state.measurements || []).find(it => it.id === id);
    if (!m) return;

    const phoneClean = (m.clientPhone || '').replace(/[^0-9]/g, '');
    if (!phoneClean) {
      this.showToast('Numéro WhatsApp manquant pour ce client.', 'error');
      return;
    }

    const hautLines = [];
    if (m.boubouLength) hautLines.push(`• Longueur Boubou / Veste : ${m.boubouLength} cm`);
    if (m.shoulderWidth) hautLines.push(`• Carrure (Épaules) : ${m.shoulderWidth} cm`);
    if (m.chestCircumference) hautLines.push(`• Tour de Poitrine : ${m.chestCircumference} cm`);
    if (m.sleeveLength) hautLines.push(`• Longueur Manches : ${m.sleeveLength} cm`);
    if (m.neckCircumference) hautLines.push(`• Tour de Cou : ${m.neckCircumference} cm`);
    if (m.bicepCircumference) hautLines.push(`• Tour de Bras : ${m.bicepCircumference} cm`);
    if (m.wristCircumference) hautLines.push(`• Poignet : ${m.wristCircumference} cm`);

    const basLines = [];
    if (m.pantsLength) basLines.push(`• Longueur Pantalon : ${m.pantsLength} cm`);
    if (m.waistCircumference) basLines.push(`• Tour de Taille / Ceinture : ${m.waistCircumference} cm`);
    if (m.hipsCircumference) basLines.push(`• Bassin / Hanches : ${m.hipsCircumference} cm`);
    if (m.thighCircumference) basLines.push(`• Cuisse : ${m.thighCircumference} cm`);
    if (m.ankleWidth) basLines.push(`• Bas Pantalon : ${m.ankleWidth} cm`);

    const msg = `⚜️ *MAISON FRÈRE MIXAGE — DAKAR* ⚜️\n_Haute Couture Masculine Sénégalaise_\n\n` +
      `Bonjour *${m.clientName}*,\n` +
      `Voici votre fiche de mensurations officielle enregistrée à l'Atelier :\n\n` +
      `📌 *Détails Commande :*\n` +
      `• Tenue : ${m.garmentType || 'Création Sur-Mesure'}\n` +
      `• Coupe : ${m.fitPreference || 'Coupe Royale'}\n` +
      `• Événement : ${m.occasion || 'Cérémonie'}\n\n` +
      `📐 *Mesures du Haut :*\n` + (hautLines.length > 0 ? hautLines.join('\n') : '• Standard atelier') + '\n\n' +
      `📏 *Mesures du Bas (Pantalon) :*\n` + (basLines.length > 0 ? basLines.join('\n') : '• Standard atelier') + '\n\n' +
      (m.notes ? `💡 *Remarques Atelier :* _« ${m.notes} »_\n\n` : '') +
      `Vos mesures sont conservées pour toutes vos prochaines créations chez Frère Mixage.\n` +
      `Merci pour votre confiance ! ✨`;

    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  openMeasurementSheetModal(id) {
    const m = (this.state.measurements || []).find(it => it.id === id);
    if (!m) return;

    const modalBox = document.getElementById('modal-generic-body');
    const modalTitle = document.getElementById('modal-generic-title');
    if (!modalBox || !modalTitle) return;

    modalTitle.textContent = `Fiche d'Atelier Sur-Mesure — ${m.clientName}`;

    modalBox.innerHTML = `
      <div class="atelier-sheet-modal-box" id="printable-atelier-sheet">
        <div class="atelier-sheet-header">
          <div>
            <img src="/assets/images/logo-frere-mixage.png" alt="Frère Mixage" class="atelier-sheet-logo" />
            <div style="font-size: 0.75rem; color: var(--gold); margin-top: 4px; letter-spacing: 1px;">HAUTE COUTURE DAKAR</div>
          </div>
          <div style="text-align: right;">
            <span class="atelier-sheet-badge">FICHE ATELIER #${m.id}</span>
            <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 6px;">Date : ${m.date || 'Août 2026'}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; background: rgba(255,255,255,0.03); padding: 1.25rem; border-radius: 6px; border: 1px solid var(--gold-border); margin-bottom: 1.5rem;">
          <div>
            <div style="font-size: 0.75rem; color: var(--gold); text-transform: uppercase; margin-bottom: 3px;">CLIENT PRIVILÈGE</div>
            <strong style="font-size: 1.15rem; color: #fff;">${m.clientName}</strong>
            <div style="font-size: 0.85rem; color: var(--text-dim); margin-top: 3px;">📞 ${m.clientPhone}</div>
            ${m.clientCity ? `<div style="font-size: 0.85rem; color: var(--text-dim);">📍 ${m.clientCity}</div>` : ''}
          </div>
          <div>
            <div style="font-size: 0.75rem; color: var(--gold); text-transform: uppercase; margin-bottom: 3px;">CONFECTION & COUPE</div>
            <strong style="font-size: 1rem; color: var(--gold-light);">${m.garmentType || 'Sur-Mesure'}</strong>
            <div style="font-size: 0.85rem; color: var(--text-dim); margin-top: 3px;">Coupe : ${m.fitPreference || 'Royale'}</div>
            <div style="font-size: 0.85rem; color: var(--text-dim);">Événement : ${m.occasion || 'Cérémonie'}</div>
          </div>
        </div>

        <table class="atelier-sheet-table">
          <thead>
            <tr>
              <th colspan="2" style="width: 50%;">MESURES DU HAUT (BOUBOU / VESTE)</th>
              <th colspan="2" style="width: 50%;">MESURES DU BAS (PANTALON)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Longueur Boubou / Veste</td>
              <td><strong>${m.boubouLength ? m.boubouLength + ' cm' : '—'}</strong></td>
              <td>Longueur Pantalon</td>
              <td><strong>${m.pantsLength ? m.pantsLength + ' cm' : '—'}</strong></td>
            </tr>
            <tr>
              <td>Carrure (Épaules)</td>
              <td><strong>${m.shoulderWidth ? m.shoulderWidth + ' cm' : '—'}</strong></td>
              <td>Tour de Ceinture / Taille</td>
              <td><strong>${m.waistCircumference ? m.waistCircumference + ' cm' : '—'}</strong></td>
            </tr>
            <tr>
              <td>Tour de Poitrine</td>
              <td><strong>${m.chestCircumference ? m.chestCircumference + ' cm' : '—'}</strong></td>
              <td>Tour de Bassin / Hanches</td>
              <td><strong>${m.hipsCircumference ? m.hipsCircumference + ' cm' : '—'}</strong></td>
            </tr>
            <tr>
              <td>Longueur Manches</td>
              <td><strong>${m.sleeveLength ? m.sleeveLength + ' cm' : '—'}</strong></td>
              <td>Tour de Cuisse</td>
              <td><strong>${m.thighCircumference ? m.thighCircumference + ' cm' : '—'}</strong></td>
            </tr>
            <tr>
              <td>Tour de Cou (Col)</td>
              <td><strong>${m.neckCircumference ? m.neckCircumference + ' cm' : '—'}</strong></td>
              <td>Bas de Pantalon (Cheville)</td>
              <td><strong>${m.ankleWidth ? m.ankleWidth + ' cm' : '—'}</strong></td>
            </tr>
            <tr>
              <td>Tour de Bras (Biceps)</td>
              <td><strong>${m.bicepCircumference ? m.bicepCircumference + ' cm' : '—'}</strong></td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>Tour de Poignet</td>
              <td><strong>${m.wristCircumference ? m.wristCircumference + ' cm' : '—'}</strong></td>
              <td>—</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>

        ${m.notes ? `
          <div style="background: rgba(198, 168, 104, 0.08); border-left: 3px solid var(--gold); padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem;">
            <div style="font-size: 0.75rem; color: var(--gold); font-weight: 700; text-transform: uppercase; margin-bottom: 4px;">NOTES TECHNIQUES POUR LES MAÎTRES TAILLEURS :</div>
            <div style="font-size: 0.9rem; color: #fff; font-style: italic;">« ${m.notes} »</div>
          </div>
        ` : ''}

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 2rem;">
          <button class="btn btn-secondary btn-sm" onclick="window.dashboard.closeModals()">Fermer</button>
          <button class="btn btn-secondary btn-sm" style="background: #25D366; color: #fff; border: none;" onclick="window.dashboard.sendMeasurementWhatsApp('${m.id}')">
            Envoyer sur WhatsApp
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.print()">
            🖨️ Imprimer la Fiche Atelier
          </button>
        </div>
      </div>
    `;

    document.getElementById('admin-generic-modal')?.classList.add('active');
  }

  // ===================================================================
  // 9. FACTURES & DEVIS (LIVE PREVIEW & BUILDER)
  // ===================================================================
  renderInvoices() {
    const tbody = document.getElementById('invoices-table-tbody');
    const searchInput = document.getElementById('invoices-search-input');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

    if (!tbody) return;

    let filtered = this.state.invoices || [];

    if (this.currentInvoiceFilter === 'invoice') {
      filtered = filtered.filter(i => i.type === 'invoice');
    } else if (this.currentInvoiceFilter === 'quote') {
      filtered = filtered.filter(i => i.type === 'quote');
    } else if (this.currentInvoiceFilter === 'paid') {
      filtered = filtered.filter(i => i.status === 'paid');
    } else if (this.currentInvoiceFilter === 'pending') {
      filtered = filtered.filter(i => i.status === 'pending');
    }

    if (query) {
      filtered = filtered.filter(i => 
        i.id.toLowerCase().includes(query) || 
        i.customerName.toLowerCase().includes(query) ||
        i.customerPhone.includes(query)
      );
    }

    document.querySelectorAll('#invoices-filters .filter-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-ifilter') === this.currentInvoiceFilter);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 3rem 1rem; color: var(--text-dim);">
            Aucun document de facturation trouvé.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(inv => {
      const typeBadge = inv.type === 'invoice' 
        ? '<span class="badge invoice-badge-invoice">Facture</span>'
        : '<span class="badge invoice-badge-quote">Devis</span>';

      const statusBadge = inv.status === 'paid'
        ? '<span class="badge badge-delivered">Payée</span>'
        : inv.status === 'pending'
          ? '<span class="badge badge-preparing">En attente</span>'
          : '<span class="badge badge-draft">Brouillon</span>';

      return `
        <tr>
          <td><strong style="color: var(--gold-light);">${inv.id}</strong></td>
          <td>${typeBadge}</td>
          <td>
            <div>
              <strong>${inv.customerName}</strong>
              <div style="font-size: 0.72rem; color: var(--text-dim);">${inv.customerPhone}</div>
            </div>
          </td>
          <td style="font-size: 0.75rem; color: var(--text-muted);">${inv.issueDate}</td>
          <td style="font-size: 0.75rem; color: var(--text-dim);">${inv.dueDate}</td>
          <td><strong>${inv.totalAmount.toLocaleString('fr-FR')} FCFA</strong></td>
          <td>${statusBadge}</td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary btn-sm" onclick="window.dashboard.openInvoicePreviewModal('${inv.id}')" title="Aperçu et impression">
                Aperçu / Imprimer
              </button>
              <button class="btn-action-icon danger" title="Supprimer" onclick="window.dashboard.deleteInvoice('${inv.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  setupInvoiceForm() {
    const form = document.getElementById('form-create-invoice');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveInvoice();
      });
    }
  }

  initCreateInvoiceForm() {
    const datalist = document.getElementById('inv-existing-customers-list');
    if (datalist) {
      datalist.innerHTML = this.state.customers.map(c => `
        <option value="${c.name}">${c.phone} - ${c.city || 'Dakar'}</option>
      `).join('');
    }

    const nameInput = document.getElementById('inv-customer-name');
    const phoneInput = document.getElementById('inv-customer-phone');
    const emailInput = document.getElementById('inv-customer-email');
    const addressInput = document.getElementById('inv-customer-address');

    if (this.state.customers.length > 0 && nameInput && !nameInput.value) {
      const first = this.state.customers[0];
      nameInput.value = first.name;
      if (phoneInput) phoneInput.value = first.phone;
      if (emailInput) emailInput.value = first.email || '';
      if (addressInput) addressInput.value = first.address || first.city || 'Dakar';
    }

    if (!this.invoiceLines || this.invoiceLines.length === 0) {
      this.invoiceLines = [
        { description: 'Grand Boubou Royal Getzner (Broderies Or)', quantity: 1, unitPrice: 150000 }
      ];
    }

    this.renderInvoiceCompactLines();
    this.updateLiveInvoicePreview();
  }

  handleCustomerNameInput(name) {
    const trimmed = (name || '').trim().toLowerCase();
    const existing = this.state.customers.find(c => c.name.toLowerCase() === trimmed);
    if (existing) {
      const phoneInput = document.getElementById('inv-customer-phone');
      const emailInput = document.getElementById('inv-customer-email');
      const addressInput = document.getElementById('inv-customer-address');
      if (phoneInput && existing.phone) phoneInput.value = existing.phone;
      if (emailInput && existing.email) emailInput.value = existing.email;
      if (addressInput && (existing.address || existing.city)) addressInput.value = existing.address || existing.city;
    }
    this.updateLiveInvoicePreview();
  }

  renderInvoiceCompactLines() {
    const container = document.getElementById('invoice-compact-lines-container');
    if (!container) return;

    container.innerHTML = this.invoiceLines.map((line, idx) => `
      <div class="line-item-compact-row">
        <input type="text" class="form-input" placeholder="Description de la prestation" value="${line.description}" oninput="window.dashboard.updateCompactLine(${idx}, 'description', this.value)" required>
        <input type="number" min="1" class="form-input" style="text-align: center;" placeholder="Qté" value="${line.quantity}" oninput="window.dashboard.updateCompactLine(${idx}, 'quantity', parseInt(this.value, 10) || 1)" required>
        <input type="number" min="0" class="form-input" placeholder="Prix Unit." value="${line.unitPrice}" oninput="window.dashboard.updateCompactLine(${idx}, 'unitPrice', parseFloat(this.value) || 0)" required>
        <button type="button" class="btn-action-icon danger" onclick="window.dashboard.removeInvoiceLineCompact(${idx})" title="Supprimer la ligne">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    `).join('');
  }

  addInvoiceLineCompact() {
    this.invoiceLines.push({
      description: 'Tenue sur-mesure Frère Mixage',
      quantity: 1,
      unitPrice: 120000
    });
    this.renderInvoiceCompactLines();
    this.updateLiveInvoicePreview();
  }

  removeInvoiceLineCompact(index) {
    this.invoiceLines.splice(index, 1);
    if (this.invoiceLines.length === 0) {
      this.invoiceLines.push({ description: '', quantity: 1, unitPrice: 0 });
    }
    this.renderInvoiceCompactLines();
    this.updateLiveInvoicePreview();
  }

  updateCompactLine(index, field, value) {
    if (this.invoiceLines[index]) {
      this.invoiceLines[index][field] = value;
      this.updateLiveInvoicePreview();
    }
  }

  handleTaxToggle(type) {
    const brs = document.getElementById('toggle-brs');
    const tva = document.getElementById('toggle-tva');

    if (type === 'brs' && brs?.checked) {
      if (tva) tva.checked = false;
    } else if (type === 'tva' && tva?.checked) {
      if (brs) brs.checked = false;
    }
    this.updateLiveInvoicePreview();
  }

  updateLiveInvoicePreview() {
    let subtotal = 0;
    this.invoiceLines.forEach(l => {
      subtotal += (l.quantity || 1) * (l.unitPrice || 0);
    });

    const isBRS = document.getElementById('toggle-brs')?.checked;
    const isTVA = document.getElementById('toggle-tva')?.checked;

    let taxRate = 0;
    let taxLabel = 'Sans taxe';
    if (isBRS) {
      taxRate = 0.05;
      taxLabel = 'BRS 5%';
    } else if (isTVA) {
      taxRate = 0.18;
      taxLabel = 'TVA 18%';
    }

    const taxAmount = Math.round(subtotal * taxRate);
    const grandTotal = subtotal + taxAmount;

    const custName = document.getElementById('inv-customer-name')?.value.trim() || 'Client Particulier';
    const custPhone = document.getElementById('inv-customer-phone')?.value.trim() || '+221 77 000 00 00';
    const custAddress = document.getElementById('inv-customer-address')?.value.trim() || 'Dakar, Sénégal';

    const clientNameEl = document.getElementById('sheet-client-name-display');
    const clientDetailsEl = document.getElementById('sheet-client-details-display');
    if (clientNameEl) clientNameEl.textContent = custName;
    if (clientDetailsEl) clientDetailsEl.textContent = `${custAddress} • ${custPhone}`;

    const subHtEl = document.getElementById('form-subtotal-ht');
    if (subHtEl) subHtEl.textContent = `${subtotal.toLocaleString('fr-FR')} FCFA`;

    const taxLabelEl = document.getElementById('form-tax-label');
    if (taxLabelEl) taxLabelEl.textContent = taxLabel;

    const taxAmountEl = document.getElementById('form-tax-amount');
    if (taxAmountEl) taxAmountEl.textContent = `${taxAmount.toLocaleString('fr-FR')} FCFA`;

    const totalTtcEl = document.getElementById('form-total-ttc');
    if (totalTtcEl) totalTtcEl.textContent = `${grandTotal.toLocaleString('fr-FR')} FCFA`;

    const notesVal = document.getElementById('inv-notes-input')?.value;

    const sheetRefDate = document.getElementById('sheet-date-text');
    if (sheetRefDate) sheetRefDate.textContent = new Date().toLocaleDateString('fr-FR');

    const sheetTableTbody = document.getElementById('sheet-items-tbody');
    if (sheetTableTbody) {
      sheetTableTbody.innerHTML = this.invoiceLines.map(l => {
        const lineTot = (l.quantity || 1) * (l.unitPrice || 0);
        return `
          <tr>
            <td><strong>${l.description || 'Prestation sur mesure'}</strong></td>
            <td style="text-align: center;">${l.quantity || 1}</td>
            <td class="num">${(l.unitPrice || 0).toLocaleString('fr-FR')} FCFA</td>
            <td class="num"><strong>${lineTot.toLocaleString('fr-FR')} FCFA</strong></td>
          </tr>
        `;
      }).join('');
    }

    const sheetSubtotal = document.getElementById('sheet-subtotal-display');
    if (sheetSubtotal) sheetSubtotal.textContent = `${subtotal.toLocaleString('fr-FR')} FCFA`;

    const sheetTaxRow = document.getElementById('sheet-tax-row');
    const sheetTaxLabel = document.getElementById('sheet-tax-label');
    const sheetTaxDisplay = document.getElementById('sheet-tax-display');
    if (taxRate > 0) {
      if (sheetTaxRow) sheetTaxRow.style.display = 'flex';
      if (sheetTaxLabel) sheetTaxLabel.textContent = taxLabel;
      if (sheetTaxDisplay) sheetTaxDisplay.textContent = `${taxAmount.toLocaleString('fr-FR')} FCFA`;
    } else {
      if (sheetTaxRow) sheetTaxRow.style.display = 'none';
    }

    const sheetGrandTot = document.getElementById('sheet-grand-total-display');
    if (sheetGrandTot) sheetGrandTot.textContent = `${grandTotal.toLocaleString('fr-FR')} FCFA`;

    const sheetNotes = document.getElementById('sheet-footer-notice-text');
    if (sheetNotes && notesVal) {
      sheetNotes.textContent = notesVal;
    }

    return { subtotal, taxAmount, grandTotal };
  }

  saveInvoice() {
    const custName = document.getElementById('inv-customer-name')?.value.trim();
    const custPhone = document.getElementById('inv-customer-phone')?.value.trim();
    const custEmail = document.getElementById('inv-customer-email')?.value.trim();
    const custAddress = document.getElementById('inv-customer-address')?.value.trim() || 'Dakar, Sénégal';

    if (!custName || !custPhone) {
      this.showToast('Veuillez renseigner le nom et le téléphone du client.', 'error');
      return;
    }

    const project = document.getElementById('inv-project-select')?.value || 'Aucun projet';
    const subject = document.getElementById('inv-subject')?.value.trim() || 'Prestation de couture';
    const status = document.getElementById('inv-status')?.value || 'Emise';
    const dueDate = document.getElementById('inv-due-date')?.value || '2026-08-27';
    const notes = document.getElementById('inv-notes-input')?.value.trim();

    const { subtotal, taxAmount, grandTotal } = this.updateLiveInvoicePreview();
    const invNumber = `FM-FAC-2026-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Synchronisation automatique du client dans le fichier Clients
    let existingCust = this.state.customers.find(c => 
      c.name.toLowerCase() === custName.toLowerCase() || 
      (custPhone && c.phone.replace(/[^0-9]/g, '') === custPhone.replace(/[^0-9]/g, ''))
    );

    if (!existingCust) {
      existingCust = {
        id: `cust-${Date.now()}`,
        name: custName,
        phone: custPhone,
        email: custEmail || `${custName.toLowerCase().replace(/\s+/g, '.')}@client.sn`,
        city: custAddress,
        address: custAddress,
        totalOrders: 1,
        totalSpent: grandTotal,
        lastOrderDate: new Date().toISOString().split('T')[0],
        status: 'Actif',
        avatar: '/assets/images/ab8459f150d5d7db346654de338434e5.jpg'
      };
      this.state.customers.unshift(existingCust);
    } else {
      existingCust.totalOrders = (existingCust.totalOrders || 0) + 1;
      existingCust.totalSpent = (existingCust.totalSpent || 0) + grandTotal;
      existingCust.lastOrderDate = new Date().toISOString().split('T')[0];
      if (custAddress) existingCust.address = custAddress;
      if (custPhone) existingCust.phone = custPhone;
      if (custEmail) existingCust.email = custEmail;
    }

    const newInvoice = {
      id: invNumber,
      type: 'invoice',
      typeLabel: 'Facture',
      customerName: custName,
      customerPhone: custPhone,
      customerEmail: custEmail,
      customerAddress: custAddress,
      project,
      subject,
      issueDate: new Date().toISOString().substring(0, 10),
      dueDate,
      status: status === 'Payée' ? 'paid' : 'pending',
      statusLabel: status,
      paymentMethod: 'Wave Sénégal',
      items: this.invoiceLines.map(l => ({
        description: l.description,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        total: (l.quantity || 1) * (l.unitPrice || 0)
      })),
      subtotal,
      taxAmount,
      totalAmount: grandTotal,
      notes
    };

    if (!this.state.invoices) this.state.invoices = [];
    this.state.invoices.unshift(newInvoice);

    this.state.recentActivity.unshift({
      type: 'invoice_created',
      title: `Facture #${invNumber} créée`,
      detail: `${custName} — ${grandTotal.toLocaleString('fr-FR')} FCFA`,
      time: 'À l’instant'
    });

    this.saveState();
    this.renderCustomers();
    this.renderInvoices();
    this.renderOverview();
    this.showToast(`Facture #${invNumber} enregistrée & Client "${custName}" synchronisé !`, 'success');
    this.navigateTo('invoices');
  }

  openInvoicePreviewModal(invoiceId) {
    const inv = this.state.invoices?.find(i => i.id === invoiceId);
    if (!inv) return;

    this.displayInvoiceModal(inv);
  }

  displayInvoiceModal(inv) {
    const modalBox = document.getElementById('modal-generic-body');
    const modalTitle = document.getElementById('modal-generic-title');
    if (!modalBox || !modalTitle) return;

    modalTitle.textContent = `${inv.typeLabel} Officielle — #${inv.id}`;

    modalBox.innerHTML = `
      <div class="invoice-sheet-dark-a4" id="invoice-sheet-print" style="margin: 0 auto; max-width: 650px;">
        
        <div class="sheet-top-grid">
          <div>
            <img src="../assets/images/logo-frere-mixage.png" alt="Frère Mixage" class="sheet-logo" />
          </div>
          <div class="sheet-company-meta">
            <strong>Dakar, Sénégal</strong><br>
            contact@freremixage.com<br>
            +221 77 000 00 00<br>
            NINEA : 012431722<br>
            RC : SN DKR A 34285
          </div>
        </div>

        <div class="sheet-title-box">
          <h2 class="sheet-main-title">${inv.typeLabel || 'FACTURE'}</h2>
          <div class="sheet-ref-date">
            #${inv.id}<br>
            Date : ${inv.issueDate}
          </div>
        </div>

        <div class="sheet-destinataire-box">
          <span class="sheet-section-tag">DESTINATAIRE</span>
          <div class="sheet-client-name">${inv.customerName}</div>
          <div class="sheet-client-details">${inv.customerAddress} • ${inv.customerPhone}</div>
        </div>

        <table class="sheet-table">
          <thead>
            <tr>
              <th>DESCRIPTION</th>
              <th style="width: 50px; text-align: center;">QTÉ</th>
              <th class="num">PRIX UNIT.</th>
              <th class="num">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${inv.items.map(it => `
              <tr>
                <td><strong>${it.description}</strong></td>
                <td style="text-align: center;">${it.quantity}</td>
                <td class="num">${it.unitPrice.toLocaleString('fr-FR')} FCFA</td>
                <td class="num"><strong>${it.total.toLocaleString('fr-FR')} FCFA</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="sheet-totals-box">
          <div class="sheet-total-row">
            <span>Sous-total HT</span>
            <strong>${inv.subtotal.toLocaleString('fr-FR')} FCFA</strong>
          </div>
          ${inv.taxAmount > 0 ? `
            <div class="sheet-total-row">
              <span>TVA (18%)</span>
              <strong>${inv.taxAmount.toLocaleString('fr-FR')} FCFA</strong>
            </div>
          ` : ''}
          <div class="sheet-grand-total-banner">
            <span>TOTAL TTC</span>
            <span>${inv.totalAmount.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        <div class="sheet-footer-notice">
          ${inv.notes || 'Merci de votre confiance. Paiement par Wave Business ou virement bancaire. | contact@freremixage.com | +221 77 000 00 00'}
        </div>

      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; border-top: 1px solid var(--border-subtle); padding-top: 1rem;">
        <button class="btn btn-secondary btn-sm" onclick="window.dashboard.closeModals()">Fermer</button>
        <div style="display: flex; gap: 10px;">
          <a href="https://wa.me/${inv.customerPhone.replace(/[^0-9]/g, '')}?text=Bonjour%20${encodeURIComponent(inv.customerName)},%20voici%20votre%20facture%20Frère%20Mixage%20${inv.id}%20d'un%20montant%20de%20${inv.totalAmount.toLocaleString('fr-FR')}%20FCFA." target="_blank" class="btn btn-secondary btn-sm" style="background: #25D366; color: #FFF; border: none;">
            WhatsApp
          </a>
          <button class="btn btn-primary btn-sm" onclick="window.print()">
            Imprimer / PDF
          </button>
        </div>
      </div>
    `;

    document.getElementById('admin-generic-modal')?.classList.add('active');
  }

  deleteInvoice(invoiceId) {
    if (!confirm(`Supprimer le document #${invoiceId} ?`)) return;
    this.state.invoices = this.state.invoices.filter(i => i.id !== invoiceId);
    this.saveState();
    this.renderInvoices();
    this.showToast(`Document #${invoiceId} supprimé.`, 'info');
  }

  // ===================================================================
  // 10. ÉQUIPE
  // ===================================================================
  renderTeam() {
    const tbody = document.getElementById('team-table-tbody');
    if (!tbody) return;

    tbody.innerHTML = this.state.team.map(m => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${m.avatar}" class="team-avatar" alt="${m.name}">
            <div>
              <strong>${m.name}</strong>
              <div style="font-size: 0.72rem; color: var(--text-dim);">${m.joinedDate}</div>
            </div>
          </div>
        </td>
        <td>${m.email}</td>
        <td>
          <span class="badge ${m.role === 'owner' ? 'badge-confirmed' : 'badge-preparing'}">
            ${m.role === 'owner' ? 'PROPRIÉTAIRE' : 'ASSISTANT'}
          </span>
        </td>
        <td><span class="badge badge-published">${m.status}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="window.dashboard.showToast('Gestion des permissions réservée au propriétaire.', 'info')">
            Gérer
          </button>
        </td>
      </tr>
    `).join('');
  }

  openInviteMemberModal() {
    const modalBox = document.getElementById('modal-generic-body');
    const modalTitle = document.getElementById('modal-generic-title');
    if (!modalBox || !modalTitle) return;

    modalTitle.textContent = "Inviter un collaborateur dans l'équipe";
    modalBox.innerHTML = `
      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Nom complet</label>
        <input type="text" id="invite-name" class="form-input" placeholder="Ex: Modou Fall">
      </div>
      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Adresse Email</label>
        <input type="email" id="invite-email" class="form-input" placeholder="modou@freremixage.com">
      </div>
      <div class="form-group" style="margin-bottom: 1.5rem;">
        <label class="form-label">Rôle</label>
        <select id="invite-role" class="form-select">
          <option value="assistant">Assistant (Gestion des commandes & produits)</option>
          <option value="owner">Propriétaire (Accès total)</option>
        </select>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary btn-sm" onclick="window.dashboard.closeModals()">Annuler</button>
        <button class="btn btn-primary btn-sm" onclick="window.dashboard.sendTeamInvite()">Envoyer l'invitation</button>
      </div>
    `;

    document.getElementById('admin-generic-modal')?.classList.add('active');
  }

  sendTeamInvite() {
    const name = document.getElementById('invite-name')?.value.trim();
    const email = document.getElementById('invite-email')?.value.trim();
    const role = document.getElementById('invite-role')?.value;

    if (!name || !email) {
      this.showToast('Veuillez renseigner le nom et l’email.', 'error');
      return;
    }

    this.state.team.push({
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      roleLabel: role === 'owner' ? 'Propriétaire' : 'Assistant',
      avatar: '/assets/images/hero-frere-mixage.jpg',
      status: 'Actif',
      joinedDate: 'Aujourd’hui'
    });

    this.saveState();
    this.closeModals();
    this.renderTeam();
    this.showToast(`Invitation envoyée à ${email}.`, 'success');
  }

  // ===================================================================
  // 11. PARAMÈTRES
  // ===================================================================
  setupSettingsForm() {
    const form = document.getElementById('form-settings');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings();
      });
    }
  }

  renderSettings() {
    const s = this.state.settings;
    if (!s) return;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('setting-brand-name', s.brandName);
    setVal('setting-phone', s.phone);
    setVal('setting-whatsapp', s.whatsapp);
    setVal('setting-email', s.email);
    setVal('setting-address', s.address);
    setVal('setting-city', s.city);
    setVal('setting-dakar-delivery', s.deliveryDakar);
    setVal('setting-regions-delivery', s.deliveryRegions);
    setVal('setting-banner-message', s.bannerMessage);
  }

  saveSettings() {
    const s = this.state.settings;
    s.brandName = document.getElementById('setting-brand-name')?.value || s.brandName;
    s.phone = document.getElementById('setting-phone')?.value || s.phone;
    s.whatsapp = document.getElementById('setting-whatsapp')?.value || s.whatsapp;
    s.email = document.getElementById('setting-email')?.value || s.email;
    s.address = document.getElementById('setting-address')?.value || s.address;
    s.city = document.getElementById('setting-city')?.value || s.city;
    s.deliveryDakar = document.getElementById('setting-dakar-delivery')?.value || s.deliveryDakar;
    s.deliveryRegions = document.getElementById('setting-regions-delivery')?.value || s.deliveryRegions;
    s.bannerMessage = document.getElementById('setting-banner-message')?.value || s.bannerMessage;

    this.saveState();
    this.showToast('Paramètres de Frère Mixage enregistrés avec succès !', 'success');
  }

  // ===================================================================
  // 10. TÉMOIGNAGES & AVIS
  // ===================================================================
  renderTestimonials() {
    const tbody = document.getElementById('testimonials-table-tbody');
    if (!tbody) return;

    if (!this.state.testimonials || this.state.testimonials.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
            Aucun témoignage enregistré pour le moment.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.state.testimonials.map(t => {
      const stars = '★'.repeat(t.rating || 5) + '☆'.repeat(5 - (t.rating || 5));
      const isActive = t.isActive !== false;
      return `
        <tr>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${t.avatar || '/assets/images/ab8459f150d5d7db346654de338434e5.jpg'}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1px solid var(--gold-border);" alt="${t.name}">
              <div>
                <strong>${t.name}</strong>
              </div>
            </div>
          </td>
          <td>
            <span style="font-size: 0.78rem; color: var(--text-muted);">${t.role || 'Dakar • Client vérifié'}</span>
          </td>
          <td>
            <span style="color: var(--gold); font-size: 0.85rem; letter-spacing: 2px;">${stars}</span>
          </td>
          <td style="max-width: 260px;">
            <div style="font-size: 0.76rem; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${t.quote}">
              « ${t.quote} »
            </div>
          </td>
          <td>
            <span class="badge ${isActive ? 'badge-confirmed' : 'badge-draft'}" style="cursor: pointer;" onclick="window.dashboard.toggleTestimonialActive('${t.id}')" title="Cliquer pour basculer">
              ${isActive ? 'Actif sur le site' : 'Masqué'}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn btn-secondary btn-sm" onclick="window.dashboard.openCreateTestimonialModal('${t.id}')">
                Modifier
              </button>
              <button class="btn-action-icon danger" title="Supprimer" onclick="window.dashboard.deleteTestimonial('${t.id}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  openCreateTestimonialModal(testimonialId = null) {
    const modalBox = document.getElementById('modal-generic-body');
    const modalTitle = document.getElementById('modal-generic-title');
    if (!modalBox || !modalTitle) return;

    let item = {
      id: '',
      name: '',
      role: 'Dakar, Sénégal • Client vérifié',
      rating: 5,
      quote: '',
      avatar: '/assets/images/ab8459f150d5d7db346654de338434e5.jpg',
      isActive: true
    };

    if (testimonialId) {
      const found = this.state.testimonials.find(t => t.id === testimonialId);
      if (found) item = { ...found };
      modalTitle.textContent = "Modifier le Témoignage Client";
    } else {
      modalTitle.textContent = "Ajouter un Témoignage Client";
    }

    modalBox.innerHTML = `
      <input type="hidden" id="modal-test-id" value="${item.id}">
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Nom complet du client *</label>
          <input type="text" id="modal-test-name" class="form-input" placeholder="Ex: Ousmane Ba" value="${item.name}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Ville / Rôle / Statut *</label>
          <input type="text" id="modal-test-role" class="form-input" placeholder="Ex: Dakar, Sénégal • Client vérifié" value="${item.role}" required>
        </div>
      </div>
      <div class="form-row-2">
        <div class="form-group">
          <label class="form-label">Note (sur 5 étoiles) *</label>
          <select id="modal-test-rating" class="form-select">
            <option value="5" ${item.rating === 5 ? 'selected' : ''}>★★★★★ (5 étoiles - Parfait)</option>
            <option value="4" ${item.rating === 4 ? 'selected' : ''}>★★★★☆ (4 étoiles - Très bon)</option>
            <option value="3" ${item.rating === 3 ? 'selected' : ''}>★★★☆☆ (3 étoiles - Bon)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Visibilité sur le site</label>
          <select id="modal-test-active" class="form-select">
            <option value="true" ${item.isActive ? 'selected' : ''}>Afficher sur la page d'accueil</option>
            <option value="false" ${!item.isActive ? 'selected' : ''}>Masquer (brouillon)</option>
          </select>
        </div>
      </div>
      <div class="form-group" style="margin-bottom: 1rem;">
        <label class="form-label">Photo / Avatar du client (URL de l'image)</label>
        <input type="text" id="modal-test-avatar" class="form-input" placeholder="https://..." value="${item.avatar}">
      </div>
      <div class="form-group" style="margin-bottom: 1.5rem;">
        <label class="form-label">Commentaire / Citation *</label>
        <textarea id="modal-test-quote" class="form-textarea" rows="3" placeholder="Écrivez le retour du client..." required>${item.quote}</textarea>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary btn-sm" onclick="window.dashboard.closeModals()">Annuler</button>
        <button class="btn btn-primary btn-sm" onclick="window.dashboard.saveTestimonialModal()">Enregistrer le témoignage</button>
      </div>
    `;

    document.getElementById('admin-generic-modal')?.classList.add('active');
  }

  saveTestimonialModal() {
    const id = document.getElementById('modal-test-id')?.value;
    const name = document.getElementById('modal-test-name')?.value.trim();
    const role = document.getElementById('modal-test-role')?.value.trim();
    const rating = parseInt(document.getElementById('modal-test-rating')?.value, 10) || 5;
    const isActive = document.getElementById('modal-test-active')?.value === 'true';
    const avatar = document.getElementById('modal-test-avatar')?.value.trim() || '/assets/images/ab8459f150d5d7db346654de338434e5.jpg';
    const quote = document.getElementById('modal-test-quote')?.value.trim();

    if (!name || !quote) {
      this.showToast('Veuillez renseigner le nom et le texte du témoignage.', 'error');
      return;
    }

    if (!this.state.testimonials) this.state.testimonials = [];

    if (id) {
      const idx = this.state.testimonials.findIndex(t => t.id === id);
      if (idx !== -1) {
        this.state.testimonials[idx] = { ...this.state.testimonials[idx], name, role, rating, isActive, avatar, quote };
      }
    } else {
      const newTest = {
        id: `test-${Date.now()}`,
        name,
        role,
        rating,
        isActive,
        avatar,
        quote
      };
      this.state.testimonials.unshift(newTest);
    }

    // Synchronisation Cloud Supabase
    ContentService.saveTestimonial({ id, name, role, rating, isActive, avatar, quote }).catch(e => console.warn('[Supabase] Sync testimonial:', e));

    this.saveState();
    this.closeModals();
    this.renderTestimonials();
    this.showToast('Témoignage enregistré et synchronisé avec le site public !', 'success');
  }

  deleteTestimonial(id) {
    if (!confirm('Supprimer ce témoignage ?')) return;

    // Suppression Cloud Supabase
    ContentService.deleteTestimonial(id).catch(e => console.warn('[Supabase] Delete testimonial:', e));

    this.state.testimonials = this.state.testimonials.filter(t => t.id !== id);
    this.saveState();
    this.renderTestimonials();
    this.showToast('Témoignage supprimé.', 'info');
  }

  toggleTestimonialActive(id) {
    const item = this.state.testimonials.find(t => t.id === id);
    if (!item) return;
    item.isActive = !item.isActive;
    this.saveState();
    this.renderTestimonials();
    this.showToast(item.isActive ? 'Témoignage activé sur le site.' : 'Témoignage masqué.', 'info');
  }

  // ===================================================================
  // 11. CONTENU À PROPOS & ATELIER
  // ===================================================================
  setupAboutForm() {
    const form = document.getElementById('form-about-content');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveAboutForm();
      });
    }
  }

  async handleAboutImageUpload(event, imageNum) {
    const file = event.target.files[0];
    if (!file) return;

    const compressed = await this.compressImage(file, 1200, 0.85);
    if (!compressed) return;

    if (imageNum === 1) {
      const input = document.getElementById('about-image-1');
      const preview = document.getElementById('about-img1-preview');
      if (input) input.value = compressed;
      if (preview) preview.src = compressed;
    } else if (imageNum === 2) {
      const input = document.getElementById('about-image-2');
      const preview = document.getElementById('about-img2-preview');
      if (input) input.value = compressed;
      if (preview) preview.src = compressed;
    }
  }

  renderAboutForm() {
    const a = this.state.about || {};
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el && val !== undefined) el.value = val;
    };

    setVal('about-section-title', a.sectionTitle);
    setVal('about-section-subtitle', a.sectionSubtitle);
    setVal('about-quote', a.quote);
    setVal('about-quote-author', a.quoteAuthor);
    setVal('about-paragraph-1', a.storyParagraph1);
    setVal('about-paragraph-2', a.storyParagraph2);

    // Badges
    const badges = a.badges || ['Coupe & Assemblage Main', 'Broderie Fil d’Or Noble', 'Teinture Grand Teint Fixe'];
    setVal('about-badge-1', badges[0]);
    setVal('about-badge-2', badges[1]);
    setVal('about-badge-3', badges[2]);

    // Images
    const img1 = a.image1 || '/assets/images/ab8459f150d5d7db346654de338434e5.jpg';
    const img2 = a.image2 || '/assets/images/hero-frere-mixage.jpg';

    setVal('about-image-1', a.image1 || '');
    setVal('about-image-2', a.image2 || '');

    const p1 = document.getElementById('about-img1-preview');
    if (p1) p1.src = img1;

    const p2 = document.getElementById('about-img2-preview');
    if (p2) p2.src = img2;

    if (a.pillars && a.pillars.length === 4) {
      setVal('about-pillar-1-title', a.pillars[0].title);
      setVal('about-pillar-1-desc', a.pillars[0].desc);
      setVal('about-pillar-2-title', a.pillars[1].title);
      setVal('about-pillar-2-desc', a.pillars[1].desc);
      setVal('about-pillar-3-title', a.pillars[2].title);
      setVal('about-pillar-3-desc', a.pillars[2].desc);
      setVal('about-pillar-4-title', a.pillars[3].title);
      setVal('about-pillar-4-desc', a.pillars[3].desc);
    }
  }

  saveAboutForm() {
    if (!this.state.about) this.state.about = {};
    const a = this.state.about;

    a.sectionTitle = document.getElementById('about-section-title')?.value || a.sectionTitle;
    a.sectionSubtitle = document.getElementById('about-section-subtitle')?.value || a.sectionSubtitle;
    a.quote = document.getElementById('about-quote')?.value || a.quote;
    a.quoteAuthor = document.getElementById('about-quote-author')?.value || a.quoteAuthor;
    a.storyParagraph1 = document.getElementById('about-paragraph-1')?.value || a.storyParagraph1;
    a.storyParagraph2 = document.getElementById('about-paragraph-2')?.value || a.storyParagraph2;

    const img1Val = document.getElementById('about-image-1')?.value.trim();
    const img2Val = document.getElementById('about-image-2')?.value.trim();
    if (img1Val) a.image1 = img1Val;
    if (img2Val) a.image2 = img2Val;

    a.badges = [
      document.getElementById('about-badge-1')?.value || 'Coupe & Assemblage Main',
      document.getElementById('about-badge-2')?.value || 'Broderie Fil d’Or Noble',
      document.getElementById('about-badge-3')?.value || 'Teinture Grand Teint Fixe'
    ];

    a.pillars = [
      {
        title: document.getElementById('about-pillar-1-title')?.value || 'SAVOIR-FAIRE',
        desc: document.getElementById('about-pillar-1-desc')?.value || ''
      },
      {
        title: document.getElementById('about-pillar-2-title')?.value || 'QUALITÉ',
        desc: document.getElementById('about-pillar-2-desc')?.value || ''
      },
      {
        title: document.getElementById('about-pillar-3-title')?.value || 'STYLE',
        desc: document.getElementById('about-pillar-3-desc')?.value || ''
      },
      {
        title: document.getElementById('about-pillar-4-title')?.value || 'SUR MESURE',
        desc: document.getElementById('about-pillar-4-desc')?.value || ''
      }
    ];

    // Synchronisation Cloud Supabase
    ContentService.saveAboutContent(a).catch(e => console.warn('[Supabase] Sync about:', e));

    this.saveState();
    this.showToast('Contenu "Les Coulisses de la Maison" et images mis à jour en direct !', 'success');
  }

  // ===================================================================
  // 12. PROFIL ADMINISTRATEUR
  // ===================================================================
  setupProfileForm() {
    const form = document.getElementById('form-profile');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfile();
      });
    }
  }

  renderProfile() {
    const user = this.state.team[0];
    if (!user) return;

    const nameInput = document.getElementById('profile-name-input');
    const phoneInput = document.getElementById('profile-phone-input');
    const emailInput = document.getElementById('profile-email-input');
    const roleInput = document.getElementById('profile-role-input');
    const avatarUrlInput = document.getElementById('profile-avatar-url-input');
    const avatarDisplay = document.getElementById('profile-avatar-display');
    const headerName = document.getElementById('profile-header-name');
    const headerRole = document.getElementById('profile-header-role');

    if (nameInput) nameInput.value = user.name;
    if (phoneInput) phoneInput.value = user.phone || '+221 77 000 00 00';
    if (emailInput) emailInput.value = user.email;
    if (roleInput) roleInput.value = user.roleLabel || 'Propriétaire & Fondateur';
    if (avatarUrlInput) avatarUrlInput.value = user.avatar.startsWith('data:') ? '' : user.avatar;
    if (avatarDisplay) avatarDisplay.src = user.avatar;
    if (headerName) headerName.textContent = user.name;
    if (headerRole) headerRole.textContent = `${user.roleLabel || 'Propriétaire'} — Frère Mixage`;
  }

  handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const avatarDisplay = document.getElementById('profile-avatar-display');
      if (avatarDisplay) avatarDisplay.src = dataUrl;

      if (this.state.team[0]) {
        this.state.team[0].avatar = dataUrl;
        this.saveState();
        this.renderUserHeader();
        this.showToast('Photo de profil mise à jour avec succès !', 'success');
      }
    };
    reader.readAsDataURL(file);
  }

  handleAvatarUrlChange(url) {
    if (!url || !url.startsWith('http')) return;
    const avatarDisplay = document.getElementById('profile-avatar-display');
    if (avatarDisplay) avatarDisplay.src = url;
    if (this.state.team[0]) {
      this.state.team[0].avatar = url;
    }
  }

  saveProfile() {
    const user = this.state.team[0];
    if (!user) return;

    const name = document.getElementById('profile-name-input')?.value.trim();
    const phone = document.getElementById('profile-phone-input')?.value.trim();
    const email = document.getElementById('profile-email-input')?.value.trim();
    const roleLabel = document.getElementById('profile-role-input')?.value.trim();
    const avatarUrl = document.getElementById('profile-avatar-url-input')?.value.trim();

    if (!name || !email) {
      this.showToast('Veuillez renseigner au minimum votre nom et email.', 'error');
      return;
    }

    user.name = name;
    user.phone = phone || user.phone;
    user.email = email;
    user.roleLabel = roleLabel || user.roleLabel;
    if (avatarUrl) user.avatar = avatarUrl;

    this.saveState();
    this.renderUserHeader();
    this.renderProfile();
    this.renderTeam();
    this.showToast('Profil administrateur mis à jour avec succès !', 'success');
  }

  renderUserHeader() {
    const user = this.currentProfile || this.state.team[0] || {};

    // Sidebar user info
    const sidebarAvatar = document.querySelector('.sidebar-user-avatar');
    const sidebarName = document.querySelector('.sidebar-user-name');
    const sidebarRole = document.querySelector('.sidebar-user-role');
    
    if (sidebarAvatar) sidebarAvatar.src = user.avatar_url || this.state.team[0]?.avatar || '../assets/images/ab8459f150d5d7db346654de338434e5.jpg';
    if (sidebarName) sidebarName.textContent = user.full_name || user.name || 'Administrateur';
    if (sidebarRole) {
      const isOwner = (user.role === 'owner' || this.currentUserRole === 'owner');
      sidebarRole.textContent = isOwner ? '👑 Propriétaire' : '👔 Assistant';
      sidebarRole.style.color = isOwner ? 'var(--gold)' : '#93C5FD';
    }

    // Topbar user info
    const topbarAvatar = document.querySelector('.user-avatar-btn');
    const topbarName = document.querySelector('.user-profile-name');
    if (topbarAvatar) topbarAvatar.src = user.avatar_url || this.state.team[0]?.avatar || '../assets/images/ab8459f150d5d7db346654de338434e5.jpg';
    if (topbarName) topbarName.textContent = user.full_name || user.name || 'Admin';

    // Masquage dynamique pour le rôle ASSISTANT
    if (this.currentUserRole === 'assistant') {
      // Masquer ÉQUIPE et PARAMÈTRES
      document.querySelectorAll('[data-view="team"], [data-view="settings"]').forEach(el => {
        const parentLi = el.closest('li');
        if (parentLi) parentLi.style.display = 'none';
      });
      document.querySelectorAll('.nav-section-title').forEach(el => {
        if (el.textContent.trim() === 'ÉQUIPE') {
          if (el.parentElement) el.parentElement.style.display = 'none';
        }
      });
    }
  }

  // ===================================================================
  // 12. GESTION DE L'ÉQUIPE (OWNER ONLY)
  // ===================================================================
  async renderTeam() {
    const tbody = document.getElementById('team-table-tbody');
    if (!tbody) return;

    if (this.currentUserRole !== 'owner') {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 2.5rem;">Cette section est strictement réservée au Propriétaire.</td></tr>`;
      return;
    }

    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--gold-light); padding: 1.5rem;">Chargement des membres de l'équipe...</td></tr>`;

    try {
      const members = await AuthService.getTeamMembers();
      if (!members || members.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dim); padding: 2.5rem;">Aucun membre enregistré pour le moment.</td></tr>`;
        return;
      }

      tbody.innerHTML = members.map(m => {
        const isOwner = m.role === 'owner';
        const roleBadge = isOwner 
          ? '<span class="badge" style="background: rgba(212, 175, 55, 0.15); color: #ECC880; border: 1px solid var(--gold-border); font-weight: 700;">👑 PROPRIÉTAIRE</span>' 
          : '<span class="badge" style="background: rgba(59, 130, 246, 0.15); color: #93C5FD; border: 1px solid rgba(59, 130, 246, 0.3); font-weight: 700;">👔 ASSISTANT</span>';

        const statusBadge = m.is_active 
          ? '<span class="badge badge-stock-ok">ACTIF</span>' 
          : '<span class="badge badge-stock-out" style="background: rgba(239, 68, 68, 0.15); color: #FCA5A5; border: 1px solid rgba(239, 68, 68, 0.3);">DÉSACTIVÉ</span>';

        const displayPhone = AuthService.formatPhoneDisplay(m.phone || 'Non renseigné');
        const formattedDate = new Date(m.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

        const actionButtons = isOwner 
          ? '<span style="font-size: 0.75rem; color: var(--text-dim);">Compte Principal</span>' 
          : `
            <button class="btn btn-sm ${m.is_active ? 'btn-secondary' : 'btn-primary'}" 
                    style="${m.is_active ? 'border-color: rgba(239, 68, 68, 0.4); color: #FCA5A5;' : ''}"
                    onclick="window.dashboard.toggleMemberStatus('${m.id}', ${m.is_active})">
              ${m.is_active ? 'Désactiver' : 'Activer'}
            </button>
          `;

        return `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--admin-card-inner); border: 1px solid var(--gold-border); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--gold); font-size: 0.9rem;">
                  ${(m.full_name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong style="color: #FFFFFF;">${m.full_name || 'Membre'}</strong>
                  <div style="font-size: 0.72rem; color: var(--text-dim);">${isOwner ? 'Fondateur' : 'Gestion de la boutique'}</div>
                </div>
              </div>
            </td>
            <td><code style="color: var(--gold-light); font-size: 0.85rem; background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px;">${displayPhone}</code></td>
            <td>${roleBadge}</td>
            <td>${statusBadge}</td>
            <td>${formattedDate}</td>
            <td style="text-align: right;">${actionButtons}</td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.error('[renderTeam] Erreur :', err);
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #F87171; padding: 2rem;">Erreur de chargement : ${err.message}</td></tr>`;
    }
  }

  openAddAssistantModal() {
    const modalBox = document.getElementById('modal-generic-body');
    const modalTitle = document.getElementById('modal-generic-title');
    if (!modalBox || !modalTitle) return;

    modalTitle.textContent = "Ajouter un membre à l'équipe";
    modalBox.innerHTML = `
      <form id="form-add-assistant" onsubmit="window.dashboard.submitAddAssistant(event)">
        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Nom complet du membre *</label>
          <input type="text" id="asst-full-name" class="form-input" placeholder="Ex: Amadou Ndiaye" required>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Numéro de téléphone (Sénégal) *</label>
          <input type="tel" id="asst-phone" class="form-input" placeholder="+221 77 000 00 00" required>
          <small style="color: var(--text-dim); font-size: 0.72rem; display: block; margin-top: 4px;">Format international automatique (+221XXXXXXXXX).</small>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label class="form-label">Rôle attribué</label>
          <input type="text" class="form-input" value="👔 ASSISTANT (Gestion boutique, stocks & commandes)" disabled style="opacity: 0.8; cursor: not-allowed; background: rgba(0,0,0,0.3); color: var(--gold);">
        </div>

        <div class="form-group" style="margin-bottom: 1.5rem;">
          <label class="form-label">Mot de passe temporaire *</label>
          <input type="password" id="asst-password" class="form-input" placeholder="Au moins 6 caractères" required minlength="6">
          <small style="color: var(--text-dim); font-size: 0.72rem; display: block; margin-top: 4px;">Permettra au membre de se connecter directement sur /admin/login.</small>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button type="button" class="btn btn-secondary btn-sm" onclick="window.dashboard.closeModals()">Annuler</button>
          <button type="submit" id="btn-submit-assistant" class="btn btn-primary btn-sm">+ Créer le compte Assistant</button>
        </div>
      </form>
    `;

    document.getElementById('admin-generic-modal')?.classList.add('active');
  }

  async submitAddAssistant(e) {
    e.preventDefault();
    const fullName = document.getElementById('asst-full-name')?.value.trim();
    const phone = document.getElementById('asst-phone')?.value.trim();
    const password = document.getElementById('asst-password')?.value;
    const btn = document.getElementById('btn-submit-assistant');

    if (!fullName || !phone || !password) {
      this.showToast('Veuillez renseigner tous les champs obligatoires.', 'error');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Création en cours...';
    }

    try {
      await AuthService.createAssistant(fullName, phone, password);
      this.showToast(`Compte assistant de « ${fullName} » créé avec succès !`, 'success');
      this.closeModals();
      this.renderTeam();
    } catch (err) {
      this.showToast(err.message || 'Erreur lors de la création du compte.', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = '+ Créer le compte Assistant';
      }
    }
  }

  async toggleMemberStatus(userId, currentIsActive) {
    const actionName = currentIsActive ? 'désactiver' : 'réactiver';
    if (!confirm(`Confirmez-vous vouloir ${actionName} ce compte ?`)) return;

    try {
      await AuthService.toggleUserStatus(userId, !currentIsActive);
      this.showToast(`Statut du membre mis à jour.`, 'success');
      this.renderTeam();
    } catch (err) {
      this.showToast(err.message || 'Erreur lors de la modification.', 'error');
    }
  }

  async handleLogout() {
    if (confirm('Voulez-vous retourner sur la vitrine publique Frère Mixage ?')) {
      window.location.href = '../';
    }
  }

  // ===================================================================
  // HELPERS
  // ===================================================================
  getStatusBadge(status, label) {
    const map = {
      new: 'badge-new',
      confirmed: 'badge-confirmed',
      preparing: 'badge-preparing',
      shipped: 'badge-shipped',
      delivered: 'badge-delivered',
      cancelled: 'badge-cancelled'
    };
    return `<span class="badge ${map[status] || 'badge-draft'}">${label || status}</span>`;
  }

  getProductStatusBadge(status) {
    if (status === 'published') return '<span class="badge badge-published">Publié</span>';
    if (status === 'sold_out') return '<span class="badge badge-sold_out">Épuisé</span>';
    return '<span class="badge badge-draft">Brouillon</span>';
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  closeModals() {
    document.querySelectorAll('.admin-modal-backdrop').forEach(m => m.classList.remove('active'));
  }

  viewProductModal(productId) {
    const product = this.state.products.find(p => p.id === productId);
    if (!product) return;

    const modalBox = document.getElementById('modal-generic-body');
    const modalTitle = document.getElementById('modal-generic-title');
    if (!modalBox || !modalTitle) return;

    modalTitle.textContent = product.name;
    modalBox.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">
        <img src="${product.images[0]}" style="width: 100%; border-radius: 8px; aspect-ratio: 4/3; object-fit: cover;">
        <div>
          <div style="font-size: 0.72rem; color: var(--gold); text-transform: uppercase; font-weight: 700;">${product.category}</div>
          <h3 style="font-size: 1.2rem; margin-bottom: 0.5rem;">${product.name}</h3>
          <div style="font-size: 1.3rem; font-weight: 700; color: var(--gold-light); margin-bottom: 0.75rem;">${product.price.toLocaleString('fr-FR')} FCFA</div>
          <p style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.5;">${product.description}</p>
        </div>
      </div>
      <div style="background: var(--admin-card-inner); padding: 1rem; border-radius: 6px; margin-bottom: 1.25rem; font-size: 0.8rem;">
        <strong>Matière :</strong> ${product.fabric || 'Bazin Riche'}<br>
        <strong>Ventes enregistrées :</strong> ${product.salesCount || 0} commandes
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn-secondary btn-sm" onclick="window.dashboard.editProduct('${product.id}'); window.dashboard.closeModals();">Modifier la tenue</button>
        <button class="btn btn-primary btn-sm" onclick="window.dashboard.closeModals()">Fermer</button>
      </div>
    `;

    document.getElementById('admin-generic-modal')?.classList.add('active');
  }

  deleteProduct(productId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette création du catalogue ?')) return;
    this.state.products = this.state.products.filter(p => p.id !== productId);
    this.saveState();
    this.renderProducts();
    this.renderOverview();
    this.showToast('Création supprimée du catalogue.', 'info');
  }

  // ===================================================================
  // 14. GESTION DE LA COMPTABILITÉ (DÉPENSES, RECETTES, RENTABILITÉ)
  // ===================================================================
  renderAccounting() {
    if (!this.state.accounting) {
      this.state.accounting = JSON.parse(JSON.stringify(INITIAL_DATA.accounting || {}));
    }

    const acc = this.state.accounting || {};
    const expenses = acc.expensesList || [];

    // Recalcul des dépenses totales réelles (0 si aucune dépense)
    const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    
    // Recalcul des recettes totales réelles à partir des commandes et factures payées
    const paidOrdersRevenue = (this.state.orders || []).filter(o => o.paymentStatus === 'payé' || o.status === 'delivered').reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const paidInvoicesRevenue = (this.state.invoices || []).filter(i => i.status === 'paid').reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);
    const totalRevenue = Math.max(paidOrdersRevenue, paidInvoicesRevenue, acc.totalRevenue || 0);
    const netProfit = totalRevenue - totalExpenses;
    const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) + '%' : '0.0%';

    // Calcul factures impayées réelles
    const unpaidInvoices = (this.state.invoices || []).filter(i => i.status === 'pending' || i.status === 'unpaid');
    const unpaidTotal = unpaidInvoices.reduce((sum, i) => sum + (Number(i.totalAmount) || 0), 0);

    // Injection dans le DOM des KPI
    const setElem = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setElem('acc-total-revenue', `${totalRevenue.toLocaleString('fr-FR')} FCFA`);
    setElem('acc-month-revenue', `Ce mois: ${(acc.monthRevenue || 0).toLocaleString('fr-FR')} FCFA`);
    setElem('acc-total-expenses', `${totalExpenses.toLocaleString('fr-FR')} FCFA`);
    setElem('acc-month-expenses', `Ce mois: ${(acc.monthExpenses || 0).toLocaleString('fr-FR')} FCFA`);
    setElem('acc-net-profit', `${netProfit.toLocaleString('fr-FR')} FCFA`);
    setElem('acc-net-margin', `Marge: ${netMargin}`);
    setElem('acc-unpaid-invoices', `${unpaidTotal.toLocaleString('fr-FR')} FCFA`);
    setElem('acc-unpaid-count', `${unpaidInvoices.length} facture${unpaidInvoices.length > 1 ? 's' : ''} en attente`);

    // Table des dépenses
    const tbody = document.getElementById('accounting-expenses-table-tbody');
    if (tbody) {
      if (expenses.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: var(--text-dim); padding: 2rem;">
              Aucune dépense enregistrée. Cliquez sur "+ Ajouter une dépense".
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = expenses.map(exp => {
          let categoryBadge = 'background: rgba(220, 38, 38, 0.15); color: #EF4444;';
          if (exp.category.includes('Atelier') || exp.category.includes('Équipement')) categoryBadge = 'background: rgba(220, 38, 38, 0.15); color: #EF4444;';
          else if (exp.category.includes('Transport')) categoryBadge = 'background: rgba(217, 119, 6, 0.15); color: #F59E0B;';
          else if (exp.category.includes('Tissus')) categoryBadge = 'background: rgba(16, 185, 129, 0.15); color: #10B981;';
          else categoryBadge = 'background: rgba(107, 114, 128, 0.15); color: #9CA3AF;';

          return `
            <tr>
              <td style="font-size: 0.82rem; font-weight: 600; color: var(--text-main);">${exp.date}</td>
              <td>
                <span class="badge" style="${categoryBadge} font-size: 0.72rem; padding: 3px 8px; border-radius: 4px;">
                  ${exp.category}
                </span>
              </td>
              <td style="font-size: 0.82rem; color: var(--text-main); max-width: 320px;">
                ${exp.description}
              </td>
              <td>
                <span style="font-size: 0.76rem; color: var(--text-dim);">${exp.paymentMethod || 'Wave'}</span>
              </td>
              <td style="font-size: 0.88rem; font-weight: 700; color: #EF4444;">
                -${Number(exp.amount).toLocaleString('fr-FR')} FCFA
              </td>
              <td style="text-align: right;">
                <button class="btn-action-icon danger" title="Supprimer la dépense" onclick="window.dashboard.deleteExpense('${exp.id}')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // Rendu des graphiques Canvas
    setTimeout(() => {
      this.renderAccountingCharts();
    }, 50);
  }

  renderAccountingCharts() {
    const acc = this.state.accounting;
    if (!acc) return;

    // 1. Graphique Évolution Mensuelle (Canvas Bar Chart)
    const barCanvas = document.getElementById('accountingMonthlyChart');
    if (barCanvas) {
      const ctx = barCanvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = barCanvas.getBoundingClientRect();
      barCanvas.width = rect.width * dpr || 700 * dpr;
      barCanvas.height = rect.height * dpr || 280 * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width || 700;
      const h = rect.height || 280;
      const paddingBottom = 35;
      const paddingTop = 25;
      const paddingLeft = 55;
      const paddingRight = 20;

      ctx.clearRect(0, 0, w, h);

      // Grille horizontale
      const monthsData = acc.monthlyEvolution || [
        { month: 'Sep', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Oct', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Nov', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Déc', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Jan', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Fév', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Mar', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Avr', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Mai', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Juin', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Juil', revenue: 0, expenses: 0, profit: 0 },
        { month: 'Août', revenue: 0, expenses: 0, profit: 0 }
      ];

      const maxVal = 100000;
      const minVal = 0;
      const range = 100000;
      const chartHeight = h - paddingTop - paddingBottom;
      const zeroY = h - paddingBottom;

      // Lignes de repère
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.textAlign = 'right';

      [100000, 50000, 0].forEach(val => {
        const y = paddingTop + ((maxVal - val) / range) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(w - paddingRight, y);
        ctx.stroke();

        ctx.fillText(val === 0 ? '0' : `${val / 1000}K`, paddingLeft - 8, y + 3);
      });

      // Barres par mois
      const availableWidth = w - paddingLeft - paddingRight;
      const groupWidth = availableWidth / monthsData.length;
      const barWidth = 6;

      monthsData.forEach((d, idx) => {
        const groupX = paddingLeft + idx * groupWidth;
        const centerX = groupX + groupWidth / 2;

        // Label du mois
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText(d.month, centerX, h - 10);

        if (d.profit !== 0) {
          const profitY = paddingTop + ((maxVal - Math.max(0, d.profit)) / range) * chartHeight;
          const profitH = (Math.abs(d.profit) / range) * chartHeight;
          ctx.fillStyle = d.profit >= 0 ? '#10B981' : '#EF4444';
          ctx.fillRect(centerX - 10, d.profit >= 0 ? profitY : zeroY, barWidth, profitH);
        }

        if (d.expenses > 0) {
          const expY = paddingTop + ((maxVal - d.expenses) / range) * chartHeight;
          const expH = (d.expenses / range) * chartHeight;
          ctx.fillStyle = '#8C7853';
          ctx.fillRect(centerX - 3, expY, barWidth, expH);
        }

        if (d.revenue > 0) {
          const revY = paddingTop + ((maxVal - d.revenue) / range) * chartHeight;
          const revH = (d.revenue / range) * chartHeight;
          ctx.fillStyle = '#D4AF37';
          ctx.fillRect(centerX + 4, revY, barWidth, revH);
        }
      });
    }

    // 2. Graphique Donut (Dépenses par catégorie)
    const donutCanvas = document.getElementById('accountingExpensesDonut');
    if (donutCanvas) {
      const ctx = donutCanvas.getContext('2d');
      const dpr = window.devicePixelRatio || 1;
      const rect = donutCanvas.getBoundingClientRect();
      donutCanvas.width = rect.width * dpr || 200 * dpr;
      donutCanvas.height = rect.height * dpr || 200 * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width || 200;
      const h = rect.height || 200;
      const centerX = w / 2;
      const centerY = h / 2;
      const radius = Math.min(centerX, centerY) - 15;
      const innerRadius = radius * 0.65;

      ctx.clearRect(0, 0, w, h);

      const categories = acc.expensesByCategory || [];
      const total = categories.reduce((sum, c) => sum + (c.amount || 0), 0);

      if (total === 0) {
        // Cercle vide élégant
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.arc(centerX, centerY, innerRadius, 2 * Math.PI, 0, true);
        ctx.closePath();
        ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DÉPENSES', centerX, centerY - 8);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText('0 FCFA', centerX, centerY + 10);
      } else {
        let startAngle = -Math.PI / 2;
        categories.forEach(cat => {
          const sliceAngle = (cat.amount / total) * 2 * Math.PI;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
          ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
          ctx.closePath();
          ctx.fillStyle = cat.color;
          ctx.fill();

          startAngle += sliceAngle;
        });

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DÉPENSES', centerX, centerY - 8);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(`${total.toLocaleString('fr-FR')} FCFA`, centerX, centerY + 10);
      }

      // Légende
      const legendEl = document.getElementById('acc-expenses-legend');
      if (legendEl) {
        if (categories.length === 0) {
          legendEl.innerHTML = '<span style="color: var(--text-dim); font-size: 0.8rem;">Aucune dépense enregistrée</span>';
        } else {
          legendEl.innerHTML = categories.map(cat => `
            <span style="display: inline-flex; align-items: center; gap: 5px; color: var(--text-muted);">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: ${cat.color};"></span>
              ${cat.category} (${cat.percentage}%)
            </span>
          `).join('');
        }
      }
    }
  }

  openAddExpenseModal() {
    const modalBox = document.getElementById('modal-generic-body');
    const modalTitle = document.getElementById('modal-generic-title');
    if (!modalBox || !modalTitle) return;

    const today = new Date().toISOString().split('T')[0];

    modalTitle.textContent = "Ajouter une Dépense Atelier";
    modalBox.innerHTML = `
      <form id="form-new-expense" onsubmit="event.preventDefault(); window.dashboard.saveNewExpense();">
        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Date de la dépense *</label>
            <input type="date" id="expense-date" class="form-input" value="${today}" required>
          </div>
          <div class="form-group">
            <label class="form-label">Catégorie de charge *</label>
            <select id="expense-category" class="form-select" required>
              <option value="Équipement & Atelier">Équipement & Atelier</option>
              <option value="Tissus & Bazin">Tissus & Matières premières</option>
              <option value="Transport & Logistique">Transport & Expéditions</option>
              <option value="Divers & Fournitures">Divers & Fournitures</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Description précise du paiement *</label>
          <input type="text" id="expense-desc" class="form-input" placeholder="Ex: Rouleaux Bazin Riche Getzner teinté Dakar" required>
        </div>

        <div class="form-row-2">
          <div class="form-group">
            <label class="form-label">Montant (en FCFA) *</label>
            <input type="number" id="expense-amount" class="form-input" placeholder="Ex: 85000" min="500" step="500" required>
          </div>
          <div class="form-group">
            <label class="form-label">Mode de règlement *</label>
            <select id="expense-payment" class="form-select">
              <option value="Wave">Wave</option>
              <option value="Orange Money">Orange Money</option>
              <option value="Espèces">Espèces (Caisse atelier)</option>
              <option value="Virement">Virement bancaire</option>
            </select>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.dashboard.closeModals()">Annuler</button>
          <button type="submit" class="btn btn-primary" style="background: #DC2626; border-color: #EF4444;">Enregistrer la dépense</button>
        </div>
      </form>
    `;

    document.getElementById('admin-generic-modal')?.classList.add('active');
  }

  saveNewExpense() {
    const date = document.getElementById('expense-date')?.value;
    const category = document.getElementById('expense-category')?.value;
    const description = document.getElementById('expense-desc')?.value.trim();
    const amount = Number(document.getElementById('expense-amount')?.value) || 0;
    const paymentMethod = document.getElementById('expense-payment')?.value;

    if (!description || amount <= 0) {
      alert('Veuillez renseigner une description et un montant valide.');
      return;
    }

    if (!this.state.accounting) this.state.accounting = { expensesList: [] };
    if (!this.state.accounting.expensesList) this.state.accounting.expensesList = [];

    const newExpense = {
      id: `exp-${Date.now()}`,
      date,
      category,
      description,
      amount,
      paymentMethod
    };

    this.state.accounting.expensesList.unshift(newExpense);
    this.state.accounting.totalExpenses = (this.state.accounting.totalExpenses || 0) + amount;

    // Recalcul catégories
    const catMap = {};
    this.state.accounting.expensesList.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + Number(e.amount);
    });

    const total = Object.values(catMap).reduce((a, b) => a + b, 0);
    const colorMap = {
      'Équipement & Atelier': '#DC2626',
      'Tissus & Bazin': '#10B981',
      'Transport & Logistique': '#D97706',
      'Divers & Fournitures': '#6B7280'
    };

    this.state.accounting.expensesByCategory = Object.keys(catMap).map(cat => ({
      category: cat,
      amount: catMap[cat],
      percentage: Math.round((catMap[cat] / total) * 100),
      color: colorMap[cat] || '#8B5CF6'
    }));

    this.saveState();
    this.closeModals();
    this.renderAccounting();
    this.showToast('Dépense enregistrée avec succès dans la comptabilité !', 'success');
  }

  deleteExpense(id) {
    if (!confirm('Voulez-vous supprimer cette dépense ?')) return;
    if (!this.state.accounting || !this.state.accounting.expensesList) return;

    this.state.accounting.expensesList = this.state.accounting.expensesList.filter(e => e.id !== id);
    this.saveState();
    this.renderAccounting();
    this.showToast('Dépense supprimée.', 'info');
  }

  changeAccountingPeriod(period) {
    this.showToast(`Période filtrée : ${period}`, 'info');
    this.renderAccounting();
  }

  exportAccountingExcel() {
    const acc = this.state.accounting || {};
    const expenses = acc.expensesList || [];
    
    let csv = '\uFEFFDate;Catégorie;Description;Paiement;Montant (FCFA)\n';
    expenses.forEach(e => {
      csv += `"${e.date}";"${e.category}";"${e.description.replace(/"/g, '""')}";"${e.paymentMethod}";"${e.amount}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `comptabilite_frere_mixage_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    this.showToast('Export Excel / CSV téléchargé avec succès !', 'success');
  }
}

// Initialisation globale robuste
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.dashboard) {
      window.dashboard = new AdminDashboard();
    }
  });
} else {
  if (!window.dashboard) {
    window.dashboard = new AdminDashboard();
  }
}
