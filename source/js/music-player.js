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

  var manifest = null;
  var audio = new Audio();
  var currentKey = "";
  var playing = false;
  var festival = document.documentElement.dataset.alistFestival || "none";

  audio.loop = true;
  audio.preload = "none";
  audio.volume = 0.5;

  var root = document.createElement("div");
  root.id = "alist-music";
  root.hidden = true;
  root.innerHTML =
    '<button id="alist-music-toggle" type="button" aria-label="播放音乐"><span class="alist-music-icon">▶</span></button>' +
    '<div class="alist-music-info"><strong id="alist-music-title">ALIST RADIO</strong><span id="alist-music-artist">音乐未导入</span></div>' +
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
    link.title = "音乐开关";
    link.setAttribute("aria-label", "音乐开关");
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
  mobileSwitch.setAttribute("aria-label", "音乐开关");
  mobileSwitch.innerHTML =
    '<div class="mobile-grid-item"><span class="alist-music-switch-icon">♪</span><span class="alist-music-switch-label">音乐</span></div>';
  var mobileMenu = document.querySelector("#mobile-grid-menu .mobile-grid-menu-inner");
  if (mobileMenu) mobileMenu.appendChild(mobileSwitch);

  function setSwitchState() {
    var nodes = [switchEl, mobileSwitch];
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i]) continue;
      nodes[i].classList.toggle("is-on", enabled);
      nodes[i].setAttribute("aria-pressed", enabled ? "true" : "false");
      nodes[i].title = enabled ? "音乐开关：开" : "音乐开关：关";
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
    playButton.setAttribute("aria-label", value ? "暂停音乐" : "播放音乐");
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
      titleEl.textContent = "ALIST RADIO";
      artistEl.textContent = "未找到音乐清单";
      setPlayable(false);
      return;
    }
    if (!force && currentKey === key && audio.getAttribute("src")) return;

    var track = manifest.tracks[key] || {};
    currentKey = key;
    titleEl.textContent = track.title || "ALIST RADIO";
    artistEl.textContent = track.artist || "未导入音乐";
    audio.pause();
    setPlayingState(false);

    if (track.src) {
      audio.src = track.src;
      audio.load();
      setPlayable(true);
      artistEl.textContent = track.artist || "ALIST RADIO";
    } else {
      audio.removeAttribute("src");
      audio.load();
      setPlayable(false);
      artistEl.textContent = "请把音乐放入 source/music 并填写 src";
    }
  }

  function applyEnabled(value) {
    enabled = !!value;
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
    } catch (error) {
      // Ignore storage failures (private mode).
    }
    root.hidden = !enabled;
    setSwitchState();
    if (!enabled) {
      audio.pause();
      setPlayingState(false);
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
  });
  audio.addEventListener("pause", function () {
    setPlayingState(false);
  });
  audio.addEventListener("error", function () {
    setPlayable(false);
    setPlayingState(false);
    artistEl.textContent = "音频未找到，请检查 src";
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

  fetch("/data/music.json", { cache: "no-store" })
    .then(function (response) {
      return response.ok ? response.json() : null;
    })
    .then(function (data) {
      if (!data || !data.tracks) {
        artistEl.textContent = "未找到 /data/music.json";
        setPlayable(false);
        return;
      }
      manifest = data;
      updateTrack(false);
    })
    .catch(function () {
      artistEl.textContent = "音乐清单加载失败";
      setPlayable(false);
    });

  setSwitchState();
  root.hidden = !enabled;
  if (enabled) updateTrack(false);
})();
