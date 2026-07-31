import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const atlasRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const workspace = path.dirname(atlasRoot);
const readJson = relative => JSON.parse(fs.readFileSync(path.join(atlasRoot, relative), "utf8"));
const failures = [];
const checks = [];
const assert = (condition, label, detail = "") => {
  checks.push({ ok: Boolean(condition), label, detail });
  if (!condition) failures.push(label);
};

for (const file of [
  "server.mjs", "scripts/app.js", "scripts/reels.js", "scripts/extras.js",
  "generators/build-quotes.mjs", "generators/build-external-content.mjs",
  "generators/build-youtube-music.mjs"
]) {
  try {
    execFileSync(process.execPath, ["--check", path.join(atlasRoot, file)], { stdio: "pipe", timeout: 5000 });
    assert(true, `Sintaxis ${file}`);
  } catch {
    assert(false, `Sintaxis ${file}`);
  }
}

const youtube = readJson("content/youtube-shorts.json");
const music = readJson("content/youtube-music.json");
const instagram = readJson("content/instagram.json");
const musicCache = readJson("data/youtube-music-cache.json");
const external = readJson("data/external-content.json");
const version = readJson("data/version.json");
const quoteSource = fs.readFileSync(path.join(atlasRoot, "data", "quotes.js"), "utf8");
const quoteCount = Number(quoteSource.match(/"count":(\d+)/)?.[1] || 0);
const quoteExcluded = Number(quoteSource.match(/"excluded":(\d+)/)?.[1] || 0);
const quotePayload = JSON.parse(quoteSource.slice(quoteSource.indexOf("=") + 1, -2));
const copyQuotes = quotePayload.items.filter(item => item.source === "frases copy.md");
const appSource = fs.readFileSync(path.join(atlasRoot, "scripts", "app.js"), "utf8");
const reelsSource = fs.readFileSync(path.join(atlasRoot, "scripts", "reels.js"), "utf8");
const indexSource = fs.readFileSync(path.join(atlasRoot, "index.html"), "utf8");
const infographicFiles = [
  "infodoctrina_textogrande.html", "infografiaCanonIA_v2.html", "infohistoria.html",
  "infografiaLiturgIA_v2.html", "infoCirculos.html", "infografiaCinepilot.html",
  "infobib.html", "infografiaLosClasicos_v2.html", "infoSJM.html"
];
const sources = new Set(external.items.map(item => item.source));

assert(version.version === "4.1.2", "Versión 4.1.2", version.version);
assert(quoteCount >= 900, "Corpus conjunto de frases", `${quoteCount} frases`);
assert(quoteExcluded >= 1, "Filtro editorial activo", `${quoteExcluded} exclusiones`);
assert(copyQuotes.length >= 250 && copyQuotes.every(item => item.author && !/\*/.test(`${item.author} ${item.reference}`)), "Autores y obras de frases copy", `${copyQuotes.length} frases limpias`);
assert(youtube.channels.filter(item => item.tier === "main").length >= 50, "Canales principales", `${youtube.channels.length} configurados`);
assert(youtube.channels.filter(item => item.tier === "reserve").length === 6, "Canales de reserva", "6 canales");
assert(music.channels.length === 9, "Canales musicales", "9 canales");
assert(instagram.channels.length === 15, "Cuentas de Instagram", "15 cuentas");
assert(musicCache.items.length > 0, "Reserva musical local", `${musicCache.items.length} piezas`);
assert(reelsSource.includes("/data/youtube-music-cache.json"), "Alternativa musical sin API");
assert(reelsSource.includes("updateAurora") && reelsSource.includes("--aurora-from") && reelsSource.includes("--aurora-to"), "Interpolación continua de la aurora");
assert(reelsSource.includes("/api/instagram-shorts") && appSource.includes("disabledInstagramChannels"), "Instagram y gestión de canales");
assert(appSource.includes("tutorialMiniInfographic"), "Nueve resúmenes visuales del tutorial");
assert(indexSource.includes("infographic-layer") && appSource.includes("openInfographic"), "Composición completa de infografías");
assert(["San Pablo", "EUNSA", "Ediciones Encuentro", "Alianza Editorial"].every(source => sources.has(source)), "Cuatro editoriales nuevas");
assert(external.items.some(item => item.type === "books" && item.image), "Tarjetas editoriales con portada");
assert(infographicFiles.every(file => fs.existsSync(path.join(workspace, "infografiasfinal", file))), "Nueve infografías disponibles");
assert(infographicFiles.every(file => fs.existsSync(path.join(atlasRoot, "assets", "infografias", file))), "Nueve infografías sincronizadas en Atlas");

for (const check of checks) console.log(`${check.ok ? "✓" : "✗"} ${check.label}${check.detail ? ` · ${check.detail}` : ""}`);
console.log(`\n${checks.length - failures.length}/${checks.length} comprobaciones superadas.`);
if (failures.length) process.exitCode = 1;
