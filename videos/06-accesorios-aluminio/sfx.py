"""SFX del video 06 (plumilla): trazos de lápiz sutiles + pops en los datos."""
import json, sys
sys.path.insert(0, '../../motor')
from sonidos import *
T = json.load(open('tiempos.json')); F = lambda i: T[i][0]; E = lambda i: T[i][1]
DUR = E(10) + 1.0; p = Pista(DUR)
def lapiz(d=0.6):  # rasguido de lápiz sobre papel
    t = t_(d); s = bp(noise(d), 2500, 7000) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 9 * t))) * np.sin(np.pi * t / d)
    return s / (np.abs(s).max() + 1e-9)
cortes = [0, F(3), F(4), F(6), F(8), F(9), F(10)]
for c in cortes: p.fx(c + 0.05, lapiz(0.7), 0.22)
for c in cortes[1:]: p.fx(c - 0.15, whoosh(0.3, up=False, lo=500, hi=3000), 0.2)
p.fx(F(1) + 0.3, pop(0.9), 0.45); p.fx(F(1) + 0.6, pop(1.1), 0.5)      # precios
p.fx(F(2) + 0.02, pop(1.3), 0.55)                                        # ?
for i in range(4): p.fx(F(3) + 0.55 + i * 0.2, pop(1.0 + i * 0.08), 0.4) # accesorios
p.fx(F(4) + 0.4, whoosh(0.8, up=True, lo=300, hi=1200), 0.15)          # rueda que gira suave
for i in range(4): p.fx(F(5) + 0.4 + i * 0.5, tok(1.4), 0.35)           # rueda que se traba
p.fx(F(6) + 0.6, pop(1.0), 0.4); p.fx(F(7) + 0.5, click(0.02, 1500), 0.5)
p.fx(F(8) + 0.6, whoosh(1.2, up=False, lo=800, hi=2500), 0.12)         # aire
p.fx(F(9) + 0.5, pop(1.15), 0.4)
for i in range(4): p.fx(F(10) + 1.25 + i * 0.35, pop(1.1 + i * 0.07), 0.45)
p.fx(F(10) + 2.7, chime(), 0.35)
p.guardar('sfx.wav', voz='voz.mp3'); print('-> sfx.wav')
