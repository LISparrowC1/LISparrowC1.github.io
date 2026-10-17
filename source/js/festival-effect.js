(function () {
  "use strict";

  if (window.__alistFestivalLoaded) return;
  window.__alistFestivalLoaded = true;

  var cnyDates = [
    [2025, 1, 29],
    [2026, 2, 17],
    [2027, 2, 6],
    [2028, 1, 26],
    [2029, 2, 13],
    [2030, 2, 3],
    [2031, 1, 23],
    [2032, 2, 11],
    [2033, 1, 31],
    [2034, 2, 19],
    [2035, 2, 8]
  ];
  var layer = null;
  var current = "none";
  var snowRaf = 0;
  var snowResize = null;

  function diffDays(a, b) {
    return Math.round((a.getTime() - b.getTime()) / 86400000);
  }

  function dateFestival() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var today = new Date(year, month - 1, day);

    for (var i = 0; i < cnyDates.length; i++) {
      var c = cnyDates[i];
      var delta = diffDays(today, new Date(c[0], c[1] - 1, c[2]));
      if (delta >= -7 && delta <= 15) return "cny";
    }
    if ((month === 10 && day >= 25) || (month === 11 && day === 1)) return "halloween";
    if (month === 12 && day >= 20 && day <= 26) return "christmas";
    return "none";
  }

  function setMeta(type) {
    current = type || "none";
    document.documentElement.dataset.alistFestival = current;
    try {
      window.dispatchEvent(new CustomEvent("alist:festival", { detail: current }));
    } catch (error) {
      // Ignore environments without CustomEvent.
    }
  }

  function clearSnow() {
    if (snowRaf) cancelAnimationFrame(snowRaf);
    snowRaf = 0;
    if (snowResize) {
      window.removeEventListener("resize", snowResize);
      snowResize = null;
    }
  }

  function hideFestival() {
    clearSnow();
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
    layer = null;
    setMeta("none");
  }

  function createLanterns() {
    var positions = [7, 22, 39, 56, 73, 88, 96];
    for (var i = 0; i < positions.length; i++) {
      var lantern = document.createElement("span");
      lantern.className = "festival-lantern";
      lantern.style.left = positions[i] + "%";
      lantern.style.setProperty("--lantern-delay", (i * 0.6 - 1.2).toFixed(2) + "s");
      lantern.style.setProperty("--lantern-scale", (0.72 + (i % 3) * 0.12).toFixed(2));
      lantern.innerHTML =
        '<i class="festival-lantern-cord"></i>' +
        '<b class="festival-lantern-cap"></b>' +
        '<b class="festival-lantern-body"></b>' +
        '<b class="festival-lantern-rib"></b>' +
        '<i class="festival-lantern-tassel"></i>';
      layer.appendChild(lantern);
    }
  }

  function createBats() {
    var batSvg =
      '<svg viewBox="0 0 64 32" aria-hidden="true"><path d="M32 10c-5-8-16-10-28-4 6 4 8 10 4 17 9-4 17-4 24 2 7-6 15-6 24-2-4-7-2-13 4-17C44 0 37 2 32 10z"/></svg>';
    for (var i = 0; i < 9; i++) {
      var bat = document.createElement("span");
      bat.className = "festival-bat";
      bat.style.top = 8 + Math.random() * 64 + "%";
      bat.style.animationDuration = (12 + Math.random() * 12).toFixed(1) + "s";
      bat.style.animationDelay = (-Math.random() * 18).toFixed(1) + "s";
      bat.style.setProperty("--bat-scale", (0.45 + Math.random() * 0.75).toFixed(2));
      bat.innerHTML = batSvg;
      layer.appendChild(bat);
    }
  }

  function createSnow() {
    var snow = document.createElement("canvas");
    snow.id = "festival-snow";
    layer.appendChild(snow);
    var sctx = snow.getContext("2d");
    var flakes = [];
    var sw = 0;
    var sh = 0;

    snowResize = function () {
      sw = window.innerWidth;
      sh = window.innerHeight;
      snow.width = sw;
      snow.height = sh;
      flakes = [];
      var count = Math.max(40, Math.min(140, Math.floor(sw / 14)));
      for (var i = 0; i < count; i++) {
        flakes.push({
          x: Math.random() * sw,
          y: Math.random() * sh,
          r: 1 + Math.random() * 2.2,
          vy: 0.35 + Math.random() * 0.9,
          vx: -0.25 + Math.random() * 0.5,
          a: 0.35 + Math.random() * 0.45
        });
      }
    };

    function drawSnow() {
      if (!sctx || !layer) return;
      sctx.clearRect(0, 0, sw, sh);
      for (var i = 0; i < flakes.length; i++) {
        var flake = flakes[i];
        sctx.beginPath();
        sctx.fillStyle = "rgba(241,245,249," + flake.a + ")";
        sctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
        sctx.fill();
        flake.y += flake.vy;
        flake.x += flake.vx;
        if (flake.y > sh + 4) {
          flake.y = -4;
          flake.x = Math.random() * sw;
        }
        if (flake.x < -4) flake.x = sw + 4;
        if (flake.x > sw + 4) flake.x = -4;
      }
      snowRaf = requestAnimationFrame(drawSnow);
    }

    snowResize();
    window.addEventListener("resize", snowResize);
    drawSnow();
  }

  function showFestival(type) {
    if (type !== "cny" && type !== "halloween" && type !== "christmas") {
      hideFestival();
      return;
    }

    clearSnow();
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
    layer = document.createElement("div");
    layer.id = "festival-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    if (type === "cny") createLanterns();
    if (type === "halloween") createBats();
    if (type === "christmas") {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) createSnow();
    }
    setMeta(type);
  }

  var seq = "";
  document.addEventListener("keydown", function (event) {
    if (document.body.classList.contains("snake-playing")) return;
    var target = event.target;
    if (target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName || "") || target.isContentEditable)) return;
    if (!event.key || event.key.length !== 1) return;

    seq = (seq + event.key.toLowerCase()).slice(-14);
    if (seq.indexOf("festivaloff") !== -1 || seq.indexOf("nofestival") !== -1) {
      seq = "";
      hideFestival();
      return;
    }
    if (seq.indexOf("halloween") !== -1) {
      seq = "";
      showFestival("halloween");
      return;
    }
    if (seq.indexOf("christmas") !== -1) {
      seq = "";
      showFestival("christmas");
      return;
    }
    if (seq.indexOf("cny") !== -1 || seq.indexOf("chunjie") !== -1 || seq.indexOf("lantern") !== -1) {
      seq = "";
      showFestival("cny");
      return;
    }
    if (seq.indexOf("festival") !== -1) {
      seq = "";
      if (current === "cny") showFestival("halloween");
      else if (current === "halloween") showFestival("christmas");
      else showFestival("cny");
    }
  });

  var query = new URLSearchParams(window.location.search).get("festival");
  if (query === "cny" || query === "halloween" || query === "christmas") {
    showFestival(query);
  } else {
    var initial = dateFestival();
    if (initial !== "none") showFestival(initial);
    else setMeta("none");
  }
})();
