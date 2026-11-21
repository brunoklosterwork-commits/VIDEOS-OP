"""SFX del video 05. Escribe sfx.wav."""
import json, sys
sys.path.insert(0, '../../motor')
from sonidos import *
T = json.load(open('tiempos.json')); F = lambda i: T[i][0]; E = lambda i: T[i][1]
DUR = E(7) + 2.2; p = Pista(DUR)
p.fx(0.0, whoosh(0.5, up=True, lo=200, hi=1800), 0.3)
p.fx(0.45, whoosh(0.6, up=False, lo=300, hi=1400), 0.25)              # abre hacia afuera
for c in (F(1), F(3), F(5), F(7)): p.fx(c - 0.18, whoosh(0.36, up=False, lo=400, hi=3000), 0.3)
p.fx(F(1) + 0.35, whoosh(0.6, up=False, lo=300, hi=1400), 0.25)       # abre hacia adentro
p.fx(F(2) + 0.1, pop(0.9), 0.4)
p.amb(F(3), murmur(F(5) - F(3)), 0.12)                                # gente
p.fx(F(3) + 0.4, pop(1.0), 0.4); p.fx(F(3) + 0.8, tok(0.9), 0.6)      # flecha + puerta
p.fx(F(3) + 1.2, pop(1.1), 0.4); p.fx(F(4) + 0.6, pop(1.2), 0.4)
p.fx(F(5) + 0.35, whoosh(0.6, up=False, lo=300, hi=1400), 0.25)
for i in range(3): p.fx(F(5) + (E(5) - F(5)) * 0.7 + i * 0.12, pop(1.1 + i * 0.1), 0.4)
p.fx(F(6) + 0.2, pop(1.2), 0.4)
p.fx(E(7) + 0.1, chime(), 0.4)
p.guardar('sfx.wav', voz='voz.mp3'); print('-> sfx.wav')
