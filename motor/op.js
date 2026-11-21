// op.js — piezas comunes de los videos OP: tiempos, subtítulos, titulares, marca, cotas.
import { PAL, rgb, redondeado, tarjeta } from './iso.js';

export const W = 1080, H = 1920;
// Subtítulos centrados sobre la línea del tercio inferior (regla de tercios en 9:16).
export const SUB_Y = Math.round(H * 2 / 3);
export const ease = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
export const easeOut = t => t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3);
export const rebote = t => { // sale de 0, pasa de 1 y se asienta
  if (t <= 0) return 0; if (t >= 1) return 1;
  return 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-t * 5.5);
};
export const k = (t, a, d) => Math.max(0, Math.min(1, (t - a) / d)); // progreso 0..1

// Tiempos de frases: usa tiempos.json (de alinear.py) o estima por largo.
export async function cargarTiempos(frases) {
  try {
    const r = await fetch('tiempos.json'); if (r.ok) return await r.json();
  } catch (e) { }
  let t = 0.25; const out = [];
  for (const f of frases) { const d = f.replace(/[^\wáéíóúñü]/gi, '').length * 0.068 + 0.25; out.push([t, t + d, f]); t += d + 0.3; }
  return out;
}

// Texto que se muestra (números en cifras) a partir del texto hablado.
const MOSTRAR = [[/dos metros cincuenta/gi, '2,50 m'], [/un metro/gi, '1 m'], [/quince/gi, '15'], [/\bcinco\b/gi, '5']];
export function mostrar(s) { for (const [a, b] of MOSTRAR) s = s.replace(a, b); return s; }

// Parte cada frase en pedacitos de hasta 4 palabras, con tiempo proporcional al largo.
export function subtitulos(tiempos) {
  const out = [];
  for (const [a, b, txt] of tiempos) {
    const pal = mostrar(txt).replace(/(\d[\d,]*) m\b/g, '$1_m').replace(/[¿?:.!¡]|,(?!\d)/g, ' ').toLowerCase().split(/\s+/).filter(Boolean);
    const grupos = []; for (let i = 0; i < pal.length;) { const n = pal.length - i === 5 ? 3 : Math.min(4, pal.length - i); grupos.push(pal.slice(i, i + n)); i += n; }
    const tot = grupos.reduce((s, g) => s + g.join(' ').length, 0); let t = a;
    for (const g of grupos) { const d = (b - a) * g.join(' ').length / tot; out.push([t, t + d, g.join(' ').replace(/_/g, ' ')]); t += d; }
  }
  return out;
}

export function dibujarSub(ctx, subs, t, resaltar = []) {
  const s = subs.find(([a, b], i) => t >= a && t < (subs[i + 1] ? Math.min(subs[i + 1][0], b + 0.6) : b + 0.6));
  if (!s) return;
  const pop = easeOut(k(t, s[0], 0.12));
  ctx.save(); ctx.font = '700 60px "DM Sans"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const w = ctx.measureText(s[2]).width + 76, x = (W - w) / 2, y = SUB_Y - 48;
  ctx.translate(W / 2, y + 48); ctx.scale(0.9 + 0.1 * pop, 0.9 + 0.1 * pop); ctx.translate(-W / 2, -(y + 48));
  ctx.globalAlpha = pop;
  redondeado(ctx, x, y, w, 96, 48); ctx.fillStyle = 'rgba(27,34,51,0.93)'; ctx.fill();
  // palabras clave en azul claro
  const pal = s[2].split(' '); let cx = x + 38;
  ctx.textAlign = 'left';
  for (const p of pal) {
    ctx.fillStyle = resaltar.some(r => p.includes(r)) ? rgb(PAL.acentoClaro) : '#fff';
    ctx.fillText(p, cx, y + 50); cx += ctx.measureText(p + ' ').width;
  }
  ctx.restore();
}

export function marca(ctx) {
  ctx.save(); ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = PAL.tinta; ctx.font = '700 40px "DM Sans"'; ctx.fillText('OP', 80, 130);
  ctx.font = '400 40px "DM Sans"'; ctx.fillStyle = PAL.tintaSuave; ctx.fillText('sistemas', 140, 130);
  ctx.restore();
}

// Titular: líneas [[texto, acento?], ...], entra palabra por palabra desde abajo.
export function titular(ctx, lineas, t, t0, { y = 290, tam = 96 } = {}) {
  ctx.save(); ctx.font = `800 ${tam}px "DM Sans"`; ctx.textBaseline = 'alphabetic';
  lineas.forEach(([txt, ac], i) => {
    const p = easeOut(k(t, t0 + i * 0.12, 0.45));
    ctx.globalAlpha = p; ctx.fillStyle = ac ? rgb(PAL.acento) : PAL.tinta;
    ctx.fillText(txt, 80, y + i * tam * 1.08 + (1 - p) * 40);
  });
  ctx.restore();
}

// Cota (línea de medida) entre dos puntos de pantalla, con etiqueta.
export function cota(ctx, a, b, texto, prog, lado = 'der') {
  if (prog <= 0) return;
  const x = a[0] + (b[0] - a[0]) * prog, y = a[1] + (b[1] - a[1]) * prog;
  ctx.save(); ctx.strokeStyle = rgb(PAL.acento); ctx.lineWidth = 5; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(x, y); ctx.stroke();
  const tick = (p) => { ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, 7); ctx.fillStyle = rgb(PAL.acento); ctx.fill(); };
  tick(a); if (prog > 0.98) tick(b);
  const q = easeOut(k(prog, 0.8, 0.2));
  if (q > 0) {
    ctx.globalAlpha = q; ctx.font = '800 54px "DM Sans"';
    const tw = ctx.measureText(texto).width + 48, mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const px = lado === 'der' ? mx + 30 : lado === 'izq' ? mx - 30 - tw : mx - tw / 2;
    const py = lado === 'arr' ? my - 110 : my - 42;
    ctx.shadowColor = 'rgba(38,92,235,0.35)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    redondeado(ctx, px, py, tw, 84, 42); ctx.fillStyle = rgb(PAL.acento); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(texto, px + 24, py + 44);
  }
  ctx.restore();
}

export function tilde(ctx, x, y, r, p) { // círculo con check
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = p > 0 ? rgb(PAL.acento, 0.12 + 0.88 * p) : '#e8ecf4'; ctx.fill();
  if (p > 0) {
    ctx.strokeStyle = '#fff'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const pts = [[x - r * 0.42, y + r * 0.02], [x - r * 0.1, y + r * 0.34], [x + r * 0.45, y - r * 0.3]];
    ctx.setLineDash([r * 2 * p, r * 3]); ctx.beginPath(); pts.forEach(([a, b], i) => i ? ctx.lineTo(a, b) : ctx.moveTo(a, b)); ctx.stroke();
  }
  ctx.restore();
}

export { tarjeta, redondeado, rgb, PAL };
