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

  if (!document.documentElement.classList.contains("alist-home")) return;

  var fallback = {
    zh: {
      initial: "无限进步",
      quotes: ["保持好奇", "把复杂的事做简单", "想到就去做", "慢一点也没关系"],
      greetings: {
        dawn: "夜深了，早点休息。",
        morning: "早上好，今天也慢慢来。",
        forenoon: "上午好，继续做点喜欢的事。",
        noon: "中午好，记得吃饭。",
        afternoon: "下午好，别忘记抬头看看。",
        evening: "晚上好，写点小东西吧。",
        night: "夜深了，早点休息。"
      }
    },
    en: {
      initial: "Infinite Progress",
      quotes: ["Stay curious.", "Make the complex simple.", "Just start.", "Slow is fine."],
      greetings: {
        dawn: "It's late. Get some rest.",
        morning: "Good morning. Take it slow.",
        forenoon: "Good morning. Do something you love.",
        noon: "Good afternoon. Remember to eat.",
        afternoon: "Good afternoon. Look up for a moment.",
        evening: "Good evening. Write something small.",
        night: "It's late. Get some rest."
      }
    }
  };

  var phrases = { zh: fallback.zh, en: fallback.en };
  var lang = localStorage.getItem("alist-lang") || (document.documentElement.lang === "en" ? "en" : "zh");
  var content = phrases[lang] || phrases.zh;
  var token = 0;
  var typeTimer = 0;
  var current = content.initial;
  var lyricsMode = false;
  var typing = false;

  fetch("/data/phrases.json", { cache: "no-store" })
    .then(function (response) {
      return response.ok ? response.json() : null;
    })
    .then(function (data) {
      if (!data) return;
      if (data.zh && Array.isArray(data.zh.quotes)) phrases.zh = data.zh;
      if (data.en && Array.isArray(data.en.quotes)) phrases.en = data.en;
      content = phrases[lang] || phrases.zh;
      if (!lyricsMode && !typing) typeText(content.initial);
    })
    .catch(function () {
      // Keep the built-in fallback when the data file is unavailable.
    });

  function clearTimers() {
    clearTimeout(typeTimer);
    typeTimer = 0;
  }

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
    return content.greetings[key] || content.initial;
  }

  function typeText(text) {
    if (lyricsMode) return;
    token++;
    var my = token;
    clearTimers();
    typing = true;
    subtitle.textContent = "";
    var i = 0;
    function step() {
      if (my !== token || lyricsMode) {
        typing = false;
        return;
      }
      subtitle.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        typeTimer = setTimeout(step, 70);
      } else {
        typing = false;
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
    if (lyricsMode) return;
    token++;
    var my = token;
    clearTimers();
    typing = true;
    var text = subtitle.textContent || "";
    var i = text.length;
    function step() {
      if (my !== token || lyricsMode) {
        typing = false;
        return;
      }
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

  var trigger = subtitle.closest(".banner-text") || subtitle;
  trigger.addEventListener("click", function (event) {
    if (event.target.closest("a")) return;
    nextPhrase();
  });

  window.addEventListener("alist:lang", function (event) {
    lang = event.detail === "en" ? "en" : "zh";
    content = phrases[lang] || phrases.zh;
    current = content.initial;
    lyricsMode = false;
    subtitle.classList.remove("is-lyrics");
    typing = false;
    typeText(content.initial);
  });

  window.addEventListener("alist:lyrics", function (event) {
    var detail = event.detail || {};
    if (detail.active) {
      lyricsMode = true;
      token++;
      clearTimers();
      typing = false;
      subtitle.textContent = detail.text || "";
      subtitle.classList.add("is-lyrics");
    } else if (lyricsMode) {
      lyricsMode = false;
      subtitle.classList.remove("is-lyrics");
      typing = false;
      typeText(content.initial);
    }
  });

  typeText(content.initial);
})();
