// ====== CAMBIA AQUÍ TU NÚMERO DE WHATSAPP (código de país + número, sin + ni espacios) ======
const WHATSAPP = "51900000000";
// ============================================================================================

const form = document.getElementById("cotizar");
const err = document.getElementById("q-error");
const lot = document.getElementById("order-no");
const root = document.documentElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

document.getElementById("yr").textContent = new Date().getFullYear();

const wa = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
document.getElementById("wa-direct").href = wa("Hola TEW Confecciones, quiero cotizar un pedido.");

// Garment chip -> thread colour + cone label code
const radios = [...form.querySelectorAll('input[name="prenda"]')];
function pickColor() {
  const r = radios.find((x) => x.checked);
  root.style.setProperty("--thread", r.dataset.color);
  lot.textContent = String(radios.indexOf(r) + 1).padStart(2, "0");
}
radios.forEach((r) => r.addEventListener("change", pickColor));
pickColor();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = new FormData(form);
  const qty = parseInt(d.get("cantidad"), 10);
  const brand = (d.get("empresa") || "").trim();
  if (!qty || qty < 1) return fail("Indica cuántas prendas necesitas.", "cantidad");
  if (!brand) return fail("Escribe el nombre de tu empresa o marca.", "empresa");
  err.hidden = true;
  const detail = (d.get("detalle") || "").trim();
  const msg =
    `Hola TEW Confecciones, quiero cotizar un pedido.\n` +
    `• Prenda: ${d.get("prenda")}\n• Cantidad: ${qty}\n• Empresa/marca: ${brand}` +
    (detail ? `\n• Detalle: ${detail}` : "");
  window.open(wa(msg), "_blank", "noopener");
});

function fail(text, name) {
  err.textContent = text;
  err.hidden = false;
  form.elements[name].focus();
}

// ---- The thread: one line sewn down the page through [data-thread] anchors ----
const svg = document.getElementById("thread");
const paths = svg.querySelectorAll("path");
let len = 0;

function build() {
  const W = document.documentElement.clientWidth;
  const H = document.documentElement.scrollHeight;
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const narrow = W < 760;
  const pts = [...document.querySelectorAll("[data-thread]")].map((el) => {
    const b = el.getBoundingClientRect();
    const y = b.top + scrollY;
    const k = el.dataset.thread;
    if (k === "start") return [b.left + b.width / 2, y + 6];
    if (narrow) return [W - 14, y + b.height / 2];
    if (k === "right") return [Math.min(W - 24, b.right + 40), y + b.height / 2];
    if (k === "left") return [Math.max(24, b.left - 28), y + b.height / 2];
    if (k === "end") return [W / 2, y - 30];
    return [b.left + b.width / 2, y + b.height + 30];
  });
  if (pts.length < 2) return;
  // the thread leaves the cone upward, loops over the rack, then falls
  const [sx, sy] = pts[0];
  let d = `M${sx} ${sy} C ${sx} ${sy - 70}, ${sx + 120} ${sy - 60}, ${sx + 110} ${sy + 60}`;
  let [px, py] = [sx + 110, sy + 60];
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    const m = (y - py) * 0.5;
    d += ` C ${px} ${py + m}, ${x} ${y - m}, ${x} ${y}`;
    [px, py] = [x, y];
  }
  paths.forEach((p) => p.setAttribute("d", d));
  len = paths[1].getTotalLength();
  paths.forEach((p) => (p.style.strokeDasharray = `${len} ${len}`));
  draw();
}

function draw() {
  if (reduce) { paths.forEach((p) => (p.style.strokeDashoffset = 0)); return; }
  const H = document.documentElement.scrollHeight;
  const prog = Math.min(1, (scrollY + innerHeight * 0.85) / H);
  paths.forEach((p) => (p.style.strokeDashoffset = len * (1 - prog)));
}

addEventListener("scroll", () => requestAnimationFrame(draw), { passive: true });
addEventListener("resize", () => requestAnimationFrame(build));
document.fonts.ready.then(build);
addEventListener("load", build);

// ---- Process row lights step by step as it comes into view ----
const steps = [...document.querySelectorAll("#steps li")];
if (reduce || !("IntersectionObserver" in window)) {
  steps.forEach((s) => s.classList.add("on"));
} else {
  new IntersectionObserver((ents, obs) => {
    ents.forEach((en) => {
      if (!en.isIntersecting) return;
      steps.forEach((s, i) => setTimeout(() => s.classList.add("on"), i * 260));
      obs.disconnect();
    });
  }, { threshold: 0.35 }).observe(document.getElementById("steps"));
}
