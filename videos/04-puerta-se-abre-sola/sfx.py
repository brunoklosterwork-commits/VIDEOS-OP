"""SFX del video 04. Escribe sfx.wav."""
import json, sys
sys.path.insert(0, '../../motor')
from sonidos import *
T = json.load(open('tiempos.json')); F = lambda i: T[i][0]; E = lambda i: T[i][1]
DUR = E(11) + 0.9; p = Pista(DUR)
# chirrido suave de la puerta que se abre sola (barrido tonal grave)
def chirrido(d=1.4):
    t = t_(d); f = 380 + 140 * np.sin(2 * np.pi * 0.7 * t) + 40 * np.sin(2 * np.pi * 13 * t)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * (0.5 + 0.5 * np.sin(np.pi * t / d)) * np.exp(-t / 1.2)
    return bp(s + 0.15 * noise(d), 250, 2500)
p.fx(0.25, chirrido(1.5), 0.25)
p.fx(F(1) + 0.05, whoosh(0.5, up=True, lo=600, hi=3000), 0.25)       # aparece el fantasma
p.fx(F(2) + 0.02, click(0.03, 2200), 0.9)                              # se prende la luz
p.fx(F(2) + 0.06, pop(0.8), 0.4)                                       # el fantasma se va
for c in (F(3), F(7), F(9), F(11)): p.fx(c - 0.18, whoosh(0.36, up=False, lo=400, hi=3000), 0.3)
p.fx(F(3) + 0.6, tok(1.1), 0.4)                                        # marco se inclina
p.fx(F(4) + 0.1, pop(1.0), 0.4)                                        # plomada
p.fx(F(6) + 0.1, chirrido(1.2), 0.18)
p.fx(F(7) + 0.2, chirrido(1.0), 0.15)
p.fx(F(8) + 0.55, tok(0.6), 1.0); p.fx(F(8) + 0.57, splat(1.3), 0.35)  # portazo
for i in range(3): p.fx(F(10) + i * 0.15, pop(1.1 + i * 0.1), 0.4)   # bisagras
p.fx(F(10) + 1.3, chime(), 0.35)                                      # queda a nivel
p.fx(F(11) + 0.6, pop(1.2), 0.45)
p.guardar('sfx.wav', voz='voz.mp3'); print('-> sfx.wav')
