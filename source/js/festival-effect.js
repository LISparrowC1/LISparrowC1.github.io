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
  var fireworksRaf = 0;
  var fireworksResize = null;
  var batsTimer = 0;

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

  function clearEffects() {
    if (snowRaf) cancelAnimationFrame(snowRaf);
    snowRaf = 0;
    if (snowResize) {
      window.removeEventListener("resize", snowResize);
      snowResize = null;
    }
    if (fireworksRaf) cancelAnimationFrame(fireworksRaf);
    fireworksRaf = 0;
    if (fireworksResize) {
      window.removeEventListener("resize", fireworksResize);
      fireworksResize = null;
    }
    if (batsTimer) clearTimeout(batsTimer);
    batsTimer = 0;
  }

  function hideFestival() {
    clearEffects();
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
    layer = null;
    setMeta("none");
  }

  function createLanterns() {
    var positions = [6, 18];
    for (var i = 0; i < positions.length; i++) {
      var lantern = document.createElement("span");
      lantern.className = "festival-lantern";
      lantern.style.left = positions[i] + "%";
      lantern.style.setProperty("--lantern-delay", (i === 0 ? -1.1 : -2.2) + "s");
      lantern.style.setProperty("--lantern-scale", i === 0 ? "0.92" : "1");
      lantern.innerHTML =
        '<i class="festival-lantern-cord"></i>' +
        '<b class="festival-lantern-cap"></b>' +
        '<b class="festival-lantern-body"></b>' +
        '<b class="festival-lantern-rib"></b>' +
        '<i class="festival-lantern-tassel"></i>';
      layer.appendChild(lantern);
    }
  }

  function createFireworks() {
    var canvas = document.createElement("canvas");
    canvas.id = "festival-fireworks";
    layer.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0;
    var h = 0;
    var particles = [];
    var rockets = [];
    var lastLaunch = 0;
    var colors = ["#fbbf24", "#f87171", "#f472b6", "#38bdf8", "#c4b5fd", "#fef3c7"];

    fireworksResize = function () {
      w = Math.min(window.innerWidth * 0.5, 640);
      h = Math.min(window.innerHeight * 0.62, 580);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    function burst(x, y) {
      var count = 42 + Math.floor(Math.random() * 26);
      var color = colors[Math.floor(Math.random() * colors.length)];
      for (var i = 0; i < count; i++) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 0.8 + Math.random() * 3.2;
        particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.007 + Math.random() * 0.011,
          size: 1 + Math.random() * 2,
          color: Math.random() < 0.72 ? color : colors[Math.floor(Math.random() * colors.length)]
        });
      }
    }

    function launch() {
      var targetX = w * (0.12 + Math.random() * 0.32);
      var targetY = h * (0.08 + Math.random() * 0.26);
      rockets.push({
        x: targetX + (Math.random() - 0.5) * w * 0.08,
        y: h * 1.04,
        targetX: targetX,
        targetY: targetY,
        vy: -(6 + Math.random() * 3),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    function frame(now) {
      if (!ctx || !layer) return;
      ctx.clearRect(0, 0, w, h);
      if (!lastLaunch || now - lastLaunch > 1000) {
        lastLaunch = now;
        launch();
      }

      for (var r = rockets.length - 1; r >= 0; r--) {
        var rocket = rockets[r];
        rocket.y += rocket.vy;
        ctx.globalAlpha = 0.9;
        ctx.strokeStyle = rocket.color;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(rocket.x, rocket.y + 20);
        ctx.lineTo(rocket.x, rocket.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fef3c7";
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        if (rocket.y <= rocket.targetY) {
          burst(rocket.targetX, rocket.targetY);
          rockets.splice(r, 1);
        }
      }

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.028;
        p.vx *= 0.985;
        p.life -= p.decay;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = Math.max(0, p.life * 0.32);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2.4, p.y - p.vy * 2.4);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      fireworksRaf = requestAnimationFrame(frame);
    }

    fireworksResize();
    window.addEventListener("resize", fireworksResize);
    burst(w * 0.18, h * 0.2);
    burst(w * 0.34, h * 0.34);
    fireworksRaf = requestAnimationFrame(frame);
  }

  function createBats() {
    var batSvg =
      '<svg viewBox="0 0 72 36" aria-hidden="true">' +
      '<g class="festival-bat-wing festival-bat-wing-left">' +
      '<path d="M35 18 C27 8 16 3 2 7 C8 11 11 16 9 22 C11 21 14 20 17 20 C23 15 29 17 35 18 Z"/>' +
      "</g>" +
      '<g class="festival-bat-wing festival-bat-wing-right">' +
      '<path d="M37 18 C45 8 56 3 70 7 C64 11 61 16 63 22 C61 21 58 20 55 20 C49 15 43 17 37 18 Z"/>' +
      "</g>" +
      '<ellipse class="festival-bat-body" cx="36" cy="19" rx="5" ry="4"/>' +
      '<path class="festival-bat-ear" d="M32 15 L30 9 L36 14 Z"/>' +
      '<path class="festival-bat-ear" d="M40 15 L42 9 L36 14 Z"/>' +
      '<circle class="festival-bat-eye" cx="34" cy="18.5" r="1"/>' +
      '<circle class="festival-bat-eye" cx="38" cy="18.5" r="1"/>' +
      "</svg>";

    for (var i = 0; i < 12; i++) {
      var left = i % 2 === 0;
      var bat = document.createElement("span");
      bat.className = "festival-bat " + (left ? "from-left" : "from-right");
      bat.style.setProperty("--bat-delay", (Math.random() * 0.18).toFixed(2) + "s");
      bat.style.setProperty("--bat-x", (left ? 55 + Math.random() * 25 : -(55 + Math.random() * 25)).toFixed(1) + "vw");
      bat.style.setProperty("--bat-y", (-68 - Math.random() * 30).toFixed(1) + "vh");
      bat.style.setProperty("--bat-rot", (left ? 24 : -24) + Math.random() * 10 + "deg");
      bat.style.setProperty("--bat-scale", (0.6 + Math.random() * 0.65).toFixed(2));
      bat.innerHTML = batSvg;
      layer.appendChild(bat);
    }

    batsTimer = setTimeout(function () {
      if (!layer) return;
      var bats = layer.querySelectorAll(".festival-bat");
      for (var j = 0; j < bats.length; j++) {
        if (bats[j].parentNode) bats[j].parentNode.removeChild(bats[j]);
      }
    }, 2300);
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

    clearEffects();
    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
    layer = document.createElement("div");
    layer.id = "festival-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (type === "cny") {
      createLanterns();
      createFireworks();
    }
    if (type === "halloween") {
      createBats();
    }
    if (type === "christmas") {
      if (!reduced) createSnow();
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
