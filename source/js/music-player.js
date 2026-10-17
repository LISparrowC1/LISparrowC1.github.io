(function () {
  "use strict";

  if (window.__alistMusicLoaded) return;
  window.__alistMusicLoaded = true;

  var lang = localStorage.getItem("alist-lang") === "en" ? "en" : "zh";
  var enabled = false;
  var manifest = null;
  var playlist = [];
  var index = 0;
  var current = null;
  var festival = document.documentElement.dataset.alistFestival || "none";
  var lyrics = [];
  var lyricsActive = false;
  var lastLyric = "";

  var audio = new Audio();
  audio.preload = "metadata";
  audio.volume = 0.5;

  function tr(key) {
    var table = {
      zh: {
        none: "无",
        switch: "音乐开关",
        music: "音乐",
        play: "播放音乐",
        pause: "暂停音乐",
        prev: "上一首",
        next: "下一首"
      },
      en: {
        none: "None",
        switch: "Music",
        music: "Music",
        play: "Play music",
        pause: "Pause music",
        prev: "Previous track",
        next: "Next track"
      }
    };
    return table[lang][key] || table.zh[key] || key;
  }

  var root = document.createElement("div");
  root.id = "alist-music";
  root.hidden = true;
  root.innerHTML =
    '<button class="alist-music-skip" id="alist-music-prev" type="button" aria-label="' + tr("prev") + '">‹</button>' +
    '<button id="alist-music-toggle" type="button" aria-label="' + tr("play") + '"><span class="alist-music-icon">▶</span></button>' +
    '<button class="alist-music-skip" id="alist-music-next" type="button" aria-label="' + tr("next") + '">›</button>' +
    '<div class="alist-music-info"><strong id="alist-music-title">' + tr("none") + '</strong><span id="alist-music-artist">-</span></div>' +
    '<div class="alist-music-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
    '<input id="alist-music-volume" type="range" min="0" max="100" value="50" aria-label="Volume">';
  document.body.appendChild(root);

  var playButton = document.getElementById("alist-music-toggle");
  var icon = playButton.querySelector(".alist-music-icon");
  var prevButton = document.getElementById("alist-music-prev");
  var nextButton = document.getElementById("alist-music-next");
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
    tr("music") +
    "</span></div>";
  var mobileMenu = document.querySelector("#mobile-grid-menu .mobile-grid-menu-inner");
  if (mobileMenu) mobileMenu.appendChild(mobileSwitch);

  function setSwitchState() {
    var nodes = [switchEl, mobileSwitch];
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i]) continue;
      nodes[i].classList.toggle("is-on", enabled);
      nodes[i].setAttribute("aria-pressed", enabled ? "true" : "false");
      nodes[i].title = tr("switch");
      nodes[i].setAttribute("aria-label", tr("switch"));
    }
    var label = mobileSwitch.querySelector(".alist-music-switch-label");
    if (label) label.textContent = tr("music");
  }

  function setPlayable(value) {
    playButton.disabled = !value;
    root.classList.toggle("is-unavailable", !value);
  }

  function setSkippable(value) {
    prevButton.disabled = !value;
    nextButton.disabled = !value;
  }

  function setPlayingState(value) {
    root.classList.toggle("is-playing", value);
    icon.textContent = value ? "Ⅱ" : "▶";
    playButton.setAttribute("aria-label", tr(value ? "pause" : "play"));
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

  function noMusic() {
    playlist = [];
    index = 0;
    current = null;
    clearLyrics();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    setPlayingState(false);
    setPlayable(false);
    setSkippable(false);
    titleEl.textContent = tr("none");
    artistEl.textContent = "-";
  }

  function trackUnavailable() {
    setPlayingState(false);
    setPlayable(false);
    setSkippable(playlist.length > 1);
    clearLyrics();
    titleEl.textContent = tr("none");
    artistEl.textContent = "-";
    audio.pause();
  }

  function loadTrack(i, autoplay) {
    if (!playlist.length) {
      noMusic();
      return;
    }
    index = i;
    current = playlist[i];
    clearLyrics();
    audio.pause();
    setPlayingState(false);

    titleEl.textContent = current.title || tr("none");
    artistEl.textContent = current.artist || "-";

    if (!current.src) {
      trackUnavailable();
      return;
    }

    audio.src = current.src;
    audio.loop = playlist.length === 1;
    audio.load();
    setPlayable(true);
    setSkippable(playlist.length > 1);
    loadLyrics(current.lyrics);
    if (autoplay) play();
  }

  function folderKey() {
    if (
      festival !== "none" &&
      manifest &&
      manifest.tracks[festival] &&
      manifest.tracks[festival].length
    ) {
      return festival;
    }
    return "normal";
  }

  function setPlaylist(force) {
    if (!manifest || !manifest.tracks) {
      noMusic();
      return;
    }
    var key = folderKey();
    var list = manifest.tracks[key] || [];
    if (!list.length) list = manifest.tracks.normal || [];
    if (!list.length) {
      noMusic();
      return;
    }
    playlist = list;
    if (force) index = 0;
    if (index >= playlist.length) index = 0;
    loadTrack(index, false);
  }

  function play() {
    if (!current || !current.src) return;
    var result = audio.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        setPlayingState(false);
      });
    }
  }

  function nextTrack() {
    if (playlist.length < 2) return;
    var wasPlaying = !audio.paused;
    loadTrack((index + 1) % playlist.length, wasPlaying);
  }

  function prevTrack() {
    if (playlist.length < 2) return;
    var wasPlaying = !audio.paused;
    loadTrack((index - 1 + playlist.length) % playlist.length, wasPlaying);
  }

  function applyEnabled(value) {
    enabled = !!value;
    root.hidden = !enabled;
    setSwitchState();
    if (!enabled) {
      audio.pause();
      setPlayingState(false);
      clearLyrics();
    } else if (!current) {
      setPlaylist(false);
    }
  }

  playButton.addEventListener("click", function () {
    if (!enabled) return;
    if (audio.paused) play();
    else audio.pause();
  });
  prevButton.addEventListener("click", prevTrack);
  nextButton.addEventListener("click", nextTrack);
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
  audio.addEventListener("ended", function () {
    if (playlist.length > 1) nextTrack();
  });
  audio.addEventListener("error", function () {
    if (current) trackUnavailable();
  });

  window.addEventListener("alist:festival", function (event) {
    var next = event.detail || "none";
    if (next === festival) return;
    festival = next;
    if (!manifest) return;
    var wasPlaying = !audio.paused;
    setPlaylist(true);
    if (wasPlaying && enabled && current) play();
  });

  window.addEventListener("alist:lang", function (event) {
    lang = event.detail === "en" ? "en" : "zh";
    setSwitchState();
    if (!current) {
      titleEl.textContent = tr("none");
      artistEl.textContent = "-";
    } else {
      titleEl.textContent = current.title || tr("none");
      artistEl.textContent = current.artist || "-";
    }
    setPlayingState(!audio.paused);
    if (lyricsActive) dispatchLyrics(true, lastLyric);
  });

  fetch("/data/music.json", { cache: "no-store" })
    .then(function (response) {
      return response.ok ? response.json() : null;
    })
    .then(function (data) {
      if (!data || !data.tracks) {
        noMusic();
        return;
      }
      manifest = data;
      setPlaylist(false);
    })
    .catch(function () {
      noMusic();
    });

  setSwitchState();
  root.hidden = !enabled;
  setSkippable(false);
})();
