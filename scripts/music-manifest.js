"use strict";

const fs = require("fs");
const path = require("path");
const mm = require("music-metadata");

const AUDIO_EXTENSIONS = new Set([
  ".mp3",
  ".m4a",
  ".aac",
  ".flac",
  ".wav",
  ".ogg",
  ".oga",
  ".opus",
  ".webm"
]);

const FESTIVAL_FOLDERS = {
  cny: "cny",
  "chinese-new-year": "cny",
  spring: "cny",
  halloween: "halloween",
  christmas: "christmas",
  xmas: "christmas"
};

const NORMAL_FOLDERS = new Set(["normal", "daily", "music"]);

function isAudio(name) {
  return AUDIO_EXTENSIONS.has(path.extname(name).toLowerCase());
}

function isHidden(name) {
  return name.startsWith(".") || name.startsWith("_");
}

function folderKey(name) {
  const key = name.toLowerCase();
  if (FESTIVAL_FOLDERS[key]) return FESTIVAL_FOLDERS[key];
  if (NORMAL_FOLDERS.has(key)) return "normal";
  return "";
}

function toUrl(base, file) {
  const relative = path.relative(base, file).split(path.sep).join("/");
  return "/music/" + relative.split("/").map(encodeURIComponent).join("/");
}

async function findLyrics(file, base) {
  const dir = path.dirname(file);
  const stem = path.basename(file, path.extname(file)).toLowerCase();
  try {
    const entries = await fs.promises.readdir(dir);
    const hit = entries.find((name) => name.toLowerCase() === stem + ".lrc");
    if (hit) return toUrl(base, path.join(dir, hit));
  } catch (error) {
    return "";
  }
  return "";
}

async function readMetadata(file) {
  let title = path.basename(file, path.extname(file)).trim();
  let artist = "-";
  try {
    const metadata = await mm.parseFile(file, { duration: false, skipCovers: true });
    if (metadata.common.title && String(metadata.common.title).trim()) {
      title = String(metadata.common.title).trim();
    }
    const author = metadata.common.artist || metadata.common.albumartist;
    if (author && String(author).trim()) artist = String(author).trim();
  } catch (error) {
    // Fall back to the filename when tags cannot be read.
  }
  return { title, artist };
}

async function addTrack(file, key, base, result) {
  const info = await readMetadata(file);
  result[key].push({
    title: info.title || "无",
    artist: info.artist || "-",
    src: toUrl(base, file),
    lyrics: await findLyrics(file, base)
  });
}

async function scanFolder(dir, key, base, result) {
  let entries;
  try {
    entries = await fs.promises.readdir(dir, { withFileTypes: true });
  } catch (error) {
    return;
  }
  for (const entry of entries) {
    if (isHidden(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await scanFolder(full, key, base, result);
    } else if (entry.isFile() && isAudio(entry.name)) {
      await addTrack(full, key, base, result);
    }
  }
}

async function buildManifest(hexo) {
  const base = path.join(hexo.source_dir, "music");
  const result = {
    normal: [],
    cny: [],
    halloween: [],
    christmas: []
  };

  if (fs.existsSync(base)) {
    const entries = await fs.promises.readdir(base, { withFileTypes: true });
    for (const entry of entries) {
      if (isHidden(entry.name)) continue;
      const full = path.join(base, entry.name);
      if (entry.isDirectory()) {
        const key = folderKey(entry.name);
        if (key) await scanFolder(full, key, base, result);
      } else if (entry.isFile() && isAudio(entry.name)) {
        await addTrack(full, "normal", base, result);
      }
    }
  }

  for (const key of Object.keys(result)) {
    result[key].sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
  }

  const manifest = {
    generated: new Date().toISOString(),
    tracks: result
  };

  const target = path.join(hexo.public_dir, "data", "music.json");
  await fs.promises.mkdir(path.dirname(target), { recursive: true });
  await fs.promises.writeFile(target, JSON.stringify(manifest), "utf8");
  const counts = Object.keys(result)
    .map((key) => key + ":" + result[key].length)
    .join(" ");
  hexo.log.info("ALIST music manifest: " + counts);
}

hexo.extend.filter.register("after_generate", async function () {
  await buildManifest(hexo);
});
