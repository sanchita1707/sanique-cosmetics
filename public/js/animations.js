// Sanique Cosmetics - Luxury Interaction & Animation Logic

document.addEventListener('DOMContentLoaded', () => {
  initLuxuryRevealAnimations();
});

// Dismiss preloader once fully loaded
window.addEventListener('load', () => {
  const preloader = document.getElementById('page-preloader');
  if (preloader) {
    preloader.classList.add('fade-out');
    setTimeout(() => {
      preloader.remove();
    }, 600); // Wait for transition to complete
  }
});

function initLuxuryRevealAnimations() {
  document.documentElement.classList.add('animations-active');
  const elementsToReveal = document.querySelectorAll('.fade-up:not(.reveal), .fade-in:not(.reveal)');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -30px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    elementsToReveal.forEach(el => revealObserver.observe(el));
  } else {
    elementsToReveal.forEach(el => el.classList.add('reveal'));
  }
}

// Expose globally for dynamic additions
window.initLuxuryRevealAnimations = initLuxuryRevealAnimations;
