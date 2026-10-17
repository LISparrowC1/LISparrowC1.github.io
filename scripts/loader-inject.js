hexo.extend.filter.register("after_render:html", function (str) {
  if (str.indexOf('id="alist-loader"') !== -1) return str;
  if (!/<body[^>]*>/i.test(str)) return str;

  var loader =
    '<div id="alist-loader" aria-hidden="true">' +
    '<canvas id="alist-binary"></canvas>' +
    '<div class="alist-loader-brand">ALIST</div>' +
    '<div class="alist-loader-sub">LOADING</div>' +
    "</div>" +
    "<noscript><style>#alist-loader{display:none!important}</style></noscript>" +
    '<script src="/js/binary-loader.js"></script>';

  return str.replace(/<body([^>]*)>/i, "<body$1>" + loader);
});
