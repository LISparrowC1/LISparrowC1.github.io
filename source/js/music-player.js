(function () {
  "use strict";

  if (window.__alistMusicLoaded) return;
  window.__alistMusicLoaded = true;

  var STORAGE_KEY = "alist-music-enabled";
  var enabled = false;
  try {
    enabled = localStorage.getItem(STORAGE_KEY) === "1";
  } catch (error) {
    enabled = false;
  }

  var lang = localStorage.getItem("alist-lang") === "en" ? "en" : "zh";
  var manifest = null;
  var audio = new Audio();
  var currentKey = "";
  var playing = false;
  var festival = document.documentElement.dataset.alistFestival || "none";
  var lyrics = [];
  var lyricsActive = false;
  var lastLyric = "";

  audio.loop = true;
  audio.preload = "none";
  audio.volume = 0.5;

  function tr(key) {
    if (key === "noMusic") return lang === "en" ? "No music" : "无音乐";
    if (key === "switch") return lang === "en" ? "Music" : "音乐开关";
    if (key === "play") return lang === "en" ? "Play music" : "播放音乐";
    if (key === "pause") return lang === "en" ? "Pause music" : "暂停音乐";
    return key;
  }

  var root = document.createElement("div");
  root.id = "alist-music";
  root.hidden = true;
  root.innerHTML =
    '<button id="alist-music-toggle" type="button" aria-label="播放音乐"><span class="alist-music-icon">▶</span></button>' +
    '<div class="alist-music-info"><strong id="alist-music-title">ALIST RADIO</strong><span id="alist-music-artist">无音乐</span></div>' +
    '<div class="alist-music-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
    '<input id="alist-music-volume" type="range" min="0" max="100" value="50" aria-label="音量">';
  document.body.appendChild(root);

  var playButton = document.getElementById("alist-music-toggle");
  var icon = playButton.querySelector(".alist-music-icon");
  var titleEl = document.getElementById("alist-music-title");
  var artistEl = document.getElementById("alist-music-artist");
  var volume = document.getElementById("alist-music-volume");

  var switchEl = null;
  var nav = document.querySelector("#navbar .navbar-nav");
  if (nav) {
    var item = document.createElement("li");
    item.className = "nav-item alist-music-switch-item";
    var link = document.createElement("a");
    link.className = "nav-link";
    link.id = "alist-music-switch";
    link.href = "javascript:;";
    link.title = tr("switch");
    link.setAttribute("aria-label", tr("switch"));
    link.setAttribute("aria-pressed", "false");
    link.innerHTML = '<span class="alist-music-switch-icon">♪</span>';
    item.appendChild(link);
    var searchItem = nav.querySelector("#search-btn");
    nav.insertBefore(item, searchItem || null);
    switchEl = link;
  }

  var mobileSwitch = document.createElement("a");
  mobileSwitch.href = "javascript:;";
  mobileSwitch.className = "alist-music-switch-mobile";
  mobileSwitch.setAttribute("aria-label", tr("switch"));
  mobileSwitch.innerHTML =
    '<div class="mobile-grid-item"><span class="alist-music-switch-icon">♪</span><span class="alist-music-switch-label">' +
    (lang === "en" ? "Music" : "音乐") +
    "</span></div>";
  var mobileMenu = document.querySelector("#mobile-grid-menu .mobile-grid-menu-inner");
  if (mobileMenu) mobileMenu.appendChild(mobileSwitch);

  function trackText(track, field) {
    if (!track) return "";
    if (lang === "en" && track[field + "En"]) return track[field + "En"];
    return track[field] || "";
  }

  function dispatchLyrics(active, text) {
    lyricsActive = active;
    try {
      window.dispatchEvent(new CustomEvent("alist:lyrics", { detail: { active: active, text: text || "" } }));
    } catch (error) {
      // Ignore environments without CustomEvent.
    }
  }

  function clearLyrics() {
    lyrics = [];
    lastLyric = "";
    if (lyricsActive) dispatchLyrics(false, "");
  }

  function parseLrc(text) {
    var parsed = [];
    var lines = String(text || "").split(/\r?\n/);
    for (var i = 0; i < lines.length; i++) {
      var match = lines[i].match(/^\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\](.*)$/);
      if (!match) continue;
      var minute = parseInt(match[1], 10);
      var second = parseInt(match[2], 10);
      var fraction = match[3] ? parseInt(match[3], 10) / Math.pow(10, match[3].length) : 0;
      var body = match[4].replace(/\s+/g, " ").trim();
      if (!body) continue;
      parsed.push({ time: minute * 60 + second + fraction, text: body });
    }
    parsed.sort(function (a, b) {
      return a.time - b.time;
    });
    lyrics = parsed;
  }

  function loadLyrics(url) {
    lyrics = [];
    lastLyric = "";
    if (!url) return;
    fetch(url, { cache: "no-store" })
      .then(function (response) {
        return response.ok ? response.text() : "";
      })
      .then(function (text) {
        if (text) parseLrc(text);
      })
      .catch(function () {});
  }

  function syncLyrics() {
    if (!lyrics.length) return;
    var time = audio.currentTime;
    var line = "";
    for (var i = 0; i < lyrics.length; i++) {
      if (lyrics[i].time <= time) line = lyrics[i].text;
      else break;
    }
    if (line !== lastLyric) {
      lastLyric = line;
      dispatchLyrics(true, line);
    }
  }

  function showNoMusic() {
    titleEl.textContent = "ALIST RADIO";
    artistEl.textContent = tr("noMusic");
    setPlayable(false);
    clearLyrics();
  }

  function setSwitchState() {
    var nodes = [switchEl, mobileSwitch];
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i]) continue;
      nodes[i].classList.toggle("is-on", enabled);
      nodes[i].setAttribute("aria-pressed", enabled ? "true" : "false");
      nodes[i].title = tr("switch");
      nodes[i].setAttribute("aria-label", tr("switch"));
    }
  }

  function setPlayable(canPlay) {
    playButton.disabled = !canPlay;
    root.classList.toggle("is-unavailable", !canPlay);
  }

  function setPlayingState(value) {
    playing = value;
    root.classList.toggle("is-playing", value);
    icon.textContent = value ? "Ⅱ" : "▶";
    playButton.setAttribute("aria-label", tr(value ? "pause" : "play"));
  }

  function trackKey() {
    if (!manifest) return "";
    var fallback = manifest.default || "daily";
    if (festival !== "none" && manifest.tracks && manifest.tracks[festival]) return festival;
    if (manifest.tracks && manifest.tracks[fallback]) return fallback;
    return Object.keys(manifest.tracks || {})[0] || "";
  }

  function updateTrack(force) {
    var key = trackKey();
    if (!key) {
      currentKey = "";
      showNoMusic();
      return;
    }

    var track = manifest.tracks[key] || {};
    currentKey = key;
    titleEl.textContent = trackText(track, "title") || "ALIST RADIO";
    artistEl.textContent = trackText(track, "artist") || "ALIST RADIO";
    clearLyrics();
    audio.pause();
    setPlayingState(false);

    if (!track.src) {
      showNoMusic();
      return;
    }

    if (force || audio.getAttribute("src") !== track.src) {
      audio.src = track.src;
      audio.load();
    }
    setPlayable(true);
    loadLyrics(track.lyrics);
  }

  function applyEnabled(value) {
    enabled = !!value;
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    } catch (error) {
      // Ignore storage failures.
    }
    root.hidden = !enabled;
    setSwitchState();
    if (!enabled) {
      audio.pause();
      setPlayingState(false);
      clearLyrics();
    } else {
      updateTrack(false);
    }
  }

  function togglePlay() {
    if (!enabled || !audio.getAttribute("src")) return;
    if (audio.paused) {
      var result = audio.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          setPlayingState(false);
        });
      }
    } else {
      audio.pause();
    }
  }

  playButton.addEventListener("click", togglePlay);

  if (switchEl) {
    switchEl.addEventListener("click", function () {
      applyEnabled(!enabled);
    });
  }
  mobileSwitch.addEventListener("click", function () {
    applyEnabled(!enabled);
  });

  volume.addEventListener("input", function () {
    audio.volume = Number(volume.value) / 100;
  });

  audio.addEventListener("play", function () {
    setPlayingState(true);
    if (lyrics.length) {
      lyricsActive = true;
      syncLyrics();
    }
  });
  audio.addEventListener("timeupdate", function () {
    if (lyrics.length) syncLyrics();
  });
  audio.addEventListener("pause", function () {
    setPlayingState(false);
    if (lyricsActive) dispatchLyrics(false, "");
  });
  audio.addEventListener("error", function () {
    setPlayingState(false);
    showNoMusic();
  });

  window.addEventListener("alist:festival", function (event) {
    var next = event.detail || "none";
    if (next === festival) return;
    festival = next;
    var wasPlaying = !audio.paused;
    audio.pause();
    updateTrack(true);
    if (wasPlaying && enabled && audio.getAttribute("src")) {
      var result = audio.play();
      if (result && typeof result.catch === "function") result.catch(function () {});
    }
  });

  window.addEventListener("alist:lang", function (event) {
    lang = event.detail === "en" ? "en" : "zh";
    setSwitchState();
    if (currentKey && manifest && manifest.tracks && manifest.tracks[currentKey] && manifest.tracks[currentKey].src) {
      var track = manifest.tracks[currentKey];
      titleEl.textContent = trackText(track, "title");
      artistEl.textContent = trackText(track, "artist");
    } else {
      showNoMusic();
    }
    var mobileLabel = mobileSwitch.querySelector(".alist-music-switch-label");
    if (mobileLabel) mobileLabel.textContent = lang === "en" ? "Music" : "音乐";
    if (lyricsActive) dispatchLyrics(true, lastLyric);
  });

  fetch("/data/music.json", { cache: "no-store" })
    .then(function (response) {
      return response.ok ? response.json() : null;
    })
    .then(function (data) {
      if (!data || !data.tracks) {
        showNoMusic();
        return;
      }
      manifest = data;
      updateTrack(false);
    })
    .catch(function () {
      showNoMusic();
    });

  setSwitchState();
  root.hidden = !enabled;
  if (enabled) updateTrack(false);
})();
