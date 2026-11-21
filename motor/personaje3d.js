// personaje3d.js — personaje de "arcilla" para VIDEOS OP (three.js).
// Hecho con primitivas redondeadas (cápsulas, esferas), articulado con pivotes
// para poder animarlo: respirar, caminar, saludar, señalar, mirar.
import * as THREE from 'three';

const mat = (color, o = {}) => new THREE.MeshPhysicalMaterial({
  color, roughness: o.rough ?? 0.78, metalness: 0, sheen: o.sheen ?? 0.35, sheenRoughness: 0.8,
  sheenColor: new THREE.Color(0xffffff), clearcoat: o.coat ?? 0, clearcoatRoughness: 0.6,
});

export const PALETA = {
  piel: 0xf1c3a6, pelo: 0x2b2522, gorro: 0xeee6da, buzo: 0x2f5ceb, buzoClaro: 0x5b80f2,
  pantalon: 0x6b5d52, zapatilla: 0xf4f2ee, suela: 0xd9d4cc, ojo: 0x1b1b1f, nariz: 0xf0a08c,
};

function capsula(r, largo, m) {
  const g = new THREE.CapsuleGeometry(r, largo, 8, 20);
  const me = new THREE.Mesh(g, m); me.castShadow = me.receiveShadow = true; return me;
}
function esfera(r, m, seg = 32) {
  const me = new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), m); me.castShadow = me.receiveShadow = true; return me;
}
function pivote(padre, x, y, z) { const g = new THREE.Group(); g.position.set(x, y, z); padre.add(g); return g; }

// Extremidad de dos tramos (brazo o pierna) colgando hacia -Y desde el pivote.
function extremidad(padre, x, y, z, r1, l1, r2, l2, m1, m2) {
  const p1 = pivote(padre, x, y, z);
  const s1 = capsula(r1, l1, m1); s1.position.y = -l1 / 2; p1.add(s1);
  const p2 = pivote(p1, 0, -l1, 0);
  const s2 = capsula(r2, l2, m2); s2.position.y = -l2 / 2; p2.add(s2);
  const fin = pivote(p2, 0, -l2 - r2 * 0.6, 0);
  return { p1, p2, fin };
}

