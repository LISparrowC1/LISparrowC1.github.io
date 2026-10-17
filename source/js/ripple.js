(function () {
  "use strict";

  if (window.__alistRippleLoaded) return;
  window.__alistRippleLoaded = true;

  document.addEventListener(
    "click",
    function (event) {
      if (event.button !== 0) return;
      var target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("#snake-layer, #alist-music, input, textarea, select, option")) return;
      if (!event.clientX && !event.clientY) return;

      var ripple = document.createElement("span");
      ripple.className = "alist-ripple";
      ripple.style.left = event.clientX + "px";
      ripple.style.top = event.clientY + "px";
      document.body.appendChild(ripple);
      setTimeout(function () {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 760);
    },
    true
  );
})();
