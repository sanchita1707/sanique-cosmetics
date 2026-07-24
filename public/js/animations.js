// Sanique Cosmetics - Luxury Interaction & Animation Logic

document.addEventListener('DOMContentLoaded', () => {
  initLuxuryRevealAnimations();
});

function initLuxuryRevealAnimations() {
  const elementsToReveal = document.querySelectorAll('.fade-up, .fade-in');
  
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          // Once revealed, no need to track it further
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    elementsToReveal.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback: Reveal immediately if browser doesn't support IntersectionObserver
    elementsToReveal.forEach(el => el.classList.add('reveal'));
  }
}
