(function () {
  "use strict";

  var overlay = document.getElementById("alist-loader");
  var canvas = document.getElementById("alist-binary");
  if (!overlay || !canvas) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    overlay.remove();
    return;
  }

  var ctx = canvas.getContext("2d");
  var chars = "01";
  var fontSize = 16;
  var columns = 0;
  var drops = [];
  var raf = 0;
  var done = false;
  var started = performance.now();
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    var w = window.innerWidth;
    var h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    columns = Math.ceil(w / fontSize);
    drops = [];
    for (var i = 0; i < columns; i++) {
      drops[i] = Math.random() * (h / fontSize);
    }
    ctx.fillStyle = "#05050a";
    ctx.fillRect(0, 0, w, h);
  }

  function frame() {
    if (done) return;

    var w = window.innerWidth;
    var h = window.innerHeight;

    ctx.fillStyle = "rgba(5, 5, 10, 0.16)";
    ctx.fillRect(0, 0, w, h);
    ctx.font = fontSize + 'px "Consolas", "Courier New", monospace';

    for (var i = 0; i < columns; i++) {
      var text = chars.charAt(Math.floor(Math.random() * chars.length));
      var x = i * fontSize;
      var y = drops[i] * fontSize;
      var bright = Math.random() < 0.06;

      ctx.fillStyle = bright
        ? "rgba(56, 189, 248, 0.95)"
        : "rgba(139, 92, 246, " + (0.35 + Math.random() * 0.55) + ")";
      ctx.fillText(text, x, y);

      if (y > h && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.75 + Math.random() * 0.55;
    }

    raf = requestAnimationFrame(frame);
  }

  function hide() {
    if (done) return;
    done = true;
    if (raf) cancelAnimationFrame(raf);
    overlay.classList.add("is-hidden");
    setTimeout(function () {
      if (overlay.parentNode) overlay.remove();
    }, 650);
  }

  function scheduleHide() {
    var elapsed = performance.now() - started;
    setTimeout(hide, Math.max(0, 900 - elapsed));
  }

  resize();
  window.addEventListener("resize", resize);
  frame();

  if (document.readyState === "complete") {
    scheduleHide();
  } else {
    window.addEventListener("load", scheduleHide, { once: true });
  }

  setTimeout(hide, 6000);
})();
