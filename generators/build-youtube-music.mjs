import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const atlasRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const content = JSON.parse(fs.readFileSync(path.join(atlasRoot, "content", "youtube-music.json"), "utf8"));
const youtubeCachePath = path.join(atlasRoot, "data", "youtube-live-cache.json");
const outputPath = path.join(atlasRoot, "data", "youtube-music-cache.json");
const youtube = fs.existsSync(youtubeCachePath)
  ? JSON.parse(fs.readFileSync(youtubeCachePath, "utf8"))
  : { items: [] };
const channelNames = new Set(content.channels.map(channel => channel.name.toLowerCase()));
const fallback = (youtube.items || []).filter(item => {
  const source = String(item.source || "").toLowerCase();
  return [...channelNames].some(name => source.includes(name) || name.includes(source));
}).map(item => ({
  ...item,
  type: "music",
  url: `https://www.youtube.com/watch?v=${item.videoId}`,
  image: `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`
}));
const previous = fs.existsSync(outputPath)
  ? JSON.parse(fs.readFileSync(outputPath, "utf8"))
  : { items: [] };
const items = [...new Map([...(previous.items || []), ...fallback].map(item => [item.videoId, item])).values()];
fs.writeFileSync(outputPath, `${JSON.stringify({
  updatedAt: previous.updatedAt || youtube.updatedAt || new Date().toISOString(),
  source: items.length ? "youtube-cache-fallback" : "awaiting-first-refresh",
  channels: content.channels,
  items,
  failures: []
}, null, 2)}\n`);
console.log(`Atlas music: ${items.length} cached tracks; ${content.channels.length} dynamic channels.`);
