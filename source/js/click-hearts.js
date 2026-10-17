(function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var colors = ["#ff6b81", "#ff4757", "#ff6b9d", "#c44569", "#e66767", "#f8a5c2", "#f78fb3"];

  function spawnHeart(x, y) {
    var size = 12 + Math.random() * 16;
    var offsetX = (Math.random() - 0.5) * 90;
    var rot = (Math.random() - 0.5) * 50;
    var color = colors[Math.floor(Math.random() * colors.length)];

    var heart = document.createElement("div");
    heart.className = "click-heart";
    heart.style.left = x + "px";
    heart.style.top = y + "px";
    heart.style.width = size + "px";
    heart.style.height = size + "px";
    heart.style.setProperty("--dx", offsetX + "px");
    heart.style.setProperty("--rot", rot + "deg");
    heart.innerHTML =
      '<svg viewBox="0 0 32 32" width="' +
      size +
      '" height="' +
      size +
      '"><path fill="' +
      color +
      '" d="M16 28C16 28 2 20.4 2 10.4C2 5.6 5.6 2 10.4 2C13.2 2 15.2 3.6 16 5C16.8 3.6 18.8 2 21.6 2C26.4 2 30 5.6 30 10.4C30 20.4 16 28 16 28Z"/></svg>';

    document.body.appendChild(heart);

    heart.addEventListener("animationend", function () {
      heart.remove();
    });

    setTimeout(function () {
      if (heart.parentNode) heart.remove();
    }, 2000);
  }

  document.addEventListener("click", function (e) {
    if (e.button !== 0) return;
    if (!e.target || !e.target.closest) return;
    if (e.target.closest("input, textarea, select, #asteroids-overlay")) return;

    var n = 3 + Math.floor(Math.random() * 3);
    for (var i = 0; i < n; i++) {
      (function (k) {
        setTimeout(function () {
          spawnHeart(e.clientX, e.clientY);
        }, k * 40);
      })(i);
    }
  });
})();
