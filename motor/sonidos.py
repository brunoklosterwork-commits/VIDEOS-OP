"""Librería de efectos de sonido sintetizados (sin samples, sin licencias).

Uso típico en el sfx.py de cada video:
    from sonidos import *
    pista = Pista(dur=47.1)
    pista.fx(2.85, splat(1.0), 0.75)                 # efecto puntual
    pista.amb(19.0, murmur(19.9), 0.11)              # ambiente (baja solo cuando habla la voz)
    pista.guardar('sfx.wav', voz='voz.mp3')

Efectos: whoosh, splat, bell (campanas/cubiertos/copas), click, breath (suspiro), murmur (restaurante),
waves (mar), horn (bocina de barco), paper (papel), boing (resorte). Regla de estilo: pocos efectos,
que acompañen; la voz siempre manda.
"""
import numpy as np, subprocess, wave
SR = 48000
rng = np.random.default_rng(7)
N = 0
def t_(d): return np.arange(int(d * SR)) / SR
def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for k in range(len(x)): s = (1 - a) * x[k] + a * s; y[k] = s
    return y
def lp(x, fc):  # fast 2x one-pole via FFT-free cumulative trick (vectorised IIR approx)
    from scipy.signal import butter, lfilter
    b, a = butter(2, fc / (SR / 2), 'low'); return lfilter(b, a, x)
def bp(x, lo, hi):
    from scipy.signal import butter, lfilter
    b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return lfilter(b, a, x)
def hp(x, fc):
    from scipy.signal import butter, lfilter
    b, a = butter(2, fc / (SR / 2), 'high'); return lfilter(b, a, x)
def env(n, a, d):  # attack/decay seconds
    t = np.arange(n) / SR; e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) / max(d, 1e-4)); return e
def noise(d): return rng.standard_normal(int(d * SR))

def whoosh(d, up=True, lo=300, hi=3500):
    n = noise(d); t = t_(d); out = np.zeros_like(n)
    # sweep a band-pass by blocks
    blocks = 24; L = len(n) // blocks
    for b in range(blocks):
        f = lo + (hi - lo) * ((b / blocks) if up else (1 - b / blocks))
        seg = bp(n[b * L:(b + 1) * L + 400], f * 0.6, min(f * 1.6, 20000))[:L]
        out[b * L:b * L + len(seg)] = seg
    shape = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return out * shape / (np.abs(out).max() + 1e-9)
def splat(size=1.0):
    d = 0.35; t = t_(d)
    thump = np.sin(2 * np.pi * (140 * size ** -0.3) * t * (1 - 0.5 * t / d)) * np.exp(-t / 0.05)
    wet = lp(noise(d), 1800) * np.exp(-t / 0.07)
    crackle = hp(noise(d), 2500) * (rng.random(len(t)) > 0.985) * np.exp(-t / 0.12) * 3
    s = thump * 0.9 + wet * 2.2 + crackle * 0.5
    return s / np.abs(s).max()
def bell(freqs, d, decay):
    t = t_(d); s = sum(np.sin(2 * np.pi * f * t) * np.exp(-t / (decay * (1 - i * 0.15))) / (i + 1) for i, f in enumerate(freqs))
    return s / np.abs(s).max() * env(len(t), 0.002, 10)
def click(d=0.03, fc=3000):
    t = t_(d); s = bp(noise(d), fc * 0.7, fc * 1.4) * np.exp(-t / 0.006); return s / np.abs(s).max()
def breath(d=1.0):
    t = t_(d); s = bp(noise(d), 400, 2200) * np.sin(np.pi * t / d) ** 2; return s / np.abs(s).max()
def murmur(d):
    base = bp(noise(d), 250, 1400)
    am = lp(rng.standard_normal(int(d * SR)), 3); am = 0.6 + 0.4 * am / (np.abs(am).max() + 1e-9)
    return base * am / (np.abs(base).max() + 1e-9)
def waves(d):
    t = t_(d); s = lp(noise(d), 700) * (0.55 + 0.45 * np.sin(2 * np.pi * t / 4.2) ** 2); return s / np.abs(s).max()
def horn(d=1.8):
    t = t_(d); s = (np.sin(2 * np.pi * 98 * t) + 0.6 * np.sin(2 * np.pi * 147 * t) + 0.3 * np.sin(2 * np.pi * 196 * t))
    e = np.minimum(1, t / 0.35) * np.minimum(1, (d - t) / 0.5); return s * e / 1.9
def paper(d):
    t = t_(d); s = hp(noise(d), 1500) * (0.3 + (rng.random(len(t)) > 0.97) * 2) * np.sin(np.pi * t / d); return s / np.abs(s).max()
def boing(d=0.25):
    t = t_(d); f = 600 + 900 * t / d; s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.08) * (1 + 0.3 * np.sin(2 * np.pi * 28 * t)); return s



class Pista:
    def __init__(self, dur):
        self.n = int(dur * SR); self.f = np.zeros(self.n); self.a = np.zeros(self.n)
    def _put(self, buf, t0, sig, g):
        i = int(t0 * SR); j = min(self.n, i + len(sig))
        if i < self.n: buf[i:j] += sig[:j - i] * g
    def fx(self, t0, sig, g=1.0): self._put(self.f, t0, sig, g)
    def amb(self, t0, sig, g=1.0): self._put(self.a, t0, sig, g)
    def guardar(self, path, voz=None):
        duck = 1.0
        if voz:
            raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', voz, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
            v = np.frombuffer(raw, np.int16).astype(float) / 32768; v = np.pad(v, (0, max(0, self.n - len(v))))[:self.n]
            e = lp(np.abs(v), 4); e = e / (e.max() + 1e-9); duck = 1 - 0.5 * np.clip(e * 4, 0, 1)
        m = self.f + self.a * duck; m = m / max(1e-9, np.abs(m).max()) * 0.7
        with wave.open(path, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((np.clip(m, -1, 1) * 32767).astype(np.int16).tobytes())


# --- agregados para OP (maqueta blanca): sonidos suaves, "de estudio" ---
def tok(tono=1.0):
    """Golpecito seco de pieza que se apoya (arcilla / madera liviana)."""
    d = 0.18; t = t_(d)
    cuerpo = np.sin(2 * np.pi * 180 * tono * t) * np.exp(-t / 0.035)
    golpe = lp(noise(d), 2500 * tono) * np.exp(-t / 0.012)
    s = cuerpo * 0.8 + golpe * 0.6
    return s / np.abs(s).max()
def pop(tono=1.0):
    """Pop corto y redondo para tarjetas y tildes."""
    d = 0.12; t = t_(d); f = 520 * tono + 380 * tono * np.exp(-t / 0.02)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.03)
    return s / np.abs(s).max()
def chime():
    """Campanita limpia (dos notas) para un momento clave."""
    a = bell([1318, 2637, 3951], 1.0, 0.25); b = bell([1760, 3520, 5274], 1.0, 0.3)
    o = int(0.09 * SR); out = np.zeros(o + len(b)); out[:len(a)] += a * 0.7; out[o:] += b
    return out / np.abs(out).max()
