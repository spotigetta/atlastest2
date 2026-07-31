# ATLAS · Mercabá

Atlas es el portal documental, visual e interactivo de todas las bibliotecas
especializadas preparadas para NotebookLM:

- Doctrina, teología y moral.
- CanonIA.
- HistorIA de la Iglesia y los Padres.
- LiturgIA.
- OrtodoxIA, CinePilot, BibliotecarIA, Los Clásicos y San JosemarIA.

La aplicación funciona como catálogo documental, biblioteca digital, explorador
del conocimiento y herramienta de descubrimiento diario. No responde por las
IA: permite comprender qué contiene cada una y abrir el cuaderno adecuado.

La descripción funcional y técnica completa se encuentra en
[`DOCUMENTACION_COMPLETA.md`](DOCUMENTACION_COMPLETA.md).

## Abrir Atlas

La forma recomendada es ejecutar
[`INICIAR_ATLAS.cmd`](../INICIAR_ATLAS.cmd). Inicia el servicio documental
local, comprueba las carpetas, actualiza lo que haya cambiado, consulta las
fuentes editoriales externas y abre Atlas en el navegador.

Para administrar la base documental puede ejecutarse
[`GESTOR_ATLAS.cmd`](../GESTOR_ATLAS.cmd) o abrir
`http://127.0.0.1:8765/gestor/` mientras el servicio está funcionando.

El Gestor admite hasta 100 Markdown en una sola selección, rechaza copias aunque
tengan otro frontmatter o diferencias de espacios, muestra las altas
inmediatamente y reconstruye Atlas una sola vez al terminar el lote.

`index.html` todavía puede abrirse directamente, pero en ese modo no están
disponibles la API de archivos ni el Gestor.

## Novedades 3.9

- 949 frases combinadas desde `frases.md` y `frases copy.md`, con deduplicación
  y un filtro editorial explícito en `content/quote-policy.json`.
- Cada biblioteca explica para qué sirve, muestra ejemplos y enlaza su
  infografía. El tutorial incorpora las nueve infografías completas.
- 66 fuentes de vídeo configuradas. Los seis canales de reserva están
  desactivados por defecto y aparecen con menor frecuencia al activarlos.
- Nueve canales musicales alimentan la sección Música y los Shorts musicales.
- Explorar se divide en Bibliotecas y estudio, Descubrir y actualidad, y Mapas
  y análisis.
- Las novedades editoriales incluyen San Pablo, EUNSA, Encuentro y Alianza.
- La guía visual muestra resúmenes y las nueve infografías completas desde
  recursos estáticos sincronizados con `infografiasfinal`.
- Vídeos y canciones se barajan con una semilla nueva en cada apertura; la
  sección Música permite generar otra mezcla manualmente.
- Si el servidor abierto todavía no reconoce `/api/music`, la interfaz utiliza
  automáticamente `data/youtube-music-cache.json`; Música sigue habilitada.
- El resplandor de Descubrir interpola posición, escala y color durante el
  desplazamiento, en lugar de saltar al llegar a la tarjeta siguiente.
- El tutorial utiliza nueve resúmenes visuales temáticos. La pieza completa se
  abre mediante una composición animada a pantalla completa.

Las APIs `/api/youtube-shorts` y `/api/music` sirven primero la última selección
guardada. Si ha caducado, actualizan los canales en segundo plano para no
bloquear la interfaz.

La revisión local que no abre servidor ni usa Internet es:

```powershell
node generators/validate-release.mjs
```

Para probar la instalación PWA y el modo sin conexión es necesario servir la
carpeta por HTTP:

```powershell
cd .\atlas
python -m http.server 8080
```

Después, abra `http://localhost:8080`.

## Estructura

```text
atlas/
├── index.html
├── styles/
│   ├── tokens.css
│   ├── base.css
│   ├── components.css
│   ├── themes.css
│   └── responsive.css
├── scripts/
│   ├── storage.js
│   ├── search.js
│   ├── share.js
│   ├── statistics.js
│   ├── library.js
│   ├── reader.js
│   ├── extras.js
│   ├── compare.js
│   ├── reels.js
│   ├── router.js
│   └── app.js
├── data/
│   ├── catalog.js
│   ├── catalog.json
│   ├── doctrine.json
│   ├── canon.json
│   ├── history.json
│   ├── liturgy.json
│   ├── collections.json
│   ├── routes.json
│   ├── shorts.json
│   ├── documents/          # contenido completo, cargado bajo demanda
│   ├── external-content.js # tarjetas editoriales generadas
│   ├── metadata-overrides.json
│   ├── import-report.json
│   ├── changelog.json
│   └── version.json
├── generators/
│   ├── build-data.mjs
│   ├── build-reader-content.mjs
│   ├── build-fulltext.mjs
│   ├── build-external-content.mjs
│   ├── update-all.mjs
│   ├── build-data.ps1
│   └── README.md
├── assets/icons/
├── manifest.webmanifest
├── service-worker.js
└── offline.html
```

