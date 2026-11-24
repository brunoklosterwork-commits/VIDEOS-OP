import sys; sys.path.insert(0, '../../motor')
from sonidos import *
S = '../../sonidos/'
p = Pista(5.0)
p.fx(0.0, archivo(S + 'swoosh-slow.mp3', 0.6), 0.3)
p.fx(0.5, archivo(S + 'paper-slide.mp3', 0.5), 0.35)     # sticker aterriza
for i, tt in enumerate([0.45, 0.75, 1.05]): p.fx(tt, archivo(S + 'switch-tap.mp3', 0.25), 0.35 - i * 0.05)  # palabras
p.fx(1.25, archivo(S + 'marker-pen-line.mp3', 0.6), 0.4) # resaltador
for i in range(5): p.fx(1.6 + i * 0.2, archivo(S + 'water-drop-cave.mp3', 0.35), 0.3 - i * 0.03)
p.fx(2.2, archivo(S + 'marker-pen-line.mp3', 0.8), 0.35) # círculo
p.fx(3.2, archivo(S + 'hit-weak.mp3', 0.5), 0.45)        # zoom
p.fx(3.7, archivo(S + 'bass-hit-short.mp3', 0.6), 0.35)  # sello
p.guardar('sfx.wav', voz='voz5.wav'); print('ok')
