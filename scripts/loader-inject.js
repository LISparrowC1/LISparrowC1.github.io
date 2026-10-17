hexo.extend.filter.register("after_render:html", function (str) {
  if (str.indexOf('id="alist-loader"') !== -1) return str;
  if (!/<body[^>]*>/i.test(str)) return str;

  var loader =
    '<div id="alist-loader" aria-hidden="true">' +
    '<div class="alist-loader-ring"></div>' +
    '<div class="alist-loader-text">ALIST</div>' +
    "</div>" +
    "<noscript><style>#alist-loader{display:none!important}</style></noscript>";

  return str.replace(/<body([^>]*)>/i, "<body$1>" + loader);
});
