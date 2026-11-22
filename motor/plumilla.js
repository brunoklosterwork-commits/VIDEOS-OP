// plumilla.js — estilo "Plumilla OP": papel, tinta y un solo azul.
// Tres niveles de valor: papel limpio / rayado paralelo / negro pleno.
export const PAPEL = '#e8e3d6', TINTA = '#2a2826', AZUL = '#2456d6';
export const W = 1080, H = 1920;

function rnd(s) { const x = Math.sin(s * 127.1) * 43758.5453; return x - Math.floor(x); }

export function crear(ctx) {
  const P = {};
  // rayado paralelo dentro de una forma; prog 0..1 lo va trazando (escalonado)
  P.rayar = (forma, ang, sep, { prog = 1, ancho = 2.2, color = TINTA, semilla = 1, curva = 0 } = {}) => {
    if (prog <= 0) return;
    ctx.save(); ctx.beginPath(); forma(ctx); ctx.clip();
    const c = Math.cos(ang), s = Math.sin(ang), L = 2600, n = Math.ceil(2600 / sep);
    ctx.strokeStyle = color; ctx.lineWidth = ancho; ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const p = Math.max(0, Math.min(1, prog * 1.6 - (i / n) * 0.6));
      if (p <= 0) continue;
      const d = -1300 + i * sep + (rnd(i + semilla) - 0.5) * sep * 0.25;
      const cx = W / 2 - s * d, cy = H / 2 + c * d, x0 = cx - c * L / 2, y0 = cy - s * L / 2;
      ctx.beginPath(); ctx.moveTo(x0, y0);
      if (curva) ctx.quadraticCurveTo(cx + s * curva, cy - c * curva, x0 + c * L * p, y0 + s * L * p);
      else ctx.lineTo(x0 + c * L * p, y0 + s * L * p);
      ctx.stroke();
    }
    ctx.restore();
  };
  P.contorno = (forma, { prog = 1, ancho = 4, color = TINTA } = {}) => {
    if (prog <= 0) return;
    ctx.save(); ctx.beginPath(); forma(ctx); ctx.strokeStyle = color; ctx.lineWidth = ancho; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.setLineDash([4000 * prog, 4000]); ctx.stroke(); ctx.restore();
  };
  // negro pleno que se pinta con un barrido
  P.negro = (forma, prog, { dir = 'x', color = TINTA } = {}) => {
    if (prog <= 0) return;
    ctx.save(); ctx.beginPath(); forma(ctx); ctx.clip(); ctx.fillStyle = color;
    ctx.setTransform(1, 0, 0, 1, 0, 0); // el recorte queda en pantalla; el barrido se hace en coordenadas de pantalla
    if (dir === 'x') ctx.fillRect(0, 0, W * prog, H); else ctx.fillRect(0, 0, W, H * prog);
    ctx.restore();
  };
  P.papel = (forma) => { ctx.save(); ctx.beginPath(); forma(ctx); ctx.fillStyle = PAPEL; ctx.fill(); ctx.restore(); };
  P.linea = (x1, y1, x2, y2, prog = 1, ancho = 3, color = TINTA) => {
    if (prog <= 0) return;
    ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = ancho; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x1 + (x2 - x1) * prog, y1 + (y2 - y1) * prog); ctx.stroke(); ctx.restore();
  };
  P.rect = (x, y, w, h) => c => c.rect(x, y, w, h);
  P.circ = (x, y, r) => c => c.arc(x, y, Math.max(0.01, r), 0, Math.PI * 2);
  P.anillo = (x, y, r1, r2) => c => { c.arc(x, y, r2, 0, Math.PI * 2); c.moveTo(x + r1, y); c.arc(x, y, r1, 0, Math.PI * 2, true); };
  P.fondo = () => { ctx.fillStyle = PAPEL; ctx.fillRect(0, 0, W, H); };

  // Ventana corrediza de aluminio con alero y vano en negro. o.prog: dibujo, o.abre: px que se corre la hoja.
  P.ventana = (VX, VY, VW, VH, t0, t, { abre = 0, alero = true, sem = 1 } = {}) => {
    const k = (a, d) => Math.max(0, Math.min(1, (t - t0 - a) / d)), e = x => x * x * (3 - 2 * x);
    if (alero) {
      P.negro(c => { c.moveTo(VX - 50, VY - 64); c.lineTo(VX + VW + 50, VY - 64); c.lineTo(VX + VW + 24, VY - 28); c.lineTo(VX - 24, VY - 28); c.closePath(); }, e(k(0.1, 0.4)));
      P.rayar(P.rect(VX - 24, VY - 28, VW + 48, 22), Math.PI / 2, 6, { prog: e(k(0.35, 0.35)), semilla: 9 + sem });
    }
    P.papel(P.rect(VX, VY, VW, VH));
    const b = Math.max(18, VW * 0.045);
    P.negro(c => { c.moveTo(VX, VY); c.lineTo(VX + VW, VY); c.lineTo(VX + VW - b, VY + b); c.lineTo(VX + b, VY + b); c.lineTo(VX + b, VY + VH - b); c.lineTo(VX, VY + VH); c.closePath(); }, e(k(0.3, 0.4)), { dir: 'y' });
    const mp = e(k(0.4, 0.7));
    P.contorno(P.rect(VX + b, VY + b, VW - 2 * b, VH - 2 * b), { prog: mp, ancho: 5 });
    const m = b * 1.4, HY = VY + m, HH = VH - 2 * m, HW = (VW - 2 * m) / 2 + b * 0.6;
    for (const [x, s2] of [[VX + m, 21], [VX + m + HW - b * 1.2 - abre, 33]]) {
      if (mp > 0.3) P.papel(P.rect(x, HY, HW, HH));
      P.contorno(P.rect(x, HY, HW, HH), { prog: mp, ancho: 4 });
      P.contorno(P.rect(x + b * 0.6, HY + b * 0.6, HW - b * 1.2, HH - b * 1.2), { prog: mp, ancho: 1.8 });
      for (let i = 0; i < 3; i++) {
        const q = e(k(0.9 + i * 0.06, 0.25)), x0 = x + HW * 0.2 + i * HW * 0.07, y0 = HY + HH * 0.8;
        P.linea(x0, y0, x0 + HW * 0.25, y0 - HH * 0.4, q, i === 1 ? 2.6 : 1.4);
      }
    }
    P.negro(P.rect(VX - b * 1.5, VY + VH, VW + b * 3, b * 0.8), e(k(0.6, 0.3)));
    return { ruedaX: VX + m + HW - b * 1.2 - abre + HW / 2, ruedaY: HY + HH };
  };
  return P;
}
