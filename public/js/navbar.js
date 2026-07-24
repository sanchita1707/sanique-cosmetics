// Sanique Cosmetics - Luxury Navbar & Drawer Interactions

document.addEventListener('DOMContentLoaded', () => {
  initLuxuryNavbar();
});

function initLuxuryNavbar() {
  const header = document.querySelector('header');
  const menuToggle = document.querySelector('.menu-toggle');
  const navDrawer = document.querySelector('.mobile-nav-drawer');
  const drawerOverlay = document.querySelector('.drawer-overlay');
  
  // 1. Frosted Glass Transition on Scrolling
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Trigger initially in case of cached reload positions

  // 2. Mobile Drawer Navigation Toggle
  if (menuToggle && navDrawer && drawerOverlay) {
    menuToggle.setAttribute('role', 'button');
    menuToggle.setAttribute('tabindex', '0');
    menuToggle.setAttribute('aria-label', 'Toggle Mobile Navigation');
    menuToggle.setAttribute('aria-expanded', 'false');

    const toggleDrawer = () => {
      const active = menuToggle.classList.toggle('active');
      navDrawer.classList.toggle('active');
      drawerOverlay.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', active ? 'true' : 'false');
    };

    menuToggle.addEventListener('click', toggleDrawer);
    menuToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDrawer();
      }
    });
    drawerOverlay.addEventListener('click', toggleDrawer);
  }
}
