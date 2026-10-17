(function () {
  "use strict";

  if (window.__alistHomeLoaded) return;
  window.__alistHomeLoaded = true;

  var subtitle = document.getElementById("subtitle");
  if (!subtitle) return;

  if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
    document.documentElement.classList.add("alist-home");
  }

  var banner = document.getElementById("banner");
  if (banner) {
    var ticking = false;
    function updateBanner() {
      ticking = false;
      var height = banner.offsetHeight || window.innerHeight;
      var top = banner.getBoundingClientRect().top;
      var progress = Math.min(1, Math.max(0, -top / (height * 0.78)));
      banner.style.setProperty("--alist-banner-blur", (progress * 12).toFixed(2) + "px");
      banner.style.setProperty("--alist-banner-scale", (1.04 + progress * 0.05).toFixed(3));
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateBanner);
        }
      },
      { passive: true }
    );
    updateBanner();
  }

  var quotes = [
    "无限进步",
    "保持好奇",
    "把复杂的事做简单",
    "想到就去做",
    "慢一点也没关系",
    "今天也要有点收获",
    "在能力范围内做到最好",
    "去做，然后再说"
  ];

  function greeting() {
    var hour = new Date().getHours();
    if (hour < 5) return "夜深了，早点休息。";
    if (hour < 9) return "早上好，今天也慢慢来。";
    if (hour < 12) return "上午好，继续做点喜欢的事。";
    if (hour < 14) return "中午好，记得吃饭。";
    if (hour < 18) return "下午好，别忘记抬头看看。";
    if (hour < 23) return "晚上好，写点小东西吧。";
    return "夜深了，早点休息。";
  }

  var token = 0;
  var typeTimer = 0;
  var waitTimer = 0;
  var current = "无限进步";

  function clearTimers() {
    clearTimeout(typeTimer);
    clearTimeout(waitTimer);
  }

  function scheduleNext() {
    waitTimer = setTimeout(nextPhrase, 3600);
  }

  function typeText(text) {
    token++;
    var my = token;
    clearTimers();
    subtitle.textContent = "";
    var i = 0;
    function step() {
      if (my !== token) return;
      subtitle.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        typeTimer = setTimeout(step, 70);
      } else {
        scheduleNext();
      }
    }
    step();
  }

  function pickPhrase() {
    var pool = quotes.slice();
    pool.push(greeting());
    var next = pool[Math.floor(Math.random() * pool.length)];
    if (next === current) next = pool[(pool.indexOf(next) + 1) % pool.length];
    current = next;
    return next;
  }

  function nextPhrase() {
    token++;
    var my = token;
    clearTimers();
    var text = subtitle.textContent || "";
    var i = text.length;
    function step() {
      if (my !== token) return;
      subtitle.textContent = text.slice(0, i);
      i--;
      if (i >= 0) {
        typeTimer = setTimeout(step, 34);
      } else {
        typeText(pickPhrase());
      }
    }
    step();
  }

  subtitle.addEventListener("click", nextPhrase);
  typeText("无限进步");
})();
