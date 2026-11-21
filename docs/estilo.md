# Estilo OP — "Maqueta blanca" (borrador v0.1)

Referencias: `referencias/ejemplo_1..6.jpg` (elegidas por Bruno).
Prueba actual: `estilo/prueba-01/` (`cuadro.jpg`, `prueba-movimiento.mp4`).

## Idea
El mundo es una **maqueta de arcilla blanca** vista en isométrico. Todo es blanco y suave;
**lo único con color es lo que importa**: la puerta OP, el recorrido, el dato clave.

## Reglas
- **Material**: blanco cálido-frío (#F6F7FA), sombreado por cara, sin contornos, filo de luz en bordes superiores.
- **Luz**: una sola, arriba-izquierda. Sombras largas y muy difusas + sombra de contacto corta.
- **Fondo**: estudio gris-azulado muy claro (#F3F5F9 → #E4E8F0) con viñeta suave.
- **Acento único**: azul OP (#265CEB) — puerta, camino luminoso, barras de progreso, palabra clave del titular. (A confirmar contra la marca: azul u naranja.)
- **Cámara**: isométrica. En cada toma, zoom-in lento (4–9 %) + traveling lateral suave (`camara()` en op.js); mueve solo la maqueta, títulos/tarjetas/subtítulos quedan fijos (parallax). Cortes limpios con destello blanco suave, sin zoom de golpe.
- **UI flotante**: tarjetas blancas redondeadas con sombra suave (cronómetros, precios, medidas, checklist).
- **Tipografía**: DM Sans. Titular 800, tinta #1B2233; dato clave en azul.
- **Subtítulos**: texto tinta 800 con halo blanco suave (sin píldora, para que la maqueta se vea), centrado **sobre la línea del tercio inferior** (y = 1280 de 1920), 3–4 palabras, minúscula. Nunca pegados al borde inferior. Tarjetas y datos van por encima o por debajo de esa franja, nunca encima del subtítulo.

- **Composición**: lo importante de cada toma va por encima del tercio inferior; debajo solo piso de la maqueta y tarjetas.
- **SFX**: pocos y suaves, ~10 dB bajo la voz (`--sfx-gain 0.3`): `tok` cuando una pieza se apoya, `pop` en tildes/cotas, whoosh corto en cada corte, `chime` solo en el dato final.

## Pendiente
- Logo y color real de OP.
- Modelo fiel de la K64 (fotos del producto).
- Optimizar el render (hoy ~1,4 s por cuadro por los desenfoques de sombra).

## Modo 3D (opcional, usado en 04 y 05)
> Por defecto los videos se hacen con la maqueta isométrica 2.5D (render ~1 min). El 3D queda disponible solo si se pide, porque tarda ~15 min por video.
- Motor: `motor/escena3d.js` + `motor/personaje3d.js` (three.js en `motor/vendor/three`, render con WebGL por software).
- Mismo lenguaje: arcilla blanca, luz suave de una sola fuente, un solo acento azul (puertas, flechas, resaltes).
- **Personaje**: arcilla, gorro de lana, buzo azul OP, pantalón topo, zapatillas blancas. Gestos: caminar, saludar, señalar, pensar, asustarse, saltar. Extras (gente) en blanco/gris para no competir con el acento.
- **Cámara en perspectiva**: dolly-in + traveling lateral en cada toma, distancia 10–17 m con FOV 30 para que entre el ancho en 9:16; lo importante por encima del tercio inferior.
- Render ~1,2 s/cuadro (un video de 25 s ≈ 15 min).
