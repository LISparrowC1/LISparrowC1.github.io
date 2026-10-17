hexo.extend.filter.register("after_render:html", function (str) {
  if (!/<body[^>]*>/i.test(str)) return str;

  if (!str.includes('id="alist-font-ready"')) {
    var fontLinks =
      '<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>' +
      '<link rel="dns-prefetch" href="https://cdn.jsdelivr.net">' +
      '<link id="alist-font-ready" rel="stylesheet" media="print" onload="this.media=\'all\'" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/lxgwwenkai-regular.css">' +
      '<link rel="stylesheet" media="print" onload="this.media=\'all\'" href="https://cdn.jsdelivr.net/npm/lxgw-wenkai-webfont@1.7.0/lxgwwenkai-bold.css">';
    str = str.replace(/<\/head>/i, fontLinks + "</head>");
  }

  if (str.indexOf('id="alist-loader"') === -1) {
    var loader =
      '<div id="alist-loader" aria-hidden="true">' +
      '<canvas id="alist-binary"></canvas>' +
      '<div class="alist-loader-brand">ALIST</div>' +
      '<div class="alist-loader-sub">LOADING</div>' +
      "</div>" +
      "<noscript><style>#alist-loader{display:none!important}</style></noscript>" +
      '<script src="/js/binary-loader.js"></script>' +
      '<script>if(location.pathname==="/"||location.pathname==="/index.html"){document.documentElement.classList.add("alist-home")}</script>';
    str = str.replace(/<body([^>]*)>/i, "<body$1>" + loader);
  }

  return str;
});