## Actualización sencilla

Las carpetas `NN_IA_Nombre` son la base documental. Para incorporar una
fuente:

1. copie el Markdown en la carpeta de la IA correspondiente;
2. opcionalmente añada al principio `title`, `category`, `author` y `year`
   siguiendo [`content/PLANTILLA_DOCUMENTO.md`](content/PLANTILLA_DOCUMENTO.md);
3. ejecute [`ACTUALIZAR_ATLAS.cmd`](../ACTUALIZAR_ATLAS.cmd).

Al volver a ejecutar Atlas, el servicio compara la huella de las carpetas con la
última construcción. Si detecta cambios, actualiza catálogo, lector, búsqueda y
estadísticas. También puede pulsarse «Actualizar Atlas» desde el Gestor. No es
necesario editar HTML ni duplicar documentos dentro de `atlas`.

Las tarjetas de noticias, libros y oración se gestionan en
[`content/external-items.json`](content/external-items.json). Para añadir una,
basta con pegar su URL y asignar `type`: `news`, `books` o `prayer`. El
actualizador intenta obtener título, descripción, imagen, autor y fecha.

El registro de IA se encuentra en
[`content/libraries.json`](content/libraries.json). El Gestor puede crear una IA
y su carpeta numerada. Además, cualquier carpeta `NN_IA_Nombre` no registrada se
descubre automáticamente, se incorpora al registro y aparece aunque todavía no
contenga obras. Si una carpeta registrada cambia de nombre conservando su número,
Atlas reconcilia la nueva ruta sin perder su personalización.

## Ayuda, orientación y Descubrir

En la primera ejecución aparece un tutorial interactivo. Atlas cambia de
pantalla, desplaza el contenido hasta el control correspondiente y lo rodea con
un halo animado mientras explica su función y ofrece un ejemplo. El botón `?` de
la cabecera permite repetirlo en cualquier momento; también puede abrirse
escribiendo «cómo usar Atlas», «tutorial» o «ayuda Atlas» en el buscador.

El Navegador de Atlas clasifica localmente la intención de una pregunta. Combina
vocabulario temático, coincidencias del catálogo y preguntas editoriales para
recomendar una IA, mostrar alternativas y explicar la razón. No formula una
respuesta doctrinal ni envía la consulta a un servicio externo.

El feed Descubrir limita a tres las recomendaciones automáticas de documentos y las novedades
editoriales para favorecer citas, hechos, preguntas, cronologías, distinciones y
anécdotas. Las citas de san Josemaría consultan la selección aleatoria de
`escriva.org` al abrir Descubrir y usan `assets/images/fondo_sjm.png`.

`frases.md` es la fuente editable de las tarjetas de citas. El generador
`build-quotes.mjs` convierte automáticamente sus 700 entradas en Shorts. Los
canales se gestionan en `content/youtube-shorts.json`. El servidor expone
`/api/youtube-shorts`, consulta periódicamente sus pestañas Shorts, conserva una
caché local y entrega resultados paginados conforme el usuario desliza. El
reproductor oficial se abre dentro de Atlas; ningún vídeo se descarga o
redistribuye. La selección inicial funciona como respaldo sin conexión.

## Personalización local

«Personalizar Inicio» permite colocar primero «Atlas Hoy» o «Explora las IA».
También permite ordenar «Continúa leyendo» y «Continúa explorando» cuando estos
bloques están disponibles.
En Explorar, «Personalizar botones» permite cambiar el orden y el color de sus
doce accesos. La selección se guarda en el navegador y dispone de doce tonos:
amber, blue, clay, violet, emerald, rose, indigo, gold, cyan, olive, burgundy y
slate. La misma paleta está disponible en el Gestor para las bibliotecas.

## Grafos

La ruta `#/graph` ofrece dos mapas:

