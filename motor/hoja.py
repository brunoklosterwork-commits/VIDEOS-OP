"""Hoja de contacto: renderiza cuadros sueltos y los junta en /tmp/hoja.jpg. Uso: python3 hoja.py index.html t1 t2 ..."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import render
from playwright.sync_api import sync_playwright
from PIL import Image
import io
html, ts = sys.argv[1], [float(x) for x in sys.argv[2:]]
with sync_playwright() as p:
    b, pg, errs = render.open_page(p, html)
    ims = [Image.open(io.BytesIO(render.frame(pg, t))).resize((300, 533)) for t in ts]
    b.close()
s = Image.new('RGB', (300 * len(ims), 533), 'white')
for i, im in enumerate(ims): s.paste(im, (i * 300, 0))
s.save('/tmp/hoja.jpg'); print('errores:', errs)
