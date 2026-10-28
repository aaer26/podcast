# Podcast — IES Newton Salas

Código de la web del podcast: entrada con televisión 3D, transición dimensional, portada con micrófono interactivo, bandera europea animada y páginas de episodios y presentación.

## GitHub Pages

Los archivos públicos están en `docs/`, conservando el dominio `podcast.erasmusiesnewtonsalas.blog` declarado en `docs/CNAME`. No se requiere instalación ni compilación.

# Web del IES Newton Salas

## Páginas independientes

- `docs/index.html`: habitación, tele 3D y entrada.
- `docs/podcast.html`: portada del podcast.
- `docs/episodios.html`: archivo de episodios.
- `docs/el-podcast.html`: presentación del proyecto.

## Comportamiento y diseño

- `docs/scene.js`: modelo 3D de la televisión, giro y acercamiento a la pantalla.
- `docs/dimension.js`: recorrido tridimensional por el túnel de luz.
- `docs/app.js`: coordina la entrada y navega a podcast.html.
- `docs/pages.js`: estado de navegación y llegada a las páginas interiores.
- `docs/podcast-3d.js`: micrófono condenser modelado en Three.js en la columna derecha (enlace a episodios) y bandera europea con malla deformada para simular tela ondeando.
- `docs/podcast-3d.css`: disposición de estos objetos y alternativas sin WebGL.
- `docs/style.css`, `docs/room.css`, `docs/immersive.css`: diseño compartido y habitación.
- `docs/pages.css`: cabeceras, páginas independientes y presentación del túnel.
- `docs/assets/`: fotografías, fondo, logotipo, bandera y Three.js local.

## Vista local

Desde esta carpeta ejecutar `python -m http.server 4173 --directory docs` y abrir http://localhost:4173.

## Transición

La cámara Three.js se aproxima a la pantalla durante 1,3 segundos; después atraviesa una escena 3D de anillos, marcos y partículas durante 2,7 segundos. El zoom apunta al panel negro del techo de la foto y llega a negro puro. Tras una pausa negra de 220 ms, los círculos aparecen gradualmente. El túnel se prepara antes del acercamiento. Al salir, se abre podcast.html. Con movimiento reducido se navega directamente. Si WebGL falla, el enlace sigue llevando a la portada.

Los antiguos enlaces #podcast, #episodios y #nosotros redirigen a sus HTML respectivos. No hay audios todavía; el archivo muestra Próximamente.
