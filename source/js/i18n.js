(function () {
  "use strict";

  if (window.__alistI18nLoaded) return;
  window.__alistI18nLoaded = true;

  var STORAGE_KEY = "alist-lang";
  var fallback = {
    zh: {
      "nav.home": "首页",
      "nav.archives": "归档",
      "nav.categories": "分类",
      "nav.tags": "标签",
      "nav.about": "关于",
      "page.archives": "归档",
      "page.categories": "分类",
      "page.tags": "标签",
      "page.about": "关于",
      "footer.visitors": "访客",
      "footer.views": "访问",
      "search.placeholder": "关键词",
      "archives.count": "共计 {n} 篇文章",
      "post.words": "{n} 字",
      "post.minutes": "{n} 分钟",
      "music.switch": "音乐开关",
      "music.no": "无音乐",
      "lang.switch": "切换语言"
    },
    en: {
      "nav.home": "Home",
      "nav.archives": "Archives",
      "nav.categories": "Categories",
      "nav.tags": "Tags",
      "nav.about": "About",
      "page.archives": "Archives",
      "page.categories": "Categories",
      "page.tags": "Tags",
      "page.about": "About",
      "footer.visitors": "Visitors",
      "footer.views": "Views",
      "search.placeholder": "Search",
      "archives.count": "{n} posts",
      "post.words": "{n} words",
      "post.minutes": "{n} min",
      "music.switch": "Music",
      "music.no": "No music",
      "lang.switch": "Switch language"
    }
  };

  var dict = { zh: fallback.zh, en: fallback.en };
  var lang = localStorage.getItem(STORAGE_KEY) || "zh";
  if (lang !== "en") lang = "zh";

  var switchEl = null;
  var mobileSwitch = null;

  function t(key) {
    var table = dict[lang] || dict.zh;
    return table[key] || (dict.zh[key] || key);
  }

  function navKey(href) {
    if (!href) return "";
    var path = href;
    try {
      path = new URL(href, window.location.origin).pathname;
    } catch (error) {
      path = href;
    }
    if (path === "/" || path === "" || path.indexOf("/page/") === 0) return "nav.home";
    if (path.indexOf("/archives") === 0) return "nav.archives";
    if (path.indexOf("/categories") === 0) return "nav.categories";
    if (path.indexOf("/tags") === 0) return "nav.tags";
    if (path.indexOf("/about") === 0) return "nav.about";
    return "";
  }

  function setNavText(link, text) {
    var span = link.querySelector("span");
    if (span) {
      span.textContent = text;
      return;
    }
    var children = Array.prototype.slice.call(link.childNodes);
    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeType === 3) link.removeChild(children[i]);
    }
    link.appendChild(document.createTextNode(text));
  }

  function translateNav() {
    var links = document.querySelectorAll("#navbar .navbar-nav a.nav-link");
    for (var i = 0; i < links.length; i++) {
      var key = navKey(links[i].getAttribute("href"));
      if (key) setNavText(links[i], t(key));
    }

    var mobileLinks = document.querySelectorAll("#mobile-grid-menu a");
    for (var j = 0; j < mobileLinks.length; j++) {
      var mkey = navKey(mobileLinks[j].getAttribute("href"));
      if (!mkey) continue;
      var label = mobileLinks[j].querySelector(".mobile-grid-item span");
      if (label) label.textContent = t(mkey);
    }
  }

  function translatePageTitle() {
    var pageKey = "";
    var path = window.location.pathname;
    if (path.indexOf("/archives") === 0) pageKey = "page.archives";
    else if (path.indexOf("/categories") === 0) pageKey = "page.categories";
    else if (path.indexOf("/tags") === 0) pageKey = "page.tags";
    else if (path.indexOf("/about") === 0) pageKey = "page.about";
    if (!pageKey) return;
    var heading = document.querySelector("#banner .h2");
    if (heading && !heading.querySelector("#subtitle")) heading.textContent = t(pageKey);
  }

  function translateFooter() {
    var uv = document.getElementById("busuanzi_container_site_uv");
    var pv = document.getElementById("busuanzi_container_site_pv");
    if (uv && uv.firstChild && uv.firstChild.nodeType === 3) {
      uv.firstChild.nodeValue = t("footer.visitors") + " ";
    }
    if (pv && pv.firstChild && pv.firstChild.nodeType === 3) {
      pv.firstChild.nodeValue = t("footer.views") + " ";
    }
  }

  function translateSearch() {
    var input = document.getElementById("local-search-input");
    if (input) input.placeholder = t("search.placeholder");
    var label = document.querySelector('label[for="local-search-input"]');
    if (label) label.textContent = t("search.placeholder");
  }

  function translateCounts() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest("script,style,noscript,code,pre")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      var text = node.nodeValue;
      if (!text) continue;
      if (/共计\s*\d+\s*篇文章/.test(text)) {
        node.nodeValue = text.replace(/共计\s*(\d+)\s*篇文章/g, function (match, n) {
          return t("archives.count").replace("{n}", n);
        });
      }
      if (/^\s*\d+\s*字\s*$/.test(text)) {
        node.nodeValue = text.replace(/(\d+)\s*字/, t("post.words").replace("{n}", "$1"));
      }
      if (/^\s*\d+\s*分钟\s*$/.test(text)) {
        node.nodeValue = text.replace(/(\d+)\s*分钟/, t("post.minutes").replace("{n}", "$1"));
      }
    }
  }

  function translateCustomText() {
    var nodes = document.querySelectorAll("[data-i18n-zh][data-i18n-en]");
    for (var i = 0; i < nodes.length; i++) {
      var text = lang === "zh" ? nodes[i].getAttribute("data-i18n-zh") : nodes[i].getAttribute("data-i18n-en");
      if (text !== null) nodes[i].textContent = text;
    }
  }

  function translateSwitches() {
    var label = lang === "zh" ? "EN" : "中";
    if (switchEl) {
      switchEl.textContent = label;
      switchEl.title = t("lang.switch");
      switchEl.setAttribute("aria-label", t("lang.switch"));
    }
    if (mobileSwitch) {
      var lbl = mobileSwitch.querySelector(".alist-lang-switch-label");
      if (lbl) lbl.textContent = label;
      mobileSwitch.title = t("lang.switch");
      mobileSwitch.setAttribute("aria-label", t("lang.switch"));
    }
    var musicSwitch = document.getElementById("alist-music-switch");
    if (musicSwitch) {
      musicSwitch.title = t("music.switch");
      musicSwitch.setAttribute("aria-label", t("music.switch"));
    }
  }

  function apply() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    translateNav();
    translatePageTitle();
    translateFooter();
    translateSearch();
    translateCounts();
    translateCustomText();
    translateSwitches();
    try {
      window.dispatchEvent(new CustomEvent("alist:lang", { detail: lang }));
    } catch (error) {
      // Ignore environments without CustomEvent.
    }
  }

  function toggleLang() {
    lang = lang === "zh" ? "en" : "zh";
    localStorage.setItem(STORAGE_KEY, lang);
    apply();
  }

  var nav = document.querySelector("#navbar .navbar-nav");
  if (nav) {
    var item = document.createElement("li");
    item.className = "nav-item alist-lang-switch-item";
    switchEl = document.createElement("a");
    switchEl.className = "nav-link";
    switchEl.id = "alist-lang-switch";
    switchEl.href = "javascript:;";
    switchEl.textContent = lang === "zh" ? "EN" : "中";
    switchEl.title = t("lang.switch");
    switchEl.setAttribute("aria-label", t("lang.switch"));
    item.appendChild(switchEl);
    var searchItem = nav.querySelector("#search-btn");
    nav.insertBefore(item, searchItem || null);
    switchEl.addEventListener("click", toggleLang);
  }

  mobileSwitch = document.createElement("a");
  mobileSwitch.href = "javascript:;";
  mobileSwitch.className = "alist-lang-switch-mobile";
  mobileSwitch.title = t("lang.switch");
  mobileSwitch.innerHTML =
    '<div class="mobile-grid-item"><span class="alist-lang-switch-label">' +
    (lang === "zh" ? "EN" : "中") +
    "</span></div>";
  var mobileMenu = document.querySelector("#mobile-grid-menu .mobile-grid-menu-inner");
  if (mobileMenu) mobileMenu.appendChild(mobileSwitch);
  mobileSwitch.addEventListener("click", toggleLang);

  fetch("/data/i18n.json", { cache: "no-store" })
    .then(function (response) {
      return response.ok ? response.json() : null;
    })
    .then(function (data) {
      if (!data) return;
      if (data.zh) dict.zh = data.zh;
      if (data.en) dict.en = data.en;
      apply();
    })
    .catch(function () {
      apply();
    });

  apply();
})();
