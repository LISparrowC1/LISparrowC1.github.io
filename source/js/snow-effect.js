(function () {
  "use strict";

  if (window.innerWidth <= 768) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.createElement("canvas");
  canvas.id = "snowfall";
  canvas.setAttribute("aria-hidden", "true");
  var ctx = canvas.getContext("2d");
  var flakes = [];
  var count = 140;
  var mouseX = -100;
  var mouseY = -100;

  document.body.appendChild(canvas);

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function makeFlake() {
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 1 + Math.random() * 2.4,
      speed: 0.5 + Math.random() * 1.2,
      opacity: 0.25 + Math.random() * 0.55,
      step: Math.random() * Math.PI * 2,
      stepSize: 0.01 + Math.random() * 0.03,
      velX: 0,
      velY: 0
    };
  }

  function init() {
    resize();
    flakes = [];
    for (var i = 0; i < count; i++) flakes.push(makeFlake());
  }

  function snow() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < flakes.length; i++) {
      var flake = flakes[i];
      var dx = flake.x - mouseX;
      var dy = flake.y - mouseY;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var minDist = 100;

      if (dist < minDist && dist > 0) {
        var force = (minDist * 2) / (dist * dist);
        flake.velX += (dx / dist) * force * 0.5;
        flake.velY += (dy / dist) * force * 0.5;
      } else {
        flake.velX *= 0.28;
        if (flake.velY <= flake.speed) flake.velY = flake.speed;
        flake.velX += Math.cos((flake.step += 0.25)) * flake.stepSize;
      }

      flake.y += flake.velY;
      flake.x += flake.velX;

      if (flake.y > canvas.height + 8) {
        flake.y = -8;
        flake.x = Math.random() * canvas.width;
      }
      if (flake.x > canvas.width + 8) flake.x = -8;
      if (flake.x < -8) flake.x = canvas.width + 8;

      ctx.beginPath();
      ctx.arc(flake.x, flake.y, flake.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(196, 181, 253, " + flake.opacity + ")";
      ctx.fill();
    }

    requestAnimationFrame(snow);
  }

  document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener("mouseleave", function () {
    mouseX = -100;
    mouseY = -100;
  });

  window.addEventListener("resize", resize);

  init();
  snow();
})();
