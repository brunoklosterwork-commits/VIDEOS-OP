"""SFX del video 07 con sonidos reales (sonidos/, Mixkit). Escribe sfx.wav."""
import json, sys
sys.path.insert(0, '../../motor')
from sonidos import *
S = '../../sonidos/'
T = json.load(open('tiempos.json')); E = lambda i: T[i][1]
M = dict(rompiendo=2.54, aire=3.96, cocinas=6.44, banas=7.35, dormis=8.05, vapor=8.78, toca=10.61, vaso=13.2,
         solucion=15.27, ventila=16.37, cambias=18.34, doble=19.58, tibio=21.2, casiNo=23.26, guarda=24.91)
DUR = E(7) + 1.6; p = Pista(DUR)
gota = archivo(S + 'water-drop-cave.mp3', 0.45)
burbuja = archivo(S + 'liquid-bubble.mp3', 0.6)
lapiz = archivo(S + 'pencil-write-short.mp3')
papel = archivo(S + 'paper-slide.mp3', 0.7)
aire = archivo(S + 'swoosh-slow.mp3', 1.8)
traba = archivo(S + 'switch-tap.mp3', 0.4)
brillo = archivo(S + 'sparkle-touch.mp3', 1.2)
marcador = archivo(S + 'marker-pen-line.mp3', 0.8)
# gancho: el dibujo se traza y caen gotas (alternando volumen, cada vez más suave)
p.fx(0.05, lapiz, 0.35)
for i, tt in enumerate([0.5, 0.95, 1.5, 2.2]): p.fx(tt, gota, 0.42 - i * 0.07)
# cortes: roce de papel suave
for c in (M['cocinas'], M['toca'], M['vaso'], M['solucion'], M['cambias'], M['guarda']): p.fx(c - 0.05, papel, 0.22)
p.fx(M['cocinas'] + 0.3, burbuja, 0.35)                    # olla
p.fx(M['vapor'], aire, 0.18)                               # el aire se carga
for i in range(3): p.fx(M['toca'] + 1.3 + i * 0.22, gota, 0.3 - i * 0.05)   # vapor -> gotas
p.fx(M['vaso'] + 0.3, burbuja, 0.3)                       # gaseosa
p.fx(M['ventila'], traba, 0.45)                            # se abre la hoja
p.fx(M['ventila'] + 0.3, aire, 0.25)                       # corriente de aire
p.fx(M['doble'] + 0.1, marcador, 0.3)                      # corte del DVH
p.fx(M['guarda'] + 0.3, marcador, 0.25)                    # marcador de guardar
p.fx(M['guarda'] + 1.4, brillo, 0.4)                       # corazón se llena (único brillo del video)
p.guardar('sfx.wav', voz='voz.mp3'); print('-> sfx.wav', round(DUR, 2))
