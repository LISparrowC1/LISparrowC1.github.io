(function () {
  "use strict";

  var originalTitle = document.title;
  var leaveTitle = "你别走呀 Σσ(・Д・；)!!!";
  var returnTitle = "我知道你还会回来 ٩(๑>◡<๑)۶ ";
  var restoring = false;

  function restore() {
    if (restoring) return;
    restoring = true;
    document.title = returnTitle;
    setTimeout(function () {
      document.title = originalTitle;
      restoring = false;
    }, 2000);
  }

  function onVisibility() {
    if (document.hidden) {
      document.title = leaveTitle;
    } else {
      restore();
    }
  }

  if ("hidden" in document) {
    document.addEventListener("visibilitychange", onVisibility);
  }

  window.addEventListener("pagehide", function () {
    document.title = leaveTitle;
  });

  window.addEventListener("pageshow", function () {
    restore();
  });
})();
