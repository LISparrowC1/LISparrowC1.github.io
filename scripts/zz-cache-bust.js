const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function resolveVersion() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 12);
  try {
    return execSync("git rev-parse --short=12 HEAD", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch (error) {
    return String(Date.now());
  }
}

const isServer = hexo.env && hexo.env.cmd === "server";
const version = isServer ? String(Date.now()) : resolveVersion();

const updateScript = [
  "(function(){",
  "var meta=document.querySelector('meta[name=\"alist-version\"]');",
  "if(!meta)return;",
  "var current=meta.getAttribute('content')||'';",
  "if(!current)return;",
  "function check(){",
  "fetch('/version.json?t='+Date.now(),{cache:'no-store'})",
  ".then(function(r){return r.ok?r.json():null;})",
  ".then(function(d){",
  "if(!d||!d.version||d.version===current)return;",
  "var key='alist-version-'+d.version;",
  "try{if(sessionStorage.getItem(key))return;sessionStorage.setItem(key,'1');}catch(e){}",
  "location.replace(location.pathname+'?v='+encodeURIComponent(d.version));",
  "}).catch(function(){});",
  "}",
  "if(document.readyState==='complete'){check();}else{window.addEventListener('load',check,{once:true});}",
  "})();"
].join("");

hexo.extend.filter.register("after_render:html", function (str) {
  if (!/<html[\s>]/i.test(str)) return str;
  if (str.indexOf('name="alist-version"') !== -1) return str;

  str = str.replace(
    /<\/head>/i,
    '<meta name="alist-version" content="' + version + '">\n</head>'
  );

  str = str.replace(
    /(href|src)=("|')(\/(?:css|js)\/[^"']+\.(?:css|js))\2/g,
    function (match, attr, quote, url) {
      return attr + "=" + quote + url + "?v=" + version + quote;
    }
  );

  return str.replace(/<\/body>/i, "<script>" + updateScript + "</script>\n</body>");
});

hexo.extend.filter.register("after_generate", function () {
  try {
    fs.mkdirSync(hexo.public_dir, { recursive: true });
    fs.writeFileSync(
      path.join(hexo.public_dir, "version.json"),
      JSON.stringify({ version: version, builtAt: new Date().toISOString() }, null, 2)
    );
  } catch (error) {
    // Version file is optional for local preview.
  }
});
