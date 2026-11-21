// escena3d.js — mundo 3D "maqueta de arcilla" para VIDEOS OP (three.js, perspectiva real).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export { THREE };
export const W = 1080, H = 1920;
const DIA = new THREE.Color(0xeef1f6), NOCHE = new THREE.Color(0x1d2333);

export const clay = (c, r = 0.85, o = {}) => new THREE.MeshPhysicalMaterial({
  color: c, roughness: r, sheen: 0.3, sheenRoughness: 0.9, transparent: !!o.opacity, opacity: o.opacity ?? 1,
  emissive: o.emissive ?? 0x000000, emissiveIntensity: o.emissiveIntensity ?? 0,
});
export const MAT = {
  blanco: clay(0xf6f7fa), piso: clay(0xf0f2f6, 0.95), azul: clay(0x265ceb, 0.6), azulClaro: clay(0x7f9ff5, 0.7),
  gris: clay(0xdde2ec), vidrio: clay(0xcfe0ff, 0.15, { opacity: 0.45 }), metal: clay(0xe8edf7, 0.35),
};

export function crearMundo() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H); renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  const scene = new THREE.Scene(); scene.background = DIA.clone(); scene.fog = new THREE.Fog(DIA.clone(), 12, 30);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const hemi = new THREE.HemisphereLight(0xffffff, 0xcfd6e4, 0.75); scene.add(hemi);
  const sol = new THREE.DirectionalLight(0xffffff, 2.6);
  sol.position.set(-4, 8, 6); sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048);
  sol.shadow.radius = 9; sol.shadow.blurSamples = 20; sol.shadow.bias = -0.0004;
  Object.assign(sol.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 30 });
  scene.add(sol); scene.add(sol.target);
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), MAT.piso);
  piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; scene.add(piso);
  const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 200);
  const M = { renderer, scene, cam, hemi, sol, piso };
  // noche: 0 = día de estudio, 1 = cuarto a oscuras
  M.noche = (n) => {
    scene.background.copy(DIA).lerp(NOCHE, n); scene.fog.color.copy(scene.background);
    hemi.intensity = 0.75 - 0.6 * n; sol.intensity = 2.6 - 2.3 * n; scene.environmentIntensity = 0.55 - 0.45 * n;
  };
  M.render = () => renderer.render(scene, cam);
  return M;
}

// ---------- piezas ----------
export function caja(padre, w, h, d, m, x, y, z, r = 0.04) {
  const me = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2, h / 2, d / 2)), m);
  me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; padre.add(me); return me;
}
export function esfera(padre, r, m, x, y, z) {
  const me = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), m);
  me.position.set(x, y, z); me.castShadow = me.receiveShadow = true; padre.add(me); return me;
}
export function grupo(padre, x = 0, y = 0, z = 0) { const g = new THREE.Group(); g.position.set(x, y, z); padre.add(g); return g; }

// Pared con hueco de puerta centrado en x0 (en el plano z = z0). Devuelve la bisagra de la hoja.
export function paredConPuerta(padre, { x0 = 0, z0 = 0, largo = 5, alto = 2.8, esp = 0.22, ancho = 0.9, altoP = 2.1,
  matPared = MAT.blanco, matHoja = MAT.azul, marco = true, bisagraDer = false } = {}) {
  const lado = (largo - ancho) / 2;
  caja(padre, lado, alto, esp, matPared, x0 - ancho / 2 - lado / 2, alto / 2, z0);
  caja(padre, lado, alto, esp, matPared, x0 + ancho / 2 + lado / 2, alto / 2, z0);
  caja(padre, ancho, alto - altoP, esp, matPared, x0, altoP + (alto - altoP) / 2, z0);
  if (marco) {
    const m = MAT.azul, e = 0.05;
    caja(padre, e, altoP, esp + 0.06, m, x0 - ancho / 2 + e / 2, altoP / 2, z0, 0.015);
    caja(padre, e, altoP, esp + 0.06, m, x0 + ancho / 2 - e / 2, altoP / 2, z0, 0.015);
    caja(padre, ancho, e, esp + 0.06, m, x0, altoP - e / 2, z0, 0.015);
  }
  const s = bisagraDer ? -1 : 1, aw = ancho - 0.1;
  const bisagra = grupo(padre, x0 - s * aw / 2, 0, z0);
  const hoja = caja(bisagra, aw, altoP - 0.06, 0.045, matHoja, s * aw / 2, (altoP - 0.06) / 2, 0, 0.015);
  const manija = esfera(bisagra, 0.032, MAT.metal, s * (aw - 0.09), 1.0, 0.05);
  const manija2 = esfera(bisagra, 0.032, MAT.metal, s * (aw - 0.09), 1.0, -0.05);
  return { bisagra, hoja, manija, manija2 };
}

