"""SFX sutiles del video 01. Escribe sfx.wav (48 kHz mono). Uso: python3 sfx.py"""
import json, sys
sys.path.insert(0, '../../motor')
from sonidos import *

T = json.load(open('tiempos.json'))
F = lambda i: T[i][0]
E = lambda i: T[i][1]
DUR = E(8) + 1.0
p = Pista(DUR)

# Toma A/B: pared que sube, puerta que llega y no alcanza, después crece
p.fx(0.00, whoosh(0.5, up=True, lo=200, hi=1800), 0.35)
p.fx(0.80, tok(1.0), 0.9)                          # la puerta llega al hueco
p.fx(F(1) + 0.02, tok(1.25), 0.35)                 # tiembla: no entra
p.fx(F(1) + 0.12, tok(1.3), 0.25)
p.fx(F(2) + 0.20, whoosh(0.7, up=True, lo=300, hi=2600), 0.4)  # crece a medida
p.fx(F(2) + 0.80, tok(0.9), 0.7)
p.fx(F(3) + 0.80, pop(1.0), 0.5)                   # cota 2,50 m
p.fx(F(3) + (E(3) - F(3)) * 0.6 + 0.6, pop(1.12), 0.5)  # cota 1 m

# Cortes de toma: whoosh corto
for c in (F(4), F(6), F(7)):
    p.fx(c - 0.18, whoosh(0.36, up=False, lo=400, hi=3000), 0.35)

# Toma C: tildes del checklist
for tt in (F(4) + 0.3, F(4) + (E(4) - F(4)) * 0.7, F(5) + (E(5) - F(5)) * 0.65):
    p.fx(tt + 0.05, pop(1.2), 0.55)

# Toma D: la hoja se coloca, la puerta se abre
p.fx(F(6) + 1.05, tok(0.85), 0.8)
p.fx(E(6) - 0.6, whoosh(0.8, up=False, lo=250, hi=1400), 0.25)

# Toma E: puerta en el pedestal, pila de 5, descuento
p.fx(F(7) + 0.55, tok(0.95), 0.7)
for i in range(5):
    p.fx(F(8) + 0.6 + i * 0.12, tok(1.1 + i * 0.05), 0.35)
p.fx(F(8) + (E(8) - F(8)) * 0.7 + 0.05, chime(), 0.5)

p.guardar('sfx.wav', voz='voz.mp3')
print('-> sfx.wav', round(DUR, 2), 's')
