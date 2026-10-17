(function () {
  "use strict";

  if (window.__alistVisitorsLoaded) return;
  window.__alistVisitorsLoaded = true;

  var SOURCES = [
    "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js",
    "https://busuanzi.icodeq.com/busuanzi.pure.mini.js"
  ];

  var uvContainer = document.getElementById("busuanzi_container_site_uv");
  var pvContainer = document.getElementById("busuanzi_container_site_pv");
  var uvValue = document.getElementById("busuanzi_value_site_uv");
  var pvValue = document.getElementById("busuanzi_value_site_pv");

  function reveal() {
    if (uvContainer) uvContainer.style.display = "inline";
    if (pvContainer) pvContainer.style.display = "inline";
    if (uvValue && !/[0-9]/.test(uvValue.textContent || "")) uvValue.textContent = "--";
    if (pvValue && !/[0-9]/.test(pvValue.textContent || "")) pvValue.textContent = "--";
  }

  function filled() {
    return /[0-9]/.test((uvValue && uvValue.textContent) || "") || /[0-9]/.test((pvValue && pvValue.textContent) || "");
  }

  reveal();

  var sourceIndex = 0;
  var settled = false;

  function tryNext() {
    if (settled || sourceIndex >= SOURCES.length) return;
    var script = document.createElement("script");
    script.src = SOURCES[sourceIndex++];
    script.async = true;
    var tried = false;

    function fallback() {
      if (tried) return;
      tried = true;
      tryNext();
    }

    script.onerror = fallback;
    script.onload = function () {
      setTimeout(function () {
        if (filled()) {
          settled = true;
          return;
        }
        fallback();
      }, 2500);
    };
    document.body.appendChild(script);
  }

  tryNext();

  setTimeout(function () {
    if (!filled()) reveal();
  }, 9000);
})();