// Fantasmita de sábana (genérico), para el gancho.
export function fantasma(padre) {
  const g = grupo(padre);
  const m = clay(0xffffff, 0.6, { opacity: 0.92 });
  const cab = esfera(g, 0.32, m, 0, 0.55, 0);
  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.6, 32, 1, true), m); cuerpo.position.y = 0.25; g.add(cuerpo);
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; esfera(g, 0.09, m, Math.cos(a) * 0.36, -0.05, Math.sin(a) * 0.36); }
  const ojo = clay(0x1b1b1f, 0.3); esfera(g, 0.045, ojo, -0.1, 0.6, 0.29); esfera(g, 0.045, ojo, 0.1, 0.6, 0.29);
  const boca = esfera(g, 0.05, ojo, 0, 0.47, 0.3); boca.scale.set(1, 1.3, 0.5);
  return g;
}

// Nivel de burbuja: barra blanca con tubito; nivel.burbuja(offset -1..1)
export function nivel(padre, largo = 1.2) {
  const g = grupo(padre);
  caja(g, largo, 0.09, 0.09, MAT.blanco, 0, 0, 0, 0.02);
  const vial = caja(g, 0.28, 0.06, 0.05, MAT.vidrio, 0, 0.0, 0.05, 0.025);
  const burbuja = esfera(g, 0.022, MAT.azul, 0, 0, 0.075);
  for (const x of [-0.04, 0.04]) caja(g, 0.006, 0.06, 0.01, MAT.azul, x, 0, 0.078, 0.002);
  g.burbuja = (o) => { burbuja.position.x = o * 0.11; };
  return g;
}

// Flecha plana sobre el piso entre dos puntos (x,z).
export function flecha(padre, a, b, { ancho = 0.12, m = MAT.azul } = {}) {
  const g = grupo(padre);
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
  const cuerpo = caja(g, L - 0.3, 0.02, ancho, m, (L - 0.3) / 2, 0.012, 0, 0.01);
  const punta = new THREE.Mesh(new THREE.ConeGeometry(ancho * 1.6, 0.34, 3), m);
  punta.rotation.z = -Math.PI / 2; punta.rotation.x = Math.PI / 2; punta.scale.z = 0.12; punta.position.set(L - 0.17, 0.02, 0); g.add(punta);
  g.position.set(a[0], 0, a[1]); g.rotation.y = -Math.atan2(dz, dx);
  g.largo = (p) => { cuerpo.scale.x = Math.max(0.001, p); cuerpo.position.x = (L - 0.3) * p / 2; punta.position.x = (L - 0.3) * p + 0.17; punta.visible = p > 0.05; };
  return g;
}

// Anillo de resalte (para marcar bisagras, etc.)
export function anillo(padre, r = 0.12) {
  const me = new THREE.Mesh(new THREE.TorusGeometry(r, 0.018, 12, 40), clay(0x265ceb, 0.4, { emissive: 0x265ceb, emissiveIntensity: 0.6 }));
  padre.add(me); return me;
}

// Compone el cuadro 3D en el canvas 2D de salida (para dibujar títulos y subtítulos encima).
export function componer(ctx2d, M, temblor = 0) {
  M.render();
  ctx2d.setTransform(1, 0, 0, 1, 0, 0);
  const dx = temblor ? (Math.random() - 0.5) * temblor : 0, dy = temblor ? (Math.random() - 0.5) * temblor : 0;
  ctx2d.drawImage(M.renderer.domElement, dx - Math.abs(temblor), dy - Math.abs(temblor), W + 2 * Math.abs(temblor), H + 2 * Math.abs(temblor));
}
