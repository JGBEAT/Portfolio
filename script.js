const root = document.documentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Theme ---------- */
function applyTheme(theme) {
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#0d1b1f" : "#f6f5f2";
  try { localStorage.setItem("theme", theme); } catch {}
}

let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch {}
applyTheme(savedTheme === "light" ? "light" : "dark");

document.getElementById("theme-toggle").addEventListener("click", () => {
  applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
});

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Reveal & count-up ---------- */
const revealEls = document.querySelectorAll(".section > *:not(.section-num), .project, .toc-wrap");
revealEls.forEach((el) => el.classList.add("reveal"));

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    io.unobserve(entry.target);
  });
}, { threshold: 0.08 });
revealEls.forEach((el) => io.observe(el));

const counters = document.querySelectorAll("[data-count]");
const countIo = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    countIo.unobserve(el);
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / 900, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
counters.forEach((el) => countIo.observe(el));

/* ---------- Cursor glow (flashlight) ---------- */
if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (e) => {
    root.style.setProperty("--mx", e.clientX + "px");
    root.style.setProperty("--my", e.clientY + "px");
  }, { passive: true });
}

/* ---------- Depth gauge & O2 ---------- */
const depthEl = document.getElementById("depth");
const o2El = document.getElementById("o2");
const fillEl = document.getElementById("gauge-fill");
const footerLine = document.getElementById("footer-line");
const footerDefault = footerLine.innerHTML;
const MAX_DEPTH = 300;
let ticking = false;

function updateGauge() {
  ticking = false;
  const max = document.documentElement.scrollHeight - innerHeight;
  const p = max > 0 ? Math.min(Math.max(scrollY / max, 0), 1) : 0;
  root.style.setProperty("--depth", (p * 0.85).toFixed(3));
  depthEl.textContent = Math.round(p * MAX_DEPTH);
  o2El.textContent = Math.round(100 - p * 88);
  fillEl.style.height = (p * 100).toFixed(1) + "%";
  footerLine.innerHTML = p > 0.985
    ? "呼——你一路潛到最底了，感謝觀看。氧氣還剩 12%。"
    : footerDefault;
}
addEventListener("scroll", () => {
  if (!ticking) { ticking = true; requestAnimationFrame(updateGauge); }
}, { passive: true });
addEventListener("resize", updateGauge);
updateGauge();

/* ---------- Hero bubbles ---------- */
(function bubbles() {
  const canvas = document.getElementById("bubbles");
  const hero = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1, running = false, list = [];

  const rgb = () => getComputedStyle(root).getPropertyValue("--bubble").trim();

  function make(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 10,
      r: 1.5 + Math.random() * 5,
      v: 0.25 + Math.random() * 0.7,
      sway: Math.random() * Math.PI * 2,
      amp: 6 + Math.random() * 16,
    };
  }

  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(w / 28, 46));
    list = Array.from({ length: n }, () => make(true));
    if (reduceMotion) draw(0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const c = rgb();
    for (const b of list) {
      const x = b.x + Math.sin(t / 900 + b.sway) * b.amp;
      ctx.beginPath();
      ctx.arc(x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${c}, .35)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x - b.r * .3, b.y - b.r * .3, b.r * .25, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c}, .45)`;
      ctx.fill();
    }
  }

  function frame(t) {
    if (!running) return;
    for (let i = 0; i < list.length; i++) {
      const b = list[i];
      b.y -= b.v;
      if (b.y < -10) list[i] = make(false);
    }
    draw(t);
    requestAnimationFrame(frame);
  }

  function start() { if (!running && !reduceMotion) { running = true; requestAnimationFrame(frame); } }
  function stop() { running = false; }

  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(hero);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  addEventListener("resize", resize);
  resize();
})();

/* ---------- Tabs ---------- */
(function tabs() {
  const tabs = [...document.querySelectorAll('.tabs [role="tab"]')];
  function select(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      const keys = { ArrowRight: 1, ArrowLeft: -1 };
      if (e.key in keys) {
        e.preventDefault();
        select(tabs[(i + keys[e.key] + tabs.length) % tabs.length], true);
      } else if (e.key === "Home") { e.preventDefault(); select(tabs[0], true); }
      else if (e.key === "End") { e.preventDefault(); select(tabs[tabs.length - 1], true); }
    });
  });
})();

/* ---------- Lightbox ---------- */
(function lightbox() {
  const dlg = document.getElementById("lightbox");
  const img = dlg.querySelector("img");
  const cap = dlg.querySelector(".lb-caption");
  let items = [];
  let index = 0;

  function show(i) {
    index = (i + items.length) % items.length;
    const btn = items[index];
    const src = btn.querySelector("img");
    img.src = src.currentSrc || src.src;
    img.alt = src.alt;
    cap.textContent = btn.dataset.caption || src.alt;
  }

  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".shot-btn");
    if (!btn) return;
    items = [...document.querySelectorAll(".shot-btn")].filter((b) => b.offsetParent !== null);
    show(items.indexOf(btn));
    dlg.showModal();
  });

  dlg.querySelector(".lb-close").addEventListener("click", () => dlg.close());
  dlg.querySelector(".prev").addEventListener("click", () => show(index - 1));
  dlg.querySelector(".next").addEventListener("click", () => show(index + 1));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
})();
