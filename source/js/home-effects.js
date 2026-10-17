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

  var content = {
    quotes: [
      "保持好奇",
      "把复杂的事做简单",
      "想到就去做",
      "慢一点也没关系",
      "今天也要有点收获",
      "在能力范围内做到最好",
      "去做，然后再说",
      "把喜欢的事做久一点",
      "把今天过成想要的样子"
    ],
    greetings: {
      dawn: "夜深了，早点休息。",
      morning: "早上好，今天也慢慢来。",
      forenoon: "上午好，继续做点喜欢的事。",
      noon: "中午好，记得吃饭。",
      afternoon: "下午好，别忘记抬头看看。",
      evening: "晚上好，写点小东西吧。",
      night: "夜深了，早点休息。"
    }
  };

  fetch("/data/phrases.json", { cache: "no-store" })
    .then(function (response) {
      return response.ok ? response.json() : null;
    })
    .then(function (data) {
      if (!data) return;
      if (Array.isArray(data.quotes) && data.quotes.length) content.quotes = data.quotes;
      if (data.greetings && typeof data.greetings === "object") {
        for (var key in data.greetings) {
          if (Object.prototype.hasOwnProperty.call(data.greetings, key)) {
            content.greetings[key] = data.greetings[key];
          }
        }
      }
    })
    .catch(function () {
      // Keep the built-in fallback when the data file is unavailable.
    });

  function greeting() {
    var hour = new Date().getHours();
    var key;
    if (hour < 5) key = "dawn";
    else if (hour < 9) key = "morning";
    else if (hour < 12) key = "forenoon";
    else if (hour < 14) key = "noon";
    else if (hour < 18) key = "afternoon";
    else if (hour < 23) key = "evening";
    else key = "night";
    return content.greetings[key] || "无限进步";
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
    var pool = content.quotes.slice();
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
