# Aprendizajes: demo de video-shotcraft

**Fecha:** 24/11/2026
**Objetivo de la sesión:** conocer la herramienta video-shotcraft y ver una demo real de lo que produce.

---

## Qué hicimos

1. **Explicación de la herramienta.** Repasamos qué es video-shotcraft: un kit para hacer videos de producto con estética de cine, renderizados con Remotion. Incluye 157 tarjetas de tomas ("recetas" de movimiento con su código de ejemplo), la plantilla completa Ink Press, componentes de cámara 2.5D, 149 efectos de sonido, música y sincronización de cortes con el ritmo.
2. **Repaso de los cuatro modos de uso:**
   - plantilla Ink Press;
   - creación libre autónoma;
   - creación conjunta, con aprobación en cada etapa;
   - toma individual con un efecto de la galería.
3. **Render de una demo.** Generamos el video completo de la plantilla Ink Press (composición `AiflPromo`) sin modificarla.
4. **Preguntas aclaradas:**
   - si se puede usar cualquier efecto de la galería;
   - qué material hace falta para hacer un video.

## Recetas de plano usadas

- **No se eligió ni se aplicó ninguna tarjeta de toma individual.** La demo fue la plantilla Ink Press tal cual viene, con sus tomas ya integradas: cámara 2.5D sobre capturas de interfaz, tarjetas que entran como un reparto de cartas, pausas de lectura y sonido sincronizado (whoosh, impacto, brillo).
- Como ejemplos de nombres solo se mencionaron `deck-deal-flyin` y `spotlight-hero-card`. Ninguno de los dos se renderizó.

## Ajustes pedidos

- Ninguno. No se pidieron cambios de textos, colores, ritmo ni formato. La demo se entregó con los valores originales de la plantilla.

## Qué salió bien

- El render completo funcionó: **36,2 s, 1085 fotogramas, 20,2 MB, con audio**. Tardó unos 3 minutos con 2 núcleos de CPU.
- Revisé fotogramas sueltos del video y las tarjetas, la tipografía y la composición se veían limpias.
- Quedó claro que:
  - cualquier efecto de la galería se puede usar, porque cada uno tiene su código fuente (221 archivos de demo);
  - los efectos se adaptan a la marca (tipografía, colores) y a cualquier formato (vertical, horizontal, cuadrado).

## Qué no salió bien y cómo se resolvió

| Problema | Causa | Solución |
|---|---|---|
| El render falló al arrancar con `--concurrency=4` | El entorno tenía solo 2 núcleos de CPU | Usar `--concurrency=2` |
| Remotion no pudo descargar Chrome Headless Shell (`ENOTFOUND remotion.media`) | La red del entorno bloquea ese dominio | Usar el Chrome que ya estaba instalado: `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell` |

**Para la próxima:**
- Revisar la cantidad de núcleos antes de renderizar.
- Apuntar desde el principio al Chrome local.

## Dónde quedaron los archivos

- **Video demo:** `promo.mp4`, enviado en el chat (descargable desde ahí). Copia de trabajo en el entorno en la nube: `/home/claude/demo/out/promo.mp4`. Ese entorno es temporal, así que la copia que vale es la del chat.
- **Proyecto de la plantilla:** `/home/claude/demo/`, también en el entorno temporal en la nube.
- **No se guardó nada en tu computadora.** Durante el chat no había ninguna carpeta conectada.
- **Galería de efectos:** https://vincentwei1021.github.io/video-shotcraft/library.html

## Material necesario para un próximo video

- **Imprescindible:**
  - qué se quiere mostrar;
  - el efecto o los efectos elegidos, o dejar la elección a Claude.
- **Visual:**
  - URL, carpeta del proyecto o capturas;
  - fotos o videos propios;
  - logo en PNG transparente o SVG.
- **Marca (opcional):** colores, tipografías y textos para mostrar en pantalla.
- **Formato (opcional):**
  - proporción: 9:16, 16:9 o 1:1;
  - duración;
  - música, si se quiere sincronizar con el ritmo.
- **Evitar:** datos reales de clientes o información privada en las capturas.
- **Para una prueba rápida de una sola toma alcanza con:** una captura o foto, el logo y el nombre del efecto.

## Estado

No había material disponible, así que la producción real quedó pendiente para cuando lo haya.
