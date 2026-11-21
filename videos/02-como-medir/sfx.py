"""SFX sutiles del video 02. Escribe sfx.wav."""
import json, sys
sys.path.insert(0, '../../motor')
from sonidos import *
T = json.load(open('tiempos.json')); F = lambda i: T[i][0]; E = lambda i: T[i][1]
DUR = E(10) + 1.0; p = Pista(DUR)
p.fx(0.0, whoosh(0.5, up=True, lo=200, hi=1800), 0.35)
p.fx(F(1) + 0.75, pop(0.9), 0.5)                          # "¿una sola?"
dA = (E(3) - F(3)) / 3
for i in range(3): p.fx(F(3) + i * dA + 0.45, pop(1.0 + i * 0.08), 0.5)
p.fx(F(4) + 0.3, pop(1.3), 0.6)                           # la más chica
dH = (E(6) - F(6)) / 3
for i in range(3): p.fx(F(6) + i * dH + 0.45, pop(1.0 + i * 0.08), 0.5)
p.fx(E(6) + 0.0, pop(1.3), 0.55)
for c in (F(7), F(9)): p.fx(c - 0.18, whoosh(0.36, up=False, lo=400, hi=3000), 0.35)
p.fx(F(7) + 0.8, pop(1.0), 0.45)                          # cota espesor
p.fx(F(8) + 0.5, whoosh(0.4, up=False, lo=300, hi=1500), 0.25)
p.fx(F(8) + 0.85, tok(0.9), 0.8)                          # marco se apoya
for d in (0.3, 0.6, 0.9): p.fx(F(9) + d + 0.05, pop(1.2), 0.45)
p.fx(F(9) + 1.15, tok(1.0), 0.8)                          # la puerta entra
p.fx(F(10) + 0.35, chime(), 0.45)                         # guardalo
p.guardar('sfx.wav', voz='voz.mp3'); print('-> sfx.wav')
