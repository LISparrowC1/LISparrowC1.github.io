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

  function parseBadgeCount(svg) {
    var match = /VISITORS:\s*([\d,]+)/i.exec(svg || "");
    return match ? match[1] : null;
  }

  function fetchBadge(path) {
    return fetch(
      "https://api.visitorbadge.io/api/visitors?path=" + encodeURIComponent(path),
      { cache: "no-store" }
    )
      .then(function (response) {
        return response.ok ? response.text() : "";
      })
      .then(parseBadgeCount)
      .catch(function () {
        return null;
      });
  }

  function setCount(el, value) {
    if (el && value) el.textContent = value;
  }

  function showFallback() {
    if (settled || filled()) return;
    settled = true;

    fetchBadge("LISparrowC1.github.io").then(function (count) {
      setCount(pvValue, count);
    });

    var uvKey = "alist-visitor-uv";
    var cachedUv = null;
    try {
      cachedUv = localStorage.getItem(uvKey);
    } catch (error) {
      cachedUv = null;
    }

    if (cachedUv) {
      setCount(uvValue, cachedUv);
      return;
    }

    fetchBadge("LISparrowC1.github.io/uv").then(function (count) {
      if (!count) return;
      setCount(uvValue, count);
      try {
        localStorage.setItem(uvKey, count);
      } catch (error) {
        // Ignore storage restrictions.
      }
    });
  }

  tryNext();

  setTimeout(showFallback, 6000);

  setTimeout(function () {
    if (!filled()) reveal();
  }, 9000);
})();
