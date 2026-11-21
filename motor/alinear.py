"""Sincroniza el guion con la voz en off, sin transcripción.

Detecta las pausas de la voz y reparte las frases del guion entre los tramos de habla,
buscando la combinación con el ritmo (sílabas por segundo) más parejo.
Si el costo final es alto (> 2), probablemente la voz no leyó el guion tal cual:
partí las frases más largas en sus comas y volvé a correrlo.

Uso:
  python3 motor/alinear.py voz.mp3 frases.txt          # una frase por línea
  python3 motor/alinear.py voz.mp3 frases.txt --umbral -35 --pausa 0.15

Escribe tiempos.json: [[inicio, fin, "texto"], ...] listo para los subtítulos y los cortes.
"""
import argparse, json, math, re, subprocess
from functools import lru_cache


def tramos(voz, umbral, pausa):
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', voz],
                               capture_output=True, text=True).stdout)
    out = subprocess.run(['ffmpeg', '-i', voz, '-af', f'silencedetect=n={umbral}dB:d={pausa}', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r'silence_start: ([0-9.]+)', out)]
    en = [float(x) for x in re.findall(r'silence_end: ([0-9.]+)', out)]
    S, prev = [], 0.0
    for a, b in zip(st, en):
        if a - prev > 0.05:
            S.append((prev, a))
        prev = b
    if prev < dur - 0.1:
        S.append((prev, dur))
    return S


def silabas(s):
    return len(re.findall(r'[aeiouáéíóúü]+', s.lower()))


def alinear(P, S):
    ps = [silabas(p) for p in P]
    R = sum(ps) / sum(b - a for a, b in S)

    @lru_cache(None)
    def f(i, j):
        if i == len(P) and j == len(S):
            return (0.0, ())
        if i == len(P) or j == len(S):
            return (1e9, ())
        best = (1e9, ())
        for k in range(i + 1, min(len(P), i + 4) + 1):
            n = sum(ps[i:k]); d = S[j][1] - S[j][0]
            c = math.log(max(n, 1) / d / R) ** 2
            sub = f(k, j + 1)
            if c + sub[0] < best[0]:
                best = (c + sub[0], ((i, k),) + sub[1])
        return best
    return f(0, 0), R


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('voz'); ap.add_argument('frases')
    ap.add_argument('--umbral', type=float, default=-35); ap.add_argument('--pausa', type=float, default=0.15)
    ap.add_argument('--out', default='tiempos.json')
    a = ap.parse_args()
    P = [l.strip() for l in open(a.frases, encoding='utf-8') if l.strip()]
    S = tramos(a.voz, a.umbral, a.pausa)
    (costo, asign), R = alinear(P, S)
    print(f'{len(S)} tramos de voz · {len(P)} frases · ritmo {R:.1f} síl/s · costo {costo:.2f}')
    res = []
    for j, (i, k) in enumerate(asign):
        texto = ' '.join(P[i:k]); res.append([round(S[j][0], 2), round(S[j][1], 2), texto])
        print(f'{S[j][0]:6.2f}–{S[j][1]:6.2f}  {texto}')
    json.dump(res, open(a.out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('->', a.out)
