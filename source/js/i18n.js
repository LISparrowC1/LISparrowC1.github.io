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
      "page.404": "页面不存在",
      "footer.visitors": "访客",
      "footer.views": "访问",
      "search.placeholder": "关键词",
      "search.label": "搜索",
      "archives.count": "共计 {n} 篇文章",
      "post.words": "{n} 字",
      "post.minutes": "{n} 分钟",
      "post.toc": "目录",
      "post.prev": "上一篇",
      "post.next": "下一篇",
      "post.updated_prefix": "本文最后更新于",
      "post.author": "作者",
      "post.posted": "发布于",
      "post.updated": "更新于",
      "post.license": "许可协议",
      "license.cc": "CC - 知识共享许可协议",
      "license.by": "BY - 署名",
      "license.sa": "SA - 相同方式共享",
      "license.nc": "NC - 非商业性使用",
      "license.nd": "ND - 禁止演绎",
      "license.zero": "CC0 - 无版权",
      "dark.light": "开灯",
      "dark.dark": "关灯",
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
      "page.404": "Page not found",
      "footer.visitors": "Visitors",
      "footer.views": "Views",
      "search.placeholder": "Search",
      "search.label": "Search",
      "archives.count": "{n} posts",
      "post.words": "{n} words",
      "post.minutes": "{n} min",
      "post.toc": "Table of Contents",
      "post.prev": "Previous",
      "post.next": "Next",
      "post.updated_prefix": "Last updated on",
      "post.author": "Author",
      "post.posted": "Posted on",
      "post.updated": "Updated on",
      "post.license": "Licensed under",
      "license.cc": "CC - Creative Commons license",
      "license.by": "BY - Attribution",
      "license.sa": "SA - Share-alike",
      "license.nc": "NC - Non-commercial",
      "license.nd": "ND - No derivative works",
      "license.zero": "CC0 - No Copyright",
      "dark.light": "Light",
      "dark.dark": "Dark",
      "music.switch": "Music",
      "music.no": "No music",
      "lang.switch": "Switch language"
    }
  };

  var dict = { zh: fallback.zh, en: fallback.en };

  function detectBrowserLang() {
    var preferred = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    return /^zh(-|_|$)/i.test(preferred) ? "zh" : "en";
  }

  var savedLang = localStorage.getItem(STORAGE_KEY);
  var lang = savedLang === "zh" || savedLang === "en" ? savedLang : detectBrowserLang();

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
    else if (path.indexOf("/404") !== -1) pageKey = "page.404";
    if (!pageKey) return;
    var parsedTitle = document.title.split(" · ");
    var siteTitle = parsedTitle.length > 1 ? parsedTitle[parsedTitle.length - 1] : "ALIST";
    document.title = t(pageKey) + " · " + siteTitle;
    var subtitle = document.querySelector("#banner #subtitle");
    if (subtitle) {
      subtitle.textContent = t(pageKey);
      return;
    }
    var heading = document.querySelector("#banner .h2");
    if (heading && !heading.querySelector("#subtitle")) heading.textContent = t(pageKey);
  }

  function translateAbout() {
    var intro = document.querySelector(".about-intro");
    if (intro) {
      intro.textContent = lang === "en"
        ? "I build small tools and fun things."
        : "写点小工具，也做点好玩的东西。";
    }

    var body = document.querySelector(".about-content .markdown-body");
    if (!body) return;
    var english = body.querySelector(".alist-about-en");
    if (!english) return;
    var children = Array.prototype.slice.call(body.children);
    for (var i = 0; i < children.length; i++) {
      if (children[i] !== english) children[i].hidden = lang === "en";
    }
    english.hidden = lang !== "en";
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

    var searchButtons = document.querySelectorAll("#search-btn a, #mobile-search-btn, a[data-target='#modalSearch']");
    for (var i = 0; i < searchButtons.length; i++) {
      searchButtons[i].setAttribute("aria-label", t("search.label"));
    }
    var mobileSearch = document.querySelector("#mobile-search-btn .mobile-grid-item span, #mobile-grid-menu a[data-target='#modalSearch'] .mobile-grid-item span");
    if (mobileSearch) mobileSearch.textContent = t("search.label");
  }

  function translatePostUI() {
    var tocTitle = document.querySelector("#toc .toc-header span");
    if (tocTitle) tocTitle.textContent = t("post.toc");

    var navLabels = document.querySelectorAll(".post-nav .visible-mobile");
    for (var i = 0; i < navLabels.length; i++) {
      var navText = (navLabels[i].textContent || "").trim();
      if (navText === "上一篇") navLabels[i].textContent = t("post.prev");
      else if (navText === "下一篇") navLabels[i].textContent = t("post.next");
    }

    var copyrightMap = {
      "作者": t("post.author"),
      "发布于": t("post.posted"),
      "更新于": t("post.updated"),
      "许可协议": t("post.license")
    };
    var copyrightLabels = document.querySelectorAll(".license-meta-item > div:first-child");
    for (var j = 0; j < copyrightLabels.length; j++) {
      var labelText = (copyrightLabels[j].textContent || "").trim();
      if (copyrightMap[labelText]) copyrightLabels[j].textContent = copyrightMap[labelText];
    }

    var licenseMap = {
      "CC - 知识共享许可协议": t("license.cc"),
      "BY - 署名": t("license.by"),
      "SA - 相同方式共享": t("license.sa"),
      "NC - 非商业性使用": t("license.nc"),
      "ND - 禁止演绎": t("license.nd"),
      "CC0 - 无版权": t("license.zero")
    };
    var hints = document.querySelectorAll(".license-meta [aria-label], .license-meta [title]");
    for (var k = 0; k < hints.length; k++) {
      ["aria-label", "title"].forEach(function (attr) {
        var value = hints[k].getAttribute(attr);
        if (value && licenseMap[value]) hints[k].setAttribute(attr, licenseMap[value]);
      });
    }

    var colorToggle = document.querySelector("#mobile-color-toggle-btn");
    if (colorToggle) {
      colorToggle.setAttribute("data-label-light", t("dark.light"));
      colorToggle.setAttribute("data-label-dark", t("dark.dark"));
    }
    var colorButtons = document.querySelectorAll(".color-toggle-btn");
    for (var m = 0; m < colorButtons.length; m++) {
      colorButtons[m].setAttribute("title", t("dark.dark"));
    }
  }

  function enDate(text) {
    var names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return text
      .replace(/本文最后更新于/g, t("post.updated_prefix"))
      .replace(/(\d{4})年(\d{1,2})月(\d{1,2})日/g, function (match, year, month, day) {
        return names[Number(month) - 1] + " " + Number(day) + ", " + year;
      });
  }

  function translateDates() {
    if (lang !== "en") return;
    var roots = document.querySelectorAll(".license-meta-date, .post-meta, .index-meta, time, .archive-post-date");
    for (var i = 0; i < roots.length; i++) {
      var walker = document.createTreeWalker(roots[i], NodeFilter.SHOW_TEXT, null);
      var node;
      while ((node = walker.nextNode())) {
        node.nodeValue = enDate(node.nodeValue);
      }
    }
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
    var label = lang === "zh" ? "中" : "EN";
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
    translatePostUI();
    translateDates();
    translateAbout();
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
    switchEl.textContent = lang === "zh" ? "中" : "EN";
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
    (lang === "zh" ? "中" : "EN") +
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
