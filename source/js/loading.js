(function () {
  "use strict";

  var el = document.getElementById("alist-loader");
  if (!el) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.remove();
    return;
  }

  var done = false;

  function hide() {
    if (done) return;
    done = true;
    el.classList.add("is-hidden");
    setTimeout(function () {
      if (el.parentNode) el.remove();
    }, 600);
  }

  function scheduleHide() {
    setTimeout(hide, 350);
  }

  if (document.readyState === "complete") {
    scheduleHide();
  } else {
    window.addEventListener("load", scheduleHide, { once: true });
  }

  setTimeout(hide, 4500);
})();
