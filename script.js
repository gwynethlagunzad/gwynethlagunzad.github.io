// ---- Theme toggle (remembers choice) ----
const root = document.documentElement;
const themeBtn = document.getElementById("themeToggle");

try {
  const saved = localStorage.getItem("theme");
  if (saved) root.setAttribute("data-theme", saved);
} catch (e) {}

themeBtn.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ---- Mobile menu ----
const navLinks = document.getElementById("navLinks");
document.getElementById("menuBtn").addEventListener("click", () => {
  navLinks.classList.toggle("open");
});
navLinks.querySelectorAll("a").forEach(a =>
  a.addEventListener("click", () => navLinks.classList.remove("open"))
);

// ---- "See more" buttons (videos + designs) ----
function setupSeeMore(btnId, selector, moreText, lessText) {
  const btn = document.getElementById(btnId);
  const items = document.querySelectorAll(selector);
  if (!btn) return;
  let open = false;
  btn.addEventListener("click", () => {
    open = !open;
    items.forEach(el => (el.hidden = !open));
    btn.textContent = open ? lessText : moreText;
  });
}
setupSeeMore("seeMore", "#videoGrid .card.extra", "See more videos", "Show fewer videos");
setupSeeMore("seeMoreDesigns", "#designGrid .card.extra", "See more designs", "Show fewer designs");

// ---- Carousel overlay (lightbox) ----
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbVideo = document.getElementById("lbVideo");
const lbCount = document.getElementById("lbCount");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");
const lbClose = document.getElementById("lbClose");

let slides = [];
let current = 0;
let title = "";
let lastFocus = null;

function showSlide() {
  const src = slides[current];
  if (/\.(mp4|webm|mov)$/i.test(src)) {
    lbImg.hidden = true;
    lbVideo.hidden = false;
    lbVideo.src = src;
    lbVideo.play().catch(() => {});
  } else {
    lbVideo.pause();
    lbVideo.hidden = true;
    lbVideo.removeAttribute("src");
    lbVideo.load();
    lbImg.hidden = false;
    lbImg.src = src;
  }
  lbImg.alt = title + " — slide " + (current + 1);
  lbCount.textContent = title + "  ·  " + (current + 1) + " / " + slides.length;
}

function openLightbox(card) {
  slides = card.dataset.slides.split(",").map(s => s.trim()).filter(Boolean);
  title = card.dataset.title || "Design";
  current = 0;
  lastFocus = card;

  const multi = slides.length > 1;
  lbPrev.hidden = !multi;
  lbNext.hidden = !multi;

  showSlide();
  lightbox.hidden = false;
  document.body.classList.add("no-scroll");
  lbClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lbImg.src = "";
  lbVideo.pause();
  lbVideo.removeAttribute("src");
  lbVideo.load();
  document.body.classList.remove("no-scroll");
  if (lastFocus) lastFocus.focus();
}

function go(step) {
  if (slides.length < 2) return;
  current = (current + step + slides.length) % slides.length;
  showSlide();
}

document.querySelectorAll(".card.carousel").forEach(card =>
  card.addEventListener("click", () => openLightbox(card))
);

lbClose.addEventListener("click", closeLightbox);
lbPrev.addEventListener("click", () => go(-1));
lbNext.addEventListener("click", () => go(1));

// click the dark background (not the image or buttons) to close
lightbox.addEventListener("click", e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", e => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") go(-1);
  if (e.key === "ArrowRight") go(1);
});

// swipe on phones
let touchX = null;
lightbox.addEventListener("touchstart", e => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend", e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  touchX = null;
});

// ---- Scroll reveal ----
const revealTargets = document.querySelectorAll(".section:not(.intro), .card");
revealTargets.forEach(el => el.classList.add("reveal"));

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealTargets.forEach(el => observer.observe(el));

// ---- Intro text lights up word by word as you scroll ----
const introEl = document.querySelector("[data-scroll-type]");
if (introEl) {
  const words = introEl.textContent.trim().split(/\s+/);
  introEl.textContent = "";
  const spans = words.map(word => {
    const s = document.createElement("span");
    s.className = "w";
    s.textContent = word + " ";
    introEl.appendChild(s);
    return s;
  });

  const updateIntro = () => {
    const r = introEl.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.3)));
    const lit = Math.round(p * spans.length);
    spans.forEach((s, i) => s.classList.toggle("on", i < lit));
  };

  window.addEventListener("scroll", updateIntro, { passive: true });
  window.addEventListener("resize", updateIntro);
  updateIntro();
}

// ---- Footer year ----
document.getElementById("year").textContent = "© " + new Date().getFullYear();