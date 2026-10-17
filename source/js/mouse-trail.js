(function () {
  "use strict";

  if (window.matchMedia("(pointer: coarse)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.createElement("canvas");
  canvas.id = "rainbow-trail";
  canvas.setAttribute("aria-hidden", "true");
  var ctx = canvas.getContext("2d");
  var points = [];
  var maxPoints = 32;
  var hue = 0;

  document.body.appendChild(canvas);

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  document.addEventListener("mousemove", function (e) {
    points.push({
      x: e.clientX,
      y: e.clientY,
      hue: hue,
      life: 1
    });

    if (points.length > maxPoints) points.shift();
    hue = (hue + 3) % 360;
  });

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      var size = (i / points.length) * 5 + 1.5;
      p.life -= 0.025;

      if (p.life <= 0) {
        points.splice(i, 1);
        i--;
        continue;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fillStyle = "hsla(" + p.hue + ", 100%, 70%, " + p.life * 0.8 + ")";
      ctx.shadowBlur = 10;
      ctx.shadowColor = "hsla(" + p.hue + ", 100%, 70%, " + p.life * 0.8 + ")";
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(animate);
  }

  animate();
})();
