(function () {
  "use strict";

  if (window.__alistVisitorsLoaded) return;
  window.__alistVisitorsLoaded = true;

  var script = document.createElement("script");
  script.src = "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
  script.async = true;
  script.onerror = function () {
    var nodes = document.querySelectorAll(".alist-visitors");
    for (var i = 0; i < nodes.length; i++) nodes[i].style.display = "none";
  };
  document.body.appendChild(script);
})();
