"""Renderiza un video de VIDEOS OP (adaptado del motor de Lo Habías Oído) a partir de su index.html.

La página tiene que exponer:
  window.ready            -> promesa que se resuelve cuando cargaron las fuentes
  window.frameJPEG(t)     -> dibuja el cuadro del segundo t y devuelve un dataURL JPEG

Uso:
  # cuadros de prueba (siempre antes del render completo)
  python3 motor/render.py stills videos/03-tirar-manteca-al-techo/index.html 2.5 9.2 28.6

  # video completo, con voz y (opcional) efectos
  python3 motor/render.py video videos/03-tirar-manteca-al-techo/index.html 47.1 \
      --voz videos/03-tirar-manteca-al-techo/voz.mp3 --sfx sfx.wav --out salida.mp4

Requisitos: Python 3, playwright (con Chrome o Chromium) y ffmpeg.
Salida: 1080x1920, 30 fps, H.264. Audio nivelado a -14 LUFS (estándar de redes).
"""
import argparse, base64, os, subprocess, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

FPS = 30


RAIZ = Path(__file__).resolve().parent.parent  # raíz del repo


def servidor():
    """Sirve el repo por HTTP local (los módulos ES no cargan desde file://)."""
    import functools, http.server, threading
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(RAIZ))
    h.log_message = lambda *a: None
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv.server_address[1]


def open_page(p, html):
    exe = os.environ.get('CHROME') or ('/usr/bin/google-chrome' if Path('/usr/bin/google-chrome').exists() else None)
    b = p.chromium.launch(executable_path=exe) if exe else p.chromium.launch()
    pg = b.new_page(viewport={'width': 1080, 'height': 1920})
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{servidor()}/' + Path(html).resolve().relative_to(RAIZ).as_posix())
    pg.evaluate('window.ready')
    return b, pg, errs


def frame(pg, t):
    d = pg.evaluate('t=>window.frameJPEG(t)', t)
    return base64.b64decode(d.split(',', 1)[1])


def stills(html, times):
    with sync_playwright() as p:
        b, pg, errs = open_page(p, html)
        for t in times:
            name = f'still_{t:05.2f}.jpg'
            Path(name).write_bytes(frame(pg, t))
            print('->', name)
        b.close()
    if errs:
        print('errores en la página:', errs)


def video(html, dur, out, voz=None, sfx=None, sfx_gain=1.0):
    tmp = Path(out).with_suffix('.mudo.tmp.mp4')
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS), '-c:v', 'mjpeg', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', str(FPS), str(tmp)],
                          stdin=subprocess.PIPE)
    n = round(dur * FPS); t0 = time.time()
    with sync_playwright() as p:
        b, pg, errs = open_page(p, html)
        for i in range(n):
            ff.stdin.write(frame(pg, i / FPS))
            if i % 150 == 0:
                print(f'  cuadro {i}/{n}', flush=True)
        b.close()
    ff.stdin.close()
    if ff.wait() != 0:
        sys.exit('ffmpeg falló al codificar el video')
    print(f'video mudo listo en {time.time() - t0:.0f}s')
    if not voz:
        os.replace(tmp, out); return
    ins = ['-i', str(tmp), '-i', voz] + (['-i', sfx] if sfx else [])
    if sfx:
        fc = f'[1:a]aresample=48000[v];[2:a]volume={sfx_gain}[s];[v][s]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-14:TP=-1:LRA=11[a]'
    else:
        fc = '[1:a]aresample=48000,loudnorm=I=-14:TP=-1:LRA=11[a]'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', fc, '-map', '0:v', '-map', '[a]', '-c:v', 'copy',
                    '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', out], check=True)
    tmp.unlink()
    print('listo:', out)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest='modo', required=True)
    s = sub.add_parser('stills'); s.add_argument('html'); s.add_argument('tiempos', nargs='+', type=float)
    v = sub.add_parser('video'); v.add_argument('html'); v.add_argument('duracion', type=float)
    v.add_argument('--out', default='salida.mp4'); v.add_argument('--voz'); v.add_argument('--sfx'); v.add_argument('--sfx-gain', type=float, default=1.0)
    a = ap.parse_args()
    if a.modo == 'stills':
        stills(a.html, a.tiempos)
    else:
        video(a.html, a.duracion, a.out, a.voz, a.sfx, a.sfx_gain)
