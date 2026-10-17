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

  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    var t = now / 1000;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var alpha = s.base + Math.sin(t * s.speed + s.phase) * s.amp;
      if (alpha < 0.05) alpha = 0.05;
      ctx.beginPath();
      ctx.fillStyle = "rgba(" + s.color + "," + alpha.toFixed(3) + ")";
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
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
