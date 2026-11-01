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

  var localHost =
    location.protocol === "file:" ||
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0|::1|\[::1\])$/.test(location.hostname || "");

  if (localHost) {
    reveal();
    return;
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

  function showFallback() {
    if (settled || filled()) return;
    settled = true;
    var box = document.querySelector(".alist-visitors");
    if (!box) return;
    var label = (document.documentElement.lang || "").indexOf("en") === 0 ? "Visitors" : "访问";
    var img = document.createElement("img");
    img.className = "alist-visitor-badge";
    img.alt = label;
    img.decoding = "async";
    img.src =
      "https://api.visitorbadge.io/api/visitors?path=LISparrowC1.github.io&label=" +
      encodeURIComponent(label) +
      "&countColor=%238b5cf6&labelColor=%23222b36&style=flat";
    img.onerror = function () {
      box.textContent = "--";
    };
    box.innerHTML = '<i class="iconfont icon-user-fill"></i>';
    box.appendChild(img);
  }

  tryNext();

  setTimeout(showFallback, 6000);

  setTimeout(function () {
    if (!filled()) reveal();
  }, 9000);
})();
