/**
 * Composant Header & Navigation Mobile
 */
export function initHeader() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-nav-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Gestion du glassmorphism au scroll
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Menu Mobile Drawer Toggle
  if (mobileDrawer) {
    const closeBtn = document.getElementById('mobile-drawer-close');

    const openMenu = () => {
      mobileDrawer.classList.add('open');
      mobileToggle?.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeMenu = () => {
      mobileDrawer.classList.remove('open');
      mobileToggle?.classList.remove('active');
      document.body.style.overflow = '';
    };

    mobileToggle?.addEventListener('click', () => {
      if (mobileDrawer.classList.contains('open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    closeBtn?.addEventListener('click', closeMenu);

    document.querySelectorAll('.mobile-nav-item, .drawer-cta-btn').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        document.querySelectorAll('.mobile-nav-item').forEach(i => i.classList.remove('active'));
        if (link.classList.contains('mobile-nav-item')) link.classList.add('active');
        
        closeMenu();

        if (href && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            setTimeout(() => {
              target.scrollIntoView({ behavior: 'smooth' });
            }, 150);
          }
        }
      });
    });
  }

  // Smooth scroll pour les ancres
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}
