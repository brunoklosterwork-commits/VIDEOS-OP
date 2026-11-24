# Lo que tomamos de video-shotcraft

video-shotcraft es una librería de "recetas de plano" para videos de producto: 157 tarjetas de movimiento con su código, reglas de estética aprendidas de devoluciones reales, un esqueleto de energía para el video completo y una librería de sonidos con licencia libre. Está pensada para Remotion y promos de software; acá nos quedamos con lo que sirve para OP y lo aplicamos con nuestro motor (canvas + plumilla).

## 1. Reglas que adoptamos (con su número original)

**Ritmo**
- **R1 · Respirar después del dato.** Lo que queremos que se recuerde (el precio, el accesorio bueno, el logo) queda quieto **≥ 1 s** antes de cortar. Si hay que elegir, la pausa va al dato clave, no a un elemento cualquiera.
- **R2 · Nada se mueve a velocidad constante.** Todo entra con aceleración/desaceleración. Si entran muchos elementos iguales, que entren **cada vez más rápido** y al final **0,5 s quietos**.
- **R3 · Ante la duda, más lento.** La acción principal del gancho dura ≥ 3 s. La primera versión casi siempre sale apurada: arrancar una marcha más lenta.

**Imagen y cámara**
- **Q3 · Cámara estable.** Nada de temblor de cámara salvo un golpe puntual con sentido (portazo). Máximo 1–2 por video.
- **Q4 · Brillos con cuentagotas.** Un solo destello por video, sobre el protagonista. Nunca un brillo por cada elemento que entra.
- **Q5 · El gancho tiene un solo protagonista** con una acción completa (aparece → se acerca → hace algo → se asienta).
- **Q11 · Texto legible en el celular.** Subtítulos ≥ 56 px de alto real; etiquetas ≥ 32 px. Lo que no se va a poder leer, se saca.

**Sonido**
- **S1 · Sonido de objeto real, no de videojuego.** Lápiz, papel, clic de una traba, golpe de madera. Nada de "bleeps" ni pops sintéticos de juego.
- **S2 · Cada SFX anotado** con el momento exacto y la acción que acompaña (ya lo hacemos en `sfx.py`). Si se repite el mismo sonido varias veces seguidas: alternar dos versiones y bajar el volumen de a poco.
- **S3 · Si cambian los tiempos, se revisa toda la tabla de SFX.**
- **S4 · Cada acción con su sonido.** Si algo se dibuja, suena lápiz; si una hoja se corre, suena roce; si se traba, suena el golpe.

**Guion**
- **C1 · Al final, releer la voz contra el video armado.** Ningún tramo de más de 3 s sin texto ni subtítulo (salvo el cierre).
- **C2 · Nombres concretos, no frases abstractas.** "Ruedas con rulemán" en lugar de "calidad superior".

**Proceso**
- **P1 · Revisar cuadros antes de entregar** (ya lo hacemos con la hoja de contacto).
- **P4 · Una técnica protagonista por video.** Si en un video el truco es "pantalla partida", no se repite como protagonista en otra toma del mismo video. Nada de tomas que repitan información.

## 2. Esqueleto de energía (adaptado a Reels de 30 s)

| Tramo | % del video | Energía | Qué pasa |
|---|---|---|---|
| Gancho | 15 % | media | Un protagonista, una acción completa, pregunta en pantalla |
| Desarrollo | 60–65 % | sube y baja | Cada toma = una idea; alternar tomas movidas con tomas de lectura |
| Respiro | 1–2 tarjetas de ~1,8 s | baja | Frase sola en papel, una palabra en azul |
| Cierre | 15 % | la más alta | Todo lo mostrado vuelve a aparecer junto + acción concreta para vos; quieto ≥ 1 s |

## 3. Recetas de plano que encajan con la Plumilla OP

| Receta | Qué hace | Para qué la usaríamos |
|---|---|---|
| `line-boil` | En las pausas, las líneas tiemblan apenas cada 3 cuadros, como dibujo a mano redibujado | Que la plumilla "respire" cuando la imagen está quieta (ideal para R1) |
| `hatch-depth` | El rayado se completa y se vuelve sólido de color | Pasar de "boceto" a "producto real": el rayado se llena de azul |
| `draw-svg-trace` | Una línea de tinta recorre el contorno de algo y lo "dibuja" | Presentar una abertura o un accesorio |
| `marker-underline-title` | Un subrayado de marcador aparece bajo la palabra clave | Resaltar la palabra en azul del titular |
| `paper-title-card` | Tarjeta de respiro: una frase que se imprime sobre papel | Separar bloques del desarrollo |
| `before-after-slider-scrub` | Una barra barre la imagen y revela el "después" | Barato vs. calidad, en lugar de pantalla partida estática |
| `speed-ramp-freeze` | El movimiento se congela, aparece una anotación y sigue | Frenar sobre un detalle (la rueda, el burlete) |
| `print-texture-transitions` | Transición con mancha de tinta que se expande | Cambio de toma muy de plumilla |
| `stroke-segment-build` | El título aparece de a trazos sueltos hasta que se entiende | Gancho de intriga (máximo 1 por video) |

El código de referencia de cada receta está en la skill (`demos/`), en Remotion. Lo pasamos a nuestro motor cuando lo usemos, respetando los valores de tiempo de la receta.

## 4. Sonidos reales

Copiamos a `sonidos/` 15 efectos con licencia libre verificada (Mixkit): lápiz, lapicera, marcador, hojas de papel, roces, clics de interruptor, un destello suave y golpes. Se cargan con `archivo('sonidos/…')` en `sfx.py`. Desde el video 07, los rasguidos y clics sintéticos se reemplazan por estos.

## 5. Cómo usar Remotion si una receta lo pide (notas de la demo, 24/11)

Resumen completo de la demo en `docs/demo-shotcraft-resumen.md`. Desde el 24/11 el entorno puede instalar paquetes (probado: Remotion 4.0.546 instala en ~25 s).
- La plantilla Ink Press renderizó completa: 36 s, 1085 cuadros, ~3 min con 2 núcleos.
- **Antes de renderizar:** revisar núcleos (`nproc`) y usar `--concurrency` = núcleos (con 4 falla si hay 2).
- **Chrome:** Remotion no puede bajar su Chrome (`remotion.media` bloqueado). Usar el local:
  `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell`
- **Cuándo usarlo en OP:** solo si una receta es muy compleja de pasar a nuestro motor. Para la plumilla, nuestro motor es más rápido (~1 min por video) y ya tiene todo el estilo.
- **Material para una toma con receta:** qué mostrar, el nombre de la receta (de la galería https://vincentwei1021.github.io/video-shotcraft/library.html), fotos o capturas propias y el logo en PNG/SVG. Nunca datos reales de clientes.

## 6. Lo que no usamos (por ahora)

- **Música con cortes al ritmo:** no usamos música de fondo. Si algún día la sumamos, la skill tiene el método para cortar en el pulso.
- **Recetas de interfaz de software** (dashboards, buscadores): son para promos de apps, no para OP.
