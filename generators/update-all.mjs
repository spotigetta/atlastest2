import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const scripts = [
  "build-data.mjs",
  "build-reader-content.mjs",
  "build-fulltext.mjs",
  "build-quotes.mjs",
  "build-youtube-shorts.mjs",
  "build-youtube-music.mjs",
  "build-channel-catalog.mjs",
  "sync-infographics.mjs",
  "build-external-content.mjs"
];

for (const script of scripts) {
  console.log(`\n→ ${script}`);
  execFileSync(process.execPath, [path.join(here, script)], { stdio: "inherit" });
}
console.log("\nAtlas actualizado desde las carpetas documentales y la base editorial.");