export function crearPersonaje(opts = {}) {
  const C = { ...PALETA, ...opts.colores };
  const M = {
    piel: mat(C.piel, { sheen: 0.1, rough: 0.6 }), pelo: mat(C.pelo, { rough: 0.9 }),
    gorro: mat(C.gorro, { sheen: 0.8, rough: 0.95 }), buzo: mat(C.buzo, { sheen: 0.9, rough: 0.95 }),
    buzoClaro: mat(C.buzoClaro, { sheen: 0.9, rough: 0.95 }), pantalon: mat(C.pantalon, { sheen: 0.6, rough: 0.95 }),
    zapa: mat(C.zapatilla, { rough: 0.5, coat: 0.2 }), suela: mat(C.suela, { rough: 0.7 }),
    ojo: mat(C.ojo, { rough: 0.3, coat: 1 }), nariz: mat(C.nariz, { rough: 0.6 }),
  };
  const raiz = new THREE.Group();          // apoyado en el piso (y = 0)
  const cadera = pivote(raiz, 0, 0.92, 0); // todo cuelga de la cadera
  const torso = pivote(cadera, 0, 0, 0);

  // buzo: cuerpo + capucha + bolsillo
  const cuerpo = capsula(0.27, 0.42, M.buzo); cuerpo.scale.set(1.08, 1, 0.82); cuerpo.position.y = 0.33; torso.add(cuerpo);
  const capucha = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.07, 16, 32), M.buzo);
  capucha.rotation.x = Math.PI / 2; capucha.position.y = 0.76; capucha.castShadow = true; torso.add(capucha);
  const bolsillo = capsula(0.06, 0.22, M.buzoClaro); bolsillo.rotation.z = Math.PI / 2; bolsillo.scale.set(1, 1, 0.35);
  bolsillo.position.set(0, 0.2, 0.22); torso.add(bolsillo);
  for (const sx of [-0.05, 0.05]) { const c = capsula(0.012, 0.12, M.gorro); c.position.set(sx, 0.62, 0.21); torso.add(c); } // cordones

  // cabeza
  const cuello = pivote(torso, 0, 0.78, 0);
  const cabeza = pivote(cuello, 0, 0.05, 0);
  const craneo = esfera(0.25, M.piel, 48); craneo.scale.set(0.95, 1.12, 0.95); craneo.position.y = 0.27; cabeza.add(craneo);
  for (const sx of [-1, 1]) { const o = esfera(0.055, M.piel); o.scale.set(0.6, 1, 0.9); o.position.set(sx * 0.235, 0.26, 0); cabeza.add(o); }
  const pelo = esfera(0.255, M.pelo, 48); pelo.scale.set(0.97, 0.7, 0.97); pelo.position.set(0, 0.37, -0.02); cabeza.add(pelo);
  const ojos = [];
  for (const sx of [-1, 1]) { const o = esfera(0.022, M.ojo, 16); o.position.set(sx * 0.075, 0.29, 0.225); cabeza.add(o); ojos.push(o); }
  const nariz = esfera(0.03, M.nariz, 16); nariz.position.set(0, 0.23, 0.245); cabeza.add(nariz);
  // gorro de lana
  const gorro = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.255, 0.3, 40, 1), M.gorro);
  gorro.position.y = 0.5; gorro.castShadow = true; cabeza.add(gorro);
  const tapa = esfera(0.2, M.gorro, 40); tapa.scale.set(1, 0.45, 1); tapa.position.y = 0.65; cabeza.add(tapa);
  const doblez = new THREE.Mesh(new THREE.TorusGeometry(0.255, 0.045, 16, 48), M.gorro);
  doblez.rotation.x = Math.PI / 2; doblez.position.y = 0.39; doblez.castShadow = true; cabeza.add(doblez);

  // brazos (mangas + manos)
  const brazoI = extremidad(torso, -0.33, 0.66, 0, 0.085, 0.26, 0.075, 0.22, M.buzo, M.buzo);
  const brazoD = extremidad(torso, 0.33, 0.66, 0, 0.085, 0.26, 0.075, 0.22, M.buzo, M.buzo);
  for (const b of [brazoI, brazoD]) {
    const puño = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.025, 12, 24), M.buzoClaro);
    puño.rotation.x = Math.PI / 2; puño.position.y = 0.06; b.fin.add(puño);
    const mano = esfera(0.075, M.piel); mano.scale.set(0.9, 1.1, 0.7); mano.position.y = -0.03; b.fin.add(mano);
  }
  // piernas + zapatillas
  const piernaI = extremidad(cadera, -0.13, 0.05, 0, 0.1, 0.32, 0.095, 0.3, M.pantalon, M.pantalon);
  const piernaD = extremidad(cadera, 0.13, 0.05, 0, 0.1, 0.32, 0.095, 0.3, M.pantalon, M.pantalon);
  for (const p of [piernaI, piernaD]) {
    const z = capsula(0.085, 0.16, M.zapa); z.rotation.x = Math.PI / 2; z.scale.set(1.15, 1, 0.8); z.position.set(0, -0.03, 0.06); p.fin.add(z);
    const s = capsula(0.088, 0.17, M.suela); s.rotation.x = Math.PI / 2; s.scale.set(1.18, 1.02, 0.35); s.position.set(0, -0.085, 0.06); p.fin.add(s);
  }

  const P = { raiz, cadera, torso, cuello, cabeza, brazoI, brazoD, piernaI, piernaD, ojos };

  // ---------- poses / animación ----------
  P.reset = () => {
    cadera.position.y = 0.92; cadera.rotation.set(0, 0, 0); torso.rotation.set(0, 0, 0);
    cuello.rotation.set(0, 0, 0); cabeza.rotation.set(0, 0, 0);
    for (const e of [brazoI, brazoD, piernaI, piernaD]) { e.p1.rotation.set(0, 0, 0); e.p2.rotation.set(0, 0, 0); }
    brazoI.p1.rotation.z = -0.12; brazoD.p1.rotation.z = 0.12;
    brazoI.p2.rotation.x = brazoD.p2.rotation.x = -0.15;
    for (const o of ojos) o.scale.y = 1;
  };
  P.respirar = (t, f = 1) => {
    const b = Math.sin(t * 2.2) * f;
    torso.scale.set(1 + b * 0.008, 1 + b * 0.012, 1 + b * 0.008);
    cuello.rotation.x = b * 0.02; brazoI.p1.rotation.z += -b * 0.02; brazoD.p1.rotation.z += b * 0.02;
  };
  P.parpadear = (t) => { const c = (t % 3.7); const s = c < 0.12 ? Math.abs(c - 0.06) / 0.06 : 1; for (const o of ojos) o.scale.y = Math.max(0.1, s); };
  P.caminar = (t, vel = 1, f = 1) => {
    const c = t * 7 * vel, s = Math.sin(c);
    piernaI.p1.rotation.x = s * 0.5 * f; piernaD.p1.rotation.x = -s * 0.5 * f;
    piernaI.p2.rotation.x = Math.max(0, -Math.cos(c)) * 0.7 * f; piernaD.p2.rotation.x = Math.max(0, Math.cos(c)) * 0.7 * f;
    brazoI.p1.rotation.x = -s * 0.45 * f; brazoD.p1.rotation.x = s * 0.45 * f;
    cadera.position.y = 0.92 + Math.abs(Math.cos(c)) * 0.035 * f; torso.rotation.y = s * 0.08 * f;
  };
  P.saludar = (t, f = 1) => { // brazo derecho arriba, mano que se mueve
    brazoD.p1.rotation.z = 0.12 + 2.5 * f; brazoD.p1.rotation.x = -0.2 * f;
    brazoD.p2.rotation.z = (0.35 + Math.sin(t * 9) * 0.35) * f; brazoD.p2.rotation.x = -0.15;
    cabeza.rotation.z = -0.08 * f;
  };
  P.señalar = (f = 1, lado = 1) => { // señala hacia un costado
    const b = lado > 0 ? brazoD : brazoI;
    b.p1.rotation.z = lado * (0.12 + 1.35 * f); b.p1.rotation.x = -0.35 * f; b.p2.rotation.x = -0.1 * f;
    cabeza.rotation.y = lado * 0.4 * f;
  };
  P.pensar = (f = 1) => { // mano al mentón
    brazoI.p1.rotation.x = -0.9 * f; brazoI.p1.rotation.z = -0.12 + 0.35 * f; brazoI.p2.rotation.x = -1.9 * f;
    cabeza.rotation.z = 0.12 * f; cabeza.rotation.x = -0.08 * f;
  };
  P.reset();
  return P;
}
