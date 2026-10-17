(function () {
  "use strict";

  if (window.__alistFestivalLoaded) return;
  window.__alistFestivalLoaded = true;

  var now = new Date();
  var year = now.getFullYear();
  var month = now.getMonth() + 1;
  var day = now.getDate();
  var today = new Date(year, month - 1, day);
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
  var festival = null;

  function diffDays(a, b) {
    return Math.round((a.getTime() - b.getTime()) / 86400000);
  }

  for (var i = 0; i < cnyDates.length; i++) {
    var c = cnyDates[i];
    var delta = diffDays(today, new Date(c[0], c[1] - 1, c[2]));
    if (delta >= -7 && delta <= 15) {
      festival = "cny";
      break;
    }
  }

  if (!festival && ((month === 10 && day >= 25) || (month === 11 && day === 1))) {
    festival = "halloween";
  }
  if (!festival && month === 12 && day >= 20 && day <= 26) {
    festival = "christmas";
  }

  var override = new URLSearchParams(window.location.search).get("festival");
  if (override === "cny" || override === "halloween" || override === "christmas") {
    festival = override;
  }
  if (!festival) return;

  var layer = document.createElement("div");
  layer.id = "festival-layer";
  layer.setAttribute("aria-hidden", "true");
  document.body.appendChild(layer);

  if (festival === "cny") {
    var positions = [7, 22, 39, 56, 73, 88, 96];
    for (var j = 0; j < positions.length; j++) {
      var lantern = document.createElement("span");
      lantern.className = "festival-lantern";
      lantern.style.left = positions[j] + "%";
      lantern.style.setProperty("--lantern-delay", (j * 0.6 - 1.2).toFixed(2) + "s");
      lantern.style.setProperty("--lantern-scale", (0.72 + (j % 3) * 0.12).toFixed(2));
      lantern.innerHTML =
        '<i class="festival-lantern-cord"></i>' +
        '<b class="festival-lantern-cap"></b>' +
        '<b class="festival-lantern-body"></b>' +
        '<b class="festival-lantern-rib"></b>' +
        '<i class="festival-lantern-tassel"></i>';
      layer.appendChild(lantern);
    }
  }

  if (festival === "halloween") {
    var batSvg =
      '<svg viewBox="0 0 64 32" aria-hidden="true"><path d="M32 10c-5-8-16-10-28-4 6 4 8 10 4 17 9-4 17-4 24 2 7-6 15-6 24-2-4-7-2-13 4-17C44 0 37 2 32 10z"/></svg>';
    for (var k = 0; k < 9; k++) {
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

  if (festival === "christmas") {
    var snow = document.createElement("canvas");
    snow.id = "festival-snow";
    layer.appendChild(snow);
    var sctx = snow.getContext("2d");
    var flakes = [];
    var sw = 0;
    var sh = 0;

    function resizeSnow() {
      sw = window.innerWidth;
      sh = window.innerHeight;
      snow.width = sw;
      snow.height = sh;
      flakes = [];
      var count = Math.max(40, Math.min(140, Math.floor(sw / 14)));
      for (var f = 0; f < count; f++) {
        flakes.push({
          x: Math.random() * sw,
          y: Math.random() * sh,
          r: 1 + Math.random() * 2.2,
          vy: 0.35 + Math.random() * 0.9,
          vx: -0.25 + Math.random() * 0.5,
          a: 0.35 + Math.random() * 0.45
        });
      }
    }

    function drawSnow() {
      if (!sctx) return;
      sctx.clearRect(0, 0, sw, sh);
      for (var f = 0; f < flakes.length; f++) {
        var fl = flakes[f];
        sctx.beginPath();
        sctx.fillStyle = "rgba(241,245,249," + fl.a + ")";
        sctx.arc(fl.x, fl.y, fl.r, 0, Math.PI * 2);
        sctx.fill();
        fl.y += fl.vy;
        fl.x += fl.vx;
        if (fl.y > sh + 4) {
          fl.y = -4;
          fl.x = Math.random() * sw;
        }
        if (fl.x < -4) fl.x = sw + 4;
        if (fl.x > sw + 4) fl.x = -4;
      }
      requestAnimationFrame(drawSnow);
    }

    resizeSnow();
    window.addEventListener("resize", resizeSnow);
    drawSnow();
  }
})();
