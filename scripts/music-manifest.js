"use strict";

const fs = require("fs");
const path = require("path");

let musicMetadataPromise = null;

function loadMusicMetadata() {
  if (!musicMetadataPromise) musicMetadataPromise = import("music-metadata");
  return musicMetadataPromise;
}

function resolveInside(root, ...parts) {
  // root is a trusted caller argument
  const base = path.resolve(root); // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal
  // containment is checked immediately below
  const resolved = path.resolve(base, ...parts); // nosemgrep: javascript.lang.security.audit.path-traversal.path-join-resolve-traversal
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error("refusing path outside " + base);
  }
  return resolved;
}

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
    // dir is under the scan root
    const entries = await fs.promises.readdir(dir); // nosemgrep: javascript.lang.security.audit.detect-non-literal-fs-filename
    const hit = entries.find((name) => name.toLowerCase() === stem + ".lrc");
    if (hit) return toUrl(base, resolveInside(dir, hit));
  } catch (error) {
    return "";
  }
  return "";
}

async function readMetadata(file) {
  const stem = path.basename(file, path.extname(file)).trim();
  let title = "";
  let artist = "";
  try {
    const mm = await loadMusicMetadata();
    const metadata = await mm.parseFile(file, { duration: false, skipCovers: true });
    if (metadata.common.title && String(metadata.common.title).trim()) {
      title = String(metadata.common.title).trim();
    }
    const author = metadata.common.artist || metadata.common.albumartist;
    if (author && String(author).trim()) artist = String(author).trim();
  } catch (error) {
    // Fall back to the filename when tags cannot be read.
  }

  const separator = stem.lastIndexOf(" - ");
  if (separator > 0) {
    const left = stem.slice(0, separator).trim();
    const right = stem.slice(separator + 3).trim();
    const hasHanLeft = /[\u3400-\u9fff]/.test(left);
    const hasHanRight = /[\u3400-\u9fff]/.test(right);
    if (hasHanLeft && hasHanRight) {
      if (!artist) artist = left;
      if (!title) title = right;
    } else {
      if (!title) title = left;
      if (!artist) artist = right;
    }
  }
  if (!title) title = stem;

  const clean = (value) => String(value).replace(/\s*mp3\s*$/i, "").trim();
  title = clean(title) || "无";
  artist = artist === "-" ? "-" : clean(artist) || "-";
  if (artist !== "-") artist = artist.replace(/,(?=\S)/g, ", ");

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
    // dir is under the scan root
    entries = await fs.promises.readdir(dir, { withFileTypes: true }); // nosemgrep: javascript.lang.security.audit.detect-non-literal-fs-filename
  } catch (error) {
    return;
  }
  for (const entry of entries) {
    if (isHidden(entry.name)) continue;
    const full = resolveInside(dir, entry.name);
    if (entry.isDirectory()) {
      await scanFolder(full, key, base, result);
    } else if (entry.isFile() && isAudio(entry.name)) {
      await addTrack(full, key, base, result);
    }
  }
}

async function buildManifest(hexo) {
  const base = resolveInside(hexo.source_dir, "music");
  const result = {
    normal: [],
    cny: [],
    halloween: [],
    christmas: []
  };

  // base is resolved under the blog source
  if (fs.existsSync(base)) { // nosemgrep: javascript.lang.security.audit.detect-non-literal-fs-filename
    const entries = await fs.promises.readdir(base, { withFileTypes: true }); // nosemgrep: javascript.lang.security.audit.detect-non-literal-fs-filename
    for (const entry of entries) {
      if (isHidden(entry.name)) continue;
      const full = resolveInside(base, entry.name);
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

  const target = resolveInside(hexo.public_dir, "data", "music.json");
  // target is resolved under the blog public dir
  await fs.promises.mkdir(path.dirname(target), { recursive: true }); // nosemgrep: javascript.lang.security.audit.detect-non-literal-fs-filename
  await fs.promises.writeFile(target, JSON.stringify(manifest), "utf8"); // nosemgrep: javascript.lang.security.audit.detect-non-literal-fs-filename
  const counts = Object.keys(result)
    .map((key) => key + ":" + result[key].length)
    .join(" ");
  hexo.log.info("ALIST music manifest: " + counts);
}

hexo.extend.filter.register("after_generate", async function () {
  await buildManifest(hexo);
});