- jerarquía de una IA: biblioteca → categorías → fuentes;
- relaciones documentales: documento central → fuentes vinculadas por título,
  autor, categoría o biblioteca.

Los nodos abren sus bibliotecas o documentos. La barra permite acercar, alejar y
restablecer la escala.

## Actualizar el catálogo

Los datos se extraen de los cuatro archivos:

```text
0000_Indice_y_mapa_de_fuentes.md
```

Después de modificar cualquiera de ellos, ejecute desde la raíz de Mercabá:

```powershell
.\atlas\generators\build-data.ps1
```

También puede ejecutar directamente:

```powershell
node .\atlas\generators\build-data.mjs
```

El generador:

1. lee los cuatro índices;
2. extrae finalidad, temas, advertencias y documentos;
3. identifica de forma conservadora autores y años explícitos;
4. marca idiomas, documentos históricos e incompletos solo cuando el índice lo
   permite;
5. construye colecciones y rutas desde los mapas temáticos;
6. valida duplicados, categorías y recuentos;
7. genera los JSON, `catalog.js` y `import-report.json`.

Si hay un error de validación, el proceso termina sin publicar un catálogo
incorrecto.

## Añadir alias, preguntas o datos editoriales

Edite:

```text
data/metadata-overrides.json
```

Este archivo está separado de los datos generados. Permite mantener:

- alias de búsqueda;
- preguntas preparadas;
- versión de los datos;
- futuras relaciones o descripciones revisadas.

Después de editarlo, vuelva a ejecutar el generador.

## Crear Shorts

El generador crea únicamente contenidos que pueden verificarse en los índices:

- documento más extenso según el recuento;
- advertencia documental;
- pregunta basada en un mapa temático.

Todo Short publicado debe contener:

```json
{
  "type": "fact",
  "text": "...",
  "libraryId": "canon",
  "sourceDocumentId": null,
  "reference": "Advertencias documentales del índice",
  "verified": true,
  "reviewedAt": "2026-07-28"
}
```

Los contenidos con `verified: false` no aparecen en el feed normal.

## Cambiar enlaces de las IA

Los enlaces de Notebook se encuentran en `libraryConfig`, al principio de:

```text
generators/build-data.mjs
```

Cambie la URL y regenere el catálogo.

## Guardados y privacidad

Atlas usa `localStorage` para guardar:

- favoritos;
- historial;
- búsquedas recientes;
- progreso de rutas;
- resultados de preguntas;
- preferencias visuales.

No requiere registro y no envía estos datos a un servidor. En Guardados se
pueden exportar, importar o borrar.

## PWA y caché

La instalación requiere HTTPS en producción o `localhost` durante las pruebas.

- La estructura de la aplicación usa una estrategia `cache first`.
- Los datos documentales se actualizan en segundo plano.
- `offline.html` se utiliza cuando una navegación no está disponible.
- Cuando se instala una nueva versión estructural, Atlas muestra un aviso para
  actualizar.

Después de modificar la estructura, cambie las constantes de versión situadas al
principio de `service-worker.js`. Para limpiar una caché antigua:

1. abra las herramientas de desarrollo;
2. entre en **Application → Storage**;
3. pulse **Clear site data**;
4. recargue la página.

## Publicar en GitHub Pages

1. Suba la carpeta `atlas` a un repositorio.
2. En GitHub, abra **Settings → Pages**.
3. Seleccione la rama y la carpeta que contenga `index.html`.
4. Guarde y espere a que GitHub muestre la URL HTTPS.
5. Abra esa URL y utilice la opción **Instalar aplicación** del navegador.

También puede publicarse sin cambios en Cloudflare Pages, Vercel, Firebase
Hosting o cualquier alojamiento de archivos estáticos.

## Validar antes de publicar

Ejecute:

```powershell
node .\atlas\generators\build-data.mjs
node --check .\atlas\scripts\app.js
```

Compruebe `data/import-report.json`. Los apartados `errors` y `warnings` deben
estar vacíos o revisados conscientemente.

Pruebas manuales mínimas:

- buscar `Misal`, `Agustín`, `Código` y `0348`;
- abrir una ficha y el Notebook correspondiente;
- guardar y retirar un documento;
- completar un paso de una ruta;
- recorrer Shorts;
- comparar dos bibliotecas;
- cambiar entre tema claro, oscuro y sistema;
- probar un ancho móvil de 320–390 píxeles;
- activar el modo sin conexión.
