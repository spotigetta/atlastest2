# Generador de datos de Atlas

## Actualizar todo

Desde la carpeta `Mercaba`:

```powershell
node atlas/generators/update-all.mjs
```

También puede ejecutarse `ACTUALIZAR_ATLAS.cmd` con doble clic. El proceso lee
directamente los Markdown de las cuatro carpetas IA; no hay que copiar archivos
a la carpeta `atlas`.

`build-data.mjs` transforma los cuatro índices Markdown en un catálogo que Atlas
puede consultar localmente.

## Ejecución

Desde la raíz del proyecto:

```powershell
.\atlas\generators\build-data.ps1
```

## Entradas

El generador busca estas carpetas junto a `atlas`:

- `01_IA_Doctrina_Teologia_Moral`
- `02_IA_Derecho_Canonico`
- `03_IA_Historia_Iglesia_Padres`
- `04_IA_Liturgia`

Cada carpeta debe incluir `0000_Indice_y_mapa_de_fuentes.md`.

## Salidas

Los archivos se escriben en `atlas/data`. `catalog.js` permite abrir la
aplicación directamente como archivo local. `catalog.json` y los JSON separados
se destinan a despliegues y procesos editoriales.

`import-report.json` registra fecha, versión, recuentos y validación.

## Criterios conservadores

- Un autor solo se identifica si su nombre puede reconocerse en el título.
- Un año solo se extrae si aparece explícitamente.
- Un idioma solo se marca si el índice incluye el número en su advertencia.
- El estado histórico o incompleto procede de las advertencias.
- Lo no disponible permanece como `null` y la aplicación muestra
  «No consignado en el índice».

Los enriquecimientos manuales deben conservarse en
`data/metadata-overrides.json`, no dentro de los archivos generados.

## Índice de texto completo

Cuando cambien los documentos Markdown, regenere también el índice diferido:

```powershell
node .\atlas\generators\build-fulltext.mjs
```

El proceso realiza dos pasadas sobre los documentos y genera
`data/fulltext-index.js`. Este archivo no se carga al abrir Atlas; se descarga
cuando el usuario solicita una búsqueda dentro del contenido.
