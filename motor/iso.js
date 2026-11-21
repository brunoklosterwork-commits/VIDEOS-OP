// iso.js — motor 2.5D "maqueta blanca" para VIDEOS OP.
// Proyección isométrica en canvas 2D, sólidos tipo arcilla blanca con
// sombreado por cara, sombras suaves difusas, oclusión de contacto y un solo
// color de acento. Sin dependencias.

export const PAL = {
  fondoA: '#f3f5f9', fondoB: '#e4e8f0',
  blanco: [246, 247, 250],          // material base (arcilla)
  acento: [38, 92, 235],            // azul OP (prueba)
  acentoClaro: [96, 140, 250],
  tinta: '#1b2233', tintaSuave: '#7a8399',
};

const COS = Math.cos(Math.PI / 6), SIN = Math.sin(Math.PI / 6);
// luz: arriba-izquierda-atrás
const LUZ = norm([-0.55, -0.35, 0.76]);
function norm(v) { const l = Math.hypot(...v); return v.map(c => c / l); }

export class Escena {
  constructor(ctx, { escala = 60, ox = 540, oy = 900 } = {}) {
    this.ctx = ctx; this.s = escala; this.ox = ox; this.oy = oy; this.items = [];
  }
  p(x, y, z = 0) { // mundo -> pantalla
    return [this.ox + (x - y) * COS * this.s, this.oy + ((x + y) * SIN - z) * this.s];
  }
  // prisma: huella poligonal (lista [x,y]) extruida de z0 a z1
  prisma(huella, z0, z1, { color = PAL.blanco, brillo = 0, sombra = true, opac = 1, suelo = false, prof = null } = {}) {
    const cx = huella.reduce((a, q) => a + q[0], 0) / huella.length;
    const cy = huella.reduce((a, q) => a + q[1], 0) / huella.length;
    this.items.push({ tipo: 'prisma', huella, z0, z1, color, brillo, sombra: sombra && !suelo, opac, suelo, prof: prof ?? (cx + cy + z0 * 0.01) });  // prof: forzar orden de dibujo
    return this;
  }
  caja(x, y, z, w, d, h, o = {}) {
    return this.prisma([[x, y], [x + w, y], [x + w, y + d], [x, y + d]], z, z + h, o);
  }
  // caja rotada alrededor de un eje vertical (para puertas que abren)
  cajaRot(px, py, z, w, d, h, ang, o = {}) {
    const c = Math.cos(ang), s = Math.sin(ang);
    const pts = [[0, 0], [w, 0], [w, d], [0, d]].map(([a, b]) => [px + a * c - b * s, py + a * s + b * c]);
    return this.prisma(pts, z, z + h, o);
  }
  esfera(x, y, z, r, o = {}) {
    this.items.push({ tipo: 'esfera', x, y, z, r, color: o.color || PAL.blanco, sombra: o.sombra !== false, prof: x + y + z * 0.01 + 0.001 });
    return this;
  }
  dibujar(extra) { // extra(ctx) se llama después de las sombras y antes de los sólidos
    const ctx = this.ctx;
    // 0) suelos (maqueta, veredas, pisos) en orden de altura
    const suelos = this.items.filter(i => i.suelo).sort((a, b) => a.z1 - b.z1 || a.prof - b.prof);
    for (const it of suelos) this._prisma(it);
    this.items = this.items.filter(i => !i.suelo);
    // 1) sombras difusas: se dibujan a 1/4 de resolución y se escalan (rápido)
    const W = ctx.canvas.width, Hh = ctx.canvas.height, Q = 4;
    if (!Escena._off || Escena._off.width !== W / Q) Escena._off = new OffscreenCanvas(W / Q, Hh / Q);
    const off = Escena._off, oc = off.getContext('2d');
    oc.setTransform(1, 0, 0, 1, 0, 0); oc.clearRect(0, 0, off.width, off.height);
    const real = this.ctx; this.ctx = oc;
    oc.setTransform(1 / Q, 0, 0, 1 / Q, 0, 0);
    oc.filter = `blur(${this.s * 0.35 / Q}px)`;
    for (const it of this.items) if (it.sombra) this._sombra(it, 0.16, 0.9);
    oc.filter = `blur(${this.s * 0.08 / Q}px)`;
    for (const it of this.items) if (it.sombra) this._sombra(it, 0.22, 0.25); // contacto
    oc.filter = 'none'; this.ctx = real;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(off, 0, 0, W, Hh); ctx.restore();
    if (extra) extra(ctx);
    // 2) sólidos por profundidad
    this.items.sort((a, b) => a.prof - b.prof);
    for (const it of this.items) it.tipo === 'prisma' ? this._prisma(it) : this._esfera(it);
  }
  _sombra(it, alfa, largo) {
    const ctx = this.ctx, k = largo;
    const desp = h => [-LUZ[0] / LUZ[2] * h * k, -LUZ[1] / LUZ[2] * h * k];
    ctx.fillStyle = `rgba(40,52,80,${alfa})`;
    if (it.tipo === 'esfera') {
      const [dx, dy] = desp(it.z + it.r);
      const [sx, sy] = this.p(it.x + dx, it.y + dy, 0);
      ctx.beginPath(); ctx.ellipse(sx, sy, it.r * this.s * 1.0, it.r * this.s * 0.55, 0, 0, 7); ctx.fill();
      return;
    }
    if (it.z0 > 0.05 && largo < 0.5) return;
    const [dx, dy] = desp(it.z1 - it.z0 * 0.5);
    const base = it.huella.map(([x, y]) => this.p(x, y, 0));
    const proy = it.huella.map(([x, y]) => this.p(x + dx, y + dy, 0));
    ctx.beginPath();
    // envolvente simple: base + proyección
    const todos = hull([...base, ...proy]);
    todos.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
    ctx.closePath(); ctx.globalAlpha = it.opac; ctx.fill(); ctx.globalAlpha = 1;
  }
  _prisma(it) {
    const ctx = this.ctx, H = it.huella, n = H.length;
    ctx.globalAlpha = it.opac;
    // caras laterales visibles (normal hacia el espectador: +x+y)
    const ccw = area(H) > 0 ? 1 : -1;
    const lados = [];
    for (let i = 0; i < n; i++) {
      const a = H[i], b = H[(i + 1) % n];
      const ex = b[0] - a[0], ey = b[1] - a[1];
      const nx = ey * ccw, ny = -ex * ccw; // normal hacia afuera
      const l = Math.hypot(nx, ny) || 1;
      if (nx / l + ny / l <= 0.001) continue;
      lados.push({ a, b, n: [nx / l, ny / l, 0], d: a[0] + a[1] + b[0] + b[1] });
    }
    lados.sort((p, q) => p.d - q.d);
    for (const L of lados) {
      const pts = [this.p(L.a[0], L.a[1], it.z0), this.p(L.b[0], L.b[1], it.z0), this.p(L.b[0], L.b[1], it.z1), this.p(L.a[0], L.a[1], it.z1)];
      const t = tono(it.color, L.n, it.brillo);
      // degradé vertical: oclusión cerca del piso
      const g = ctx.createLinearGradient(0, pts[0][1], 0, pts[3][1]);
      g.addColorStop(0, rgb(mezcla(t, [150, 160, 185], it.z0 < 0.05 ? 0.10 : 0.03)));
      g.addColorStop(Math.min(1, 0.35 / Math.max(0.2, it.z1 - it.z0)), rgb(t));
      g.addColorStop(1, rgb(t));
      poly(ctx, pts, g);
    }
    // tapa
    const top = H.map(([x, y]) => this.p(x, y, it.z1));
    poly(ctx, top, rgb(tono(it.color, [0, 0, 1], it.brillo)));
    // bisel: filo de luz en los bordes delanteros de la tapa
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = Math.max(1, this.s * 0.03);
    ctx.beginPath(); top.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  _esfera(it) {
    const ctx = this.ctx, [x, y] = this.p(it.x, it.y, it.z + it.r), r = it.r * this.s;
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r * 1.05);
    g.addColorStop(0, rgb(mezcla(it.color, [255, 255, 255], 0.45)));
    g.addColorStop(0.6, rgb(it.color));
    g.addColorStop(1, rgb(mezcla(it.color, [20, 30, 70], 0.35)));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
}

// ---------- utilidades ----------
export function rgb(c, a = 1) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; }
export function mezcla(a, b, t) { return a.map((v, i) => v + (b[i] - v) * t); }
function tono(c, n, brillo) {
  const d = Math.max(0, n[0] * LUZ[0] + n[1] * LUZ[1] + n[2] * LUZ[2]);
  const f = 0.88 + 0.14 * d + brillo; // ambiente alto = look arcilla suave
  const base = c.map(v => v * f);
  return n[2] > 0.5 ? mezcla(base, [255, 255, 255], 0.25) : base;
}
function poly(ctx, pts, fill) {
  ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = typeof fill === 'string' ? fill : 'rgba(0,0,0,0)'; ctx.lineWidth = 0.6; ctx.stroke(); // sin costuras
}
function area(P) { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; }
function hull(P) {
  P = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of P.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

// fondo de estudio: degradé suave + viñeta
export function fondo(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, PAL.fondoA); g.addColorStop(1, PAL.fondoB);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const v = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.25, W / 2, H * 0.55, H * 0.8);
  v.addColorStop(0, 'rgba(255,255,255,0.35)'); v.addColorStop(1, 'rgba(160,170,195,0.18)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

// camino luminoso de acento (lista de puntos de mundo en z≈0)
export function camino(esc, pts, prog = 1, ancho = 0.16) {
  const ctx = esc.ctx, P = pts.map(([x, y]) => esc.p(x, y, 0.02));
  let total = 0; const seg = [];
  for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(l); total += l; }
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.setLineDash([total * prog, total * 2]);
  for (const [w, c] of [[ancho * 4, rgb(PAL.acento, 0.18)], [ancho * 1.6, rgb(PAL.acentoClaro, 0.5)], [ancho, rgb(PAL.acento)]]) {
    ctx.lineWidth = w * esc.s; ctx.strokeStyle = c; ctx.beginPath();
    P.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
  }
  ctx.restore();
}

// tarjeta flotante tipo UI (pantalla) — estilo de las referencias
export function tarjeta(ctx, x, y, w, h, dibujarDentro) {
  ctx.save();
  ctx.shadowColor = 'rgba(40,55,95,0.18)'; ctx.shadowBlur = 50; ctx.shadowOffsetY = 24;
  redondeado(ctx, x, y, w, h, 28); ctx.fillStyle = 'rgba(255,255,255,0.94)'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(255,255,255,1)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.translate(x, y); dibujarDentro && dibujarDentro(ctx, w, h);
  ctx.restore();
}
export function redondeado(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
