// Sanique Cosmetics - Luxury Hero Slider Script

let activeSlideIdx = 0;
let sliderTimer;

document.addEventListener('DOMContentLoaded', () => {
  initLuxurySlider();
  initHeroParticles();
});

function initLuxurySlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  if (slides.length === 0) return;

  const showSlide = (idx) => {
    slides.forEach((slide, sIdx) => {
      if (sIdx === idx) {
        slide.classList.add('active');
        if (dots[sIdx]) dots[sIdx].classList.add('active');
        
        // GSAP animate text layers for premium entrance
        if (window.gsap) {
          const subtitle = slide.querySelector('.hero-subtitle');
          const title = slide.querySelector('.hero-title');
          const desc = slide.querySelector('.hero-description');
          const btns = slide.querySelector('.hero-btns');
          const image = slide.querySelector('.hero-image-render');

          gsap.fromTo(subtitle, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
          gsap.fromTo(title, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 });
          gsap.fromTo(desc, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out', delay: 0.3 });
          gsap.fromTo(btns, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1.2, ease: 'power2.out', delay: 0.45 });
          gsap.fromTo(image, { opacity: 0, scale: 0.95, rotate: -3 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.5, ease: 'power2.out', delay: 0.2 });
        }
      } else {
        slide.classList.remove('active');
        if (dots[sIdx]) dots[sIdx].classList.remove('active');
      }
    });
    activeSlideIdx = idx;
  };

  window.changeSlide = (dir) => {
    let nextIdx = (activeSlideIdx + dir + slides.length) % slides.length;
    showSlide(nextIdx);
    resetTimer();
  };

  window.setSlide = (idx) => {
    showSlide(idx);
    resetTimer();
  };

  const startTimer = () => {
    sliderTimer = setInterval(() => {
      window.changeSlide(1);
    }, 7000);
  };

  const resetTimer = () => {
    clearInterval(sliderTimer);
    startTimer();
  };

  showSlide(0);
  startTimer();
}

// ==========================================
// HERO GOLD DUST PARTICLES CANVAS SYSTEM
// ==========================================
function initHeroParticles() {
  const canvas = document.getElementById('hero-particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = canvas.offsetWidth);
  let height = (canvas.height = canvas.offsetHeight);

  const particles = [];
  const particleCount = 45;

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * height;
    }

    reset() {
      this.x = Math.random() * width;
      this.y = -20;
      this.size = Math.random() * 3 + 1.2;
      this.speedY = Math.random() * 0.7 + 0.3;
      this.speedX = Math.random() * 0.6 - 0.3;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.rotateSpeed = Math.random() * 0.02 - 0.01;
      this.rotation = Math.random() * Math.PI * 2;
    }

    update(mouseX, mouseY) {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotateSpeed;

      // Mouse influence (drifting gold dust)
      if (mouseX !== undefined && mouseY !== undefined) {
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (180 - dist) / 180;
          this.x += (dx / dist) * force * 1.5;
          this.y += (dy / dist) * force * 1.5;
        }
      }

      if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.beginPath();
      ctx.moveTo(0, -this.size * 1.5);
      ctx.lineTo(this.size, 0);
      ctx.lineTo(0, this.size * 1.5);
      ctx.lineTo(-this.size, 0);
      ctx.closePath();
      
      const goldGrad = ctx.createLinearGradient(-this.size, -this.size, this.size, this.size);
      goldGrad.addColorStop(0, `rgba(212, 175, 55, ${this.opacity})`);
      goldGrad.addColorStop(0.5, `rgba(243, 219, 142, ${this.opacity * 1.2})`);
      goldGrad.addColorStop(1, `rgba(187, 134, 45, ${this.opacity * 0.8})`);
      
      ctx.fillStyle = goldGrad;
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  let mouseX, mouseY;
  const container = document.querySelector('.hero-slider-container');
  if (container) {
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      const xPercent = (mouseX / rect.width) - 0.5;
      const yPercent = (mouseY / rect.height) - 0.5;

      const activeSlide = container.querySelector('.hero-slide.active');
      if (activeSlide) {
        const floatImg = activeSlide.querySelector('.floating-product');
        const floatImgSec = activeSlide.querySelector('.floating-product-secondary');
        const shadow = activeSlide.querySelector('.floating-shadow');

        if (floatImg) {
          floatImg.style.transform = `translate(${xPercent * 30}px, ${yPercent * 30}px) rotate(${xPercent * 5 - 4}deg)`;
        }
        if (floatImgSec) {
          floatImgSec.style.transform = `translate(${xPercent * -50}px, ${yPercent * -50}px) rotate(${xPercent * -8 + 5}deg)`;
        }
        if (shadow) {
          shadow.style.transform = `translate(${xPercent * 15}px, ${yPercent * 15}px) scale(${1 + Math.abs(xPercent) * 0.15})`;
        }
      }
    }, { passive: true });

    container.addEventListener('mouseleave', () => {
      mouseX = undefined;
      mouseY = undefined;

      const activeSlide = container.querySelector('.hero-slide.active');
      if (activeSlide) {
        const floatImg = activeSlide.querySelector('.floating-product');
        const floatImgSec = activeSlide.querySelector('.floating-product-secondary');
        const shadow = activeSlide.querySelector('.floating-shadow');

        if (floatImg) floatImg.style.transform = 'translate(0px, 0px) rotate(-4deg)';
        if (floatImgSec) floatImgSec.style.transform = 'translate(0px, 0px) rotate(5deg)';
        if (shadow) shadow.style.transform = 'translate(0px, 0px) scale(1)';
      }
    }, { passive: true });
  }

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }, { passive: true });

  // Viewport checking to stop animation loop when off-screen (Core Web Vitals booster)
  let isCanvasVisible = true;
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isCanvasVisible = entry.isIntersecting;
      });
    }, { threshold: 0.05 });
    observer.observe(canvas);
  }

  function animate() {
    if (isCanvasVisible) {
      ctx.clearRect(0, 0, width, height);
      
      ctx.beginPath();
      ctx.arc(width * 0.75, height * 0.4, 300, 0, Math.PI * 2);
      const radGrad = ctx.createRadialGradient(width * 0.75, height * 0.4, 0, width * 0.75, height * 0.4, 300);
      radGrad.addColorStop(0, 'rgba(196, 106, 132, 0.05)');
      radGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = radGrad;
      ctx.fill();

      particles.forEach((p) => {
        p.update(mouseX, mouseY);
        p.draw();
      });
    }
    requestAnimationFrame(animate);
  }

  animate();
}
