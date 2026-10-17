(function () {
  "use strict";

  if (window.__alistBackgroundLoaded) return;
  window.__alistBackgroundLoaded = true;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var aurora = document.getElementById("alist-aurora");
  if (!aurora) {
    aurora = document.createElement("div");
    aurora.id = "alist-aurora";
    aurora.setAttribute("aria-hidden", "true");
    document.body.insertBefore(aurora, document.body.firstChild);
  }

  var canvas = document.getElementById("alist-starfield");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "alist-starfield";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
  }

  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var dpr = 1;
  var w = 0;
  var h = 0;
  var stars = [];
  var ripples = [];
  var raf = 0;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var count = Math.max(100, Math.min(260, Math.floor((w * h) / 9000)));
    stars = [];
    for (var i = 0; i < count; i++) {
      var violet = Math.random() > 0.72;
      var cyan = !violet && Math.random() > 0.55;
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.6 + Math.random() * 1.7,
        base: 0.26 + Math.random() * 0.5,
        amp: 0.14 + Math.random() * 0.32,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.9,
        color: violet ? "196,181,253" : cyan ? "125,211,252" : "241,245,249"
      });
    }
  }

  function addRipple(x, y) {
    ripples.push({ x: x, y: y, t: performance.now() });
    if (ripples.length > 5) ripples.shift();
  }

  document.addEventListener(
    "click",
    function (event) {
      if (event.button !== 0) return;
      var target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("#snake-layer, #alist-music, #alist-music-switch, .alist-music-switch-mobile, input, textarea, select, option")) return;
      addRipple(event.clientX, event.clientY);
    },
    true
  );

  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    var t = now / 1000;

    for (var i = ripples.length - 1; i >= 0; i--) {
      if ((now - ripples[i].t) / 1000 > 2.8) ripples.splice(i, 1);
    }

    for (var s = 0; s < stars.length; s++) {
      var star = stars[s];
      var sx = star.x;
      var sy = star.y;
      for (var r = 0; r < ripples.length; r++) {
        var ripple = ripples[r];
        var age = (now - ripple.t) / 1000;
        if (age < 0 || age > 2.8) continue;
        var dx = star.x - ripple.x;
        var dy = star.y - ripple.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist > 620) continue;
        var decay = Math.exp(-dist / 280) * Math.exp(-age * 1.15);
        var wave = Math.sin(dist * 0.055 - age * 7.5) * decay * 13;
        sx += (dx / dist) * wave;
        sy += (dy / dist) * wave;
      }

      var alpha = star.base + Math.sin(t * star.speed + star.phase) * star.amp;
      if (alpha < 0.05) alpha = 0.05;
      ctx.beginPath();
      ctx.fillStyle = "rgba(" + star.color + "," + alpha.toFixed(3) + ")";
      ctx.arc(sx, sy, star.r, 0, Math.PI * 2);
      ctx.fill();
    }

    for (var k = 0; k < ripples.length; k++) {
      var rp = ripples[k];
      var ra = (now - rp.t) / 1000;
      if (ra < 0 || ra > 2.8) continue;
      var radius = ra * 190;
      var fade = (1 - ra / 2.8) * 0.2;
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(125,211,252," + fade.toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(196,181,253," + (fade * 0.72).toFixed(3) + ")";
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, radius + 10, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function frame(now) {
    draw(now);
    raf = requestAnimationFrame(frame);
  }

  resize();
  window.addEventListener("resize", resize);

  if (reduced) {
    draw(0);
  } else {
    raf = requestAnimationFrame(frame);
  }
})();
