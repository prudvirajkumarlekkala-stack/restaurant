/* ===========================
   EMBER & ASH — MAIN JS
   =========================== */

// ── Navbar scroll effect ──────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ── Hamburger menu ────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', navLinks.classList.contains('open'));
  });
  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ── Ember particle canvas ─────────────────────────
const canvas = document.getElementById('emberCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 10;
      this.size = Math.random() * 3 + 1;
      this.speedY = Math.random() * 1.5 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.hue = Math.random() * 30 + 10; // orange-red range
    }
    update() {
      this.y -= this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.02) * 0.4;
      this.opacity -= 0.003;
      if (this.opacity <= 0 || this.y < -10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
      grad.addColorStop(0, `hsl(${this.hue}, 100%, 80%)`);
      grad.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < 80; i++) {
    const p = new Particle();
    p.y = Math.random() * canvas.height; // scatter initial positions
    particles.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

// ── Scroll reveal ─────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => observer.observe(el));
}

// ── Toast notification ────────────────────────────
function showToast(msg, duration = 3000) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Gallery filter & lightbox ─────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const masonryItems = document.querySelectorAll('.masonry-item');

if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      masonryItems.forEach(item => {
        if (cat === 'all' || item.dataset.category === cat) {
          item.style.display = '';
          setTimeout(() => item.style.opacity = '1', 10);
        } else {
          item.style.opacity = '0';
          setTimeout(() => item.style.display = 'none', 300);
        }
      });
    });
  });
}

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
let currentIndex = 0;
const galleryImgs = Array.from(document.querySelectorAll('.masonry-item img'));

function openLightbox(index) {
  if (!lightbox || !lightboxImg) return;
  currentIndex = index;
  lightboxImg.src = galleryImgs[index].src;
  lightboxImg.alt = galleryImgs[index].alt;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

if (lightbox) {
  galleryImgs.forEach((img, i) => {
    img.parentElement.addEventListener('click', () => openLightbox(i));
  });
  document.getElementById('lightboxClose')?.addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev')?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + galleryImgs.length) % galleryImgs.length;
    lightboxImg.src = galleryImgs[currentIndex].src;
  });
  document.getElementById('lightboxNext')?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % galleryImgs.length;
    lightboxImg.src = galleryImgs[currentIndex].src;
  });
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') document.getElementById('lightboxPrev')?.click();
    if (e.key === 'ArrowRight') document.getElementById('lightboxNext')?.click();
  });
}

// ── Star picker (review form) ─────────────────────
const starPicker = document.querySelector('.star-picker');
if (starPicker) {
  const stars = starPicker.querySelectorAll('span');
  let selectedRating = 0;

  stars.forEach((star, i) => {
    star.addEventListener('mouseover', () => highlightStars(i));
    star.addEventListener('mouseleave', () => highlightStars(selectedRating - 1));
    star.addEventListener('click', () => {
      selectedRating = i + 1;
      highlightStars(i);
    });
  });

  function highlightStars(upTo) {
    stars.forEach((s, i) => {
      s.classList.toggle('lit', i <= upTo);
    });
  }
}

// ── Password strength ─────────────────────────────
const passInput = document.getElementById('password');
const strengthBars = document.querySelectorAll('.pass-strength span');
if (passInput && strengthBars.length) {
  passInput.addEventListener('input', () => {
    const val = passInput.value;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    strengthBars.forEach((bar, i) => {
      bar.className = '';
      if (i < score) {
        bar.classList.add(score <= 1 ? 'weak' : score <= 2 ? 'medium' : 'strong');
      }
    });
  });
}

// ── Login form ────────────────────────────────────
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('#email').value;
    if (!email) return;
    loginForm.style.display = 'none';
    document.getElementById('loginSuccess').style.display = 'block';
  });
}

// ── Signup form ───────────────────────────────────
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('password')?.value;
    const confirm = document.getElementById('confirmPassword')?.value;
    if (pass !== confirm) {
      showToast('Passwords do not match.');
      return;
    }
    signupForm.style.display = 'none';
    document.getElementById('signupSuccess').style.display = 'block';
  });
}

// ── Review form ───────────────────────────────────
const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Thank you! Your review has been submitted.');
    reviewForm.reset();
    document.querySelectorAll('.star-picker span').forEach(s => s.classList.remove('lit'));
  });
}
