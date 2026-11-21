"""SFX sutiles del video 03. Escribe sfx.wav."""
import json, sys
sys.path.insert(0, '../../motor')
from sonidos import *
T = json.load(open('tiempos.json')); F = lambda i: T[i][0]; E = lambda i: T[i][1]
ter = lambda i, n, a, b: a + (b - a) * i / n
DUR = E(10) + 1.0; p = Pista(DUR)
p.fx(0.0, whoosh(0.5, up=True, lo=200, hi=1800), 0.3)
p.fx(0.75, tok(1.0), 0.6); p.fx(0.95, tok(1.15), 0.6)          # aparecen las dos puertas
p.fx(0.95, pop(1.0), 0.35); p.fx(1.15, pop(1.1), 0.35)
p.fx(F(1) + 0.25, pop(0.9), 0.5)                               # ≠
for c in (F(3), F(6), F(8), F(9)): p.fx(c - 0.18, whoosh(0.36, up=False, lo=400, hi=3000), 0.35)
p.fx(F(3) + 0.35, pop(1.0), 0.4)
p.fx(F(4) + 0.45, tok(0.7), 1.0); p.fx(F(4) + 0.05, pop(1.05), 0.4)   # pesada: cae
p.fx(ter(1, 2, F(4), E(4)), pop(1.1), 0.4)
p.fx(F(5) + 0.15, pop(1.15), 0.4); p.fx(ter(1, 2, F(5), E(5)), pop(1.2), 0.4)
p.fx(F(6) + 0.4, whoosh(0.8, up=True, lo=300, hi=2200), 0.3)   # despiece
p.fx(ter(1, 3, F(6), E(6)), pop(1.0), 0.4); p.fx(ter(2, 3, F(6), E(6)), pop(1.1), 0.4)
p.fx(F(7) + 0.3, whoosh(0.5, up=False, lo=300, hi=1500), 0.25); p.fx(F(7) + 0.75, tok(1.0), 0.6)
d = (E(7) - F(7)) / 3
for i in range(3): p.fx(F(7) + 0.1 + i * d, pop(1.1 + i * 0.08), 0.45)
p.fx(F(8) + 0.9, tok(0.95), 0.6); p.fx(F(8) + 1.25, tok(1.05), 0.6)
p.fx(ter(2, 3, F(8), E(8)), pop(1.2), 0.45)
p.fx(F(9) + 0.6, tok(1.0), 0.6); p.fx(F(9) + 0.3, pop(1.0), 0.4)
p.fx(ter(2, 3, F(10), E(10)) + 0.05, chime(), 0.45)
p.guardar('sfx.wav', voz='voz.mp3'); print('-> sfx.wav')
