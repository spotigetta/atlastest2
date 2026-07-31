import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const atlasRoot = path.dirname(here);
const sourceRoot = path.dirname(atlasRoot);
const catalog = JSON.parse(fs.readFileSync(path.join(atlasRoot, "data", "catalog.json"), "utf8"));
const output = path.join(atlasRoot, "data", "fulltext-index.js");
const maxTerms = Number(process.env.ATLAS_FULLTEXT_TERMS || 80000);

const stopwords = new Set(`
para como esta este estos estas desde entre sobre hasta donde cuando porque pero mas muy que del las los una uno unos unas
con sin por sus son fue han hay ser sea al el la de en y o a se no si un su lo le es ya e ni mi tu
dans avec pour les des une sur par est sont que qui pas plus aux ses leur comme mais ou du au
the and for with from that this are was were have has not its into
et in ad de ex non cum per est sunt qui quae quod ut sed aut ab
`.trim().split(/\s+/));

const normalize = value => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const tokenize = line => {
  const words = normalize(line).match(/[\p{L}\p{N}]{3,32}/gu) || [];
  return words.filter(word => !stopwords.has(word) && !/^\d+$/.test(word));
};

const documents = catalog.libraries.flatMap(library => library.documents.map(document => ({
  id: document.id,
  title: document.title,
  libraryId: library.id,
  path: path.join(sourceRoot, library.folder, document.file)
}))).filter(document => fs.existsSync(document.path));

async function scanDocument(filePath, onToken) {
  const input = fs.createReadStream(filePath, { encoding: "utf8" });
  const lines = readline.createInterface({ input, crlfDelay: Infinity });
  for await (const line of lines) {
    for (const token of tokenize(line)) onToken(token);
  }
}

console.log(`Atlas full text: pass 1/2 over ${documents.length} documents...`);
const frequencies = new Map();
let processed = 0;
for (const document of documents) {
  await scanDocument(document.path, token => frequencies.set(token, (frequencies.get(token) || 0) + 1));
  processed += 1;
  if (processed % 25 === 0) console.log(`  ${processed}/${documents.length}`);
}

const selected = new Set([...frequencies.entries()]
  .filter(([, count]) => count >= 3)
  .sort((a, b) => b[1] - a[1])
  .slice(0, maxTerms)
  .map(([term]) => term));
frequencies.clear();

console.log(`Atlas full text: pass 2/2, ${selected.size} indexed terms...`);
const postings = new Map([...selected].map(term => [term, []]));
processed = 0;
for (let docIndex = 0; docIndex < documents.length; docIndex += 1) {
  const counts = new Map();
  await scanDocument(documents[docIndex].path, token => {
    if (selected.has(token)) counts.set(token, (counts.get(token) || 0) + 1);
  });
  for (const [term, count] of counts) postings.get(term).push(docIndex, count);
  processed += 1;
  if (processed % 25 === 0) console.log(`  ${processed}/${documents.length}`);
}

const terms = Object.fromEntries([...postings.entries()].filter(([, values]) => values.length));
const payload = {
  meta: {
    version: catalog.meta.dataVersion,
    generatedAt: new Date().toISOString(),
    documents: documents.length,
    terms: Object.keys(terms).length,
    method: "Inverted index; exact normalized terms; stopwords excluded"
  },
  documents: documents.map(({ id, title, libraryId }) => ({ id, title, libraryId })),
  terms
};
fs.writeFileSync(output, `window.ATLAS_FULLTEXT=${JSON.stringify(payload)};\n`);
console.log(`Full-text index written: ${output} (${(fs.statSync(output).size / 1048576).toFixed(1)} MB).`);
