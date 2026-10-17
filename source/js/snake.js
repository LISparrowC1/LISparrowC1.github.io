(function () {
  "use strict";

  if (window.__alistSnakeLoaded) return;
  window.__alistSnakeLoaded = true;

  var CELL = 18;
  var STEP_MS = 120;
  var START_LEN = 4;
  var GROW_PER_FOOD = 2;

  var active = false;
  var layer = null;
  var canvas = null;
  var ctx = null;
  var hud = null;
  var raf = 0;
  var lastTime = 0;
  var acc = 0;
  var snake = [];
  var dir = { x: 1, y: 0 };
  var queue = [];
  var grow = 0;
  var foods = [];
  var score = 0;
  var won = false;
  var docW = 0;
  var docH = 0;
  var playW = 0;
  var playH = 0;
  var viewW = 0;
  var viewH = 0;
  var dpr = 1;
  var startScrollX = 0;
  var startScrollY = 0;
  var seq = "";
  var touchStart = null;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function isEditable(el) {
    if (!el) return false;
    var tag = (el.tagName || "").toUpperCase();
    return /^(INPUT|TEXTAREA|SELECT)$/.test(tag) || el.isContentEditable;
  }

  function dirFromKey(key) {
    switch (key) {
      case "ArrowUp":
      case "w":
      case "W":
        return { x: 0, y: -1 };
      case "ArrowDown":
      case "s":
      case "S":
        return { x: 0, y: 1 };
      case "ArrowLeft":
      case "a":
      case "A":
        return { x: -1, y: 0 };
      case "ArrowRight":
      case "d":
      case "D":
        return { x: 1, y: 0 };
      default:
        return null;
    }
  }

  function queueDir(next) {
    if (!next) return;
    var ref = queue.length ? queue[queue.length - 1] : dir;
    if (next.x === ref.x && next.y === ref.y) return;
    if (next.x === -ref.x && next.y === -ref.y) return;
    if (queue.length < 2) queue.push(next);
  }

  function isFixed(el) {
    for (var node = el; node && node !== document.body; node = node.parentElement) {
      var position = getComputedStyle(node).position;
      if (position === "fixed" || position === "sticky") return true;
    }
    return false;
  }

  function initSnake() {
    var startX = Math.floor((window.scrollX + viewW / 2) / CELL) * CELL;
    var startY = Math.floor((window.scrollY + viewH / 2) / CELL) * CELL;
    startX = clamp(startX, 0, playW - CELL);
    startY = clamp(startY, 0, playH - CELL);
    snake = [];
    for (var i = 0; i < START_LEN; i++) {
      var x = ((startX - i * CELL) % playW + playW) % playW;
      snake.push({ x: x, y: startY });
    }
    dir = { x: 1, y: 0 };
    queue = [];
    grow = 0;
    score = 0;
    won = false;
  }

  function collectFoods() {
    foods = [];
    var seen = new Set();
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest("#snake-layer")) return NodeFilter.FILTER_REJECT;
        if (parent.closest("script,style,noscript,svg,canvas,textarea,input,select,option")) {
          return NodeFilter.FILTER_REJECT;
        }
        if (parent === document.body || parent === document.documentElement) return NodeFilter.FILTER_REJECT;
        if (isFixed(parent)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var node;
    while ((node = walker.nextNode())) {
      var parent = node.parentElement;
      if (!parent || seen.has(parent)) continue;
      var style = getComputedStyle(parent);
      if (style.display === "none" || style.visibility === "hidden" || parseFloat(style.opacity) === 0) continue;
      if (parent.getClientRects().length === 0) continue;

      var range = document.createRange();
      range.selectNodeContents(node);
      var rects = range.getClientRects();
      var rect = null;
      for (var i = 0; i < rects.length; i++) {
        if (rects[i].width > 2 && rects[i].height > 2) {
          rect = rects[i];
          break;
        }
      }
      if (!rect) continue;

      var x = rect.left + rect.width / 2 + window.scrollX;
      var y = rect.top + rect.height / 2 + window.scrollY;
      if (x < 0 || y < 0 || x > docW || y > docH) continue;

      seen.add(parent);
      foods.push({ el: parent, x: x, y: y, eaten: false });
    }
  }

  function resizeCanvas() {
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewW * dpr);
    canvas.height = Math.floor(viewH * dpr);
    canvas.style.width = viewW + "px";
    canvas.style.height = viewH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function start() {
    if (active) return;
    active = true;
    seq = "";
    startScrollX = window.scrollX;
    startScrollY = window.scrollY;
    document.documentElement.style.scrollBehavior = "auto";
    document.body.classList.add("snake-playing");

    layer = document.createElement("div");
    layer.id = "snake-layer";
    layer.innerHTML = '<canvas id="snake-canvas"></canvas><div id="snake-hud"></div>';
    document.body.appendChild(layer);

    canvas = document.getElementById("snake-canvas");
    ctx = canvas.getContext("2d");
    hud = document.getElementById("snake-hud");

    docW = Math.max(document.documentElement.scrollWidth, window.innerWidth);
    docH = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    playW = Math.max(CELL, Math.floor(docW / CELL) * CELL);
    playH = Math.max(CELL, Math.floor(docH / CELL) * CELL);

    resizeCanvas();
    collectFoods();
    initSnake();
    bindTouch();
    layer.addEventListener("wheel", preventScroll, { passive: false });

    lastTime = 0;
    acc = 0;
    updateHud();
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    if (!active) return;
    active = false;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;

    if (layer && layer.parentNode) layer.parentNode.removeChild(layer);
    layer = null;
    canvas = null;
    ctx = null;
    hud = null;

    document.body.classList.remove("snake-playing");
    var eaten = document.querySelectorAll(".snake-eaten");
    for (var i = 0; i < eaten.length; i++) eaten[i].classList.remove("snake-eaten");
    window.scrollTo(startScrollX, startScrollY);
    document.documentElement.style.scrollBehavior = "";

    foods = [];
    snake = [];
    queue = [];
    score = 0;
    grow = 0;
    won = false;
  }

  function preventScroll(event) {
    event.preventDefault();
  }

  function onTouchStart(event) {
    if (!event.touches || !event.touches.length) return;
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }

  function onTouchEnd(event) {
    if (!touchStart || !event.changedTouches || !event.changedTouches.length) {
      touchStart = null;
      return;
    }
    var dx = event.changedTouches[0].clientX - touchStart.x;
    var dy = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      queueDir(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    } else {
      queueDir(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
    }
    event.preventDefault();
  }

  function bindTouch() {
    layer.addEventListener("touchstart", onTouchStart, { passive: true });
    layer.addEventListener("touchend", onTouchEnd, { passive: false });
    layer.addEventListener("touchmove", preventScroll, { passive: false });
  }

  function loop(now) {
    if (!active) return;
    if (!lastTime) lastTime = now;
    acc += now - lastTime;
    lastTime = now;
    var steps = 0;
    while (acc >= STEP_MS && steps < 4) {
      step();
      acc -= STEP_MS;
      steps++;
    }
    draw(now);
    raf = requestAnimationFrame(loop);
  }

  function step() {
    if (queue.length) {
      var next = queue.shift();
      if (!(next.x === -dir.x && next.y === -dir.y)) dir = next;
    }
    var head = snake[0];
    var nx = head.x + dir.x * CELL;
    var ny = head.y + dir.y * CELL;
    if (nx < 0) nx = playW - CELL;
    else if (nx >= playW) nx = 0;
    if (ny < 0) ny = playH - CELL;
    else if (ny >= playH) ny = 0;
    snake.unshift({ x: nx, y: ny });
    if (grow > 0) {
      grow--;
    } else {
      snake.pop();
    }
    followHead();
    checkFood();
    updateHud();
  }

  function followHead() {
    var head = snake[0];
    var headX = head.x + CELL / 2;
    var headY = head.y + CELL / 2;
    var scrollX = window.scrollX;
    var scrollY = window.scrollY;
    var marginX = viewW * 0.22;
    var marginY = viewH * 0.22;
    var targetX = scrollX;
    var targetY = scrollY;

    if (headX - scrollX < marginX) targetX = headX - marginX;
    else if (headX - scrollX > viewW - marginX) targetX = headX - (viewW - marginX);
    if (headY - scrollY < marginY) targetY = headY - marginY;
    else if (headY - scrollY > viewH - marginY) targetY = headY - (viewH - marginY);

    targetX = clamp(targetX, 0, Math.max(0, docW - viewW));
    targetY = clamp(targetY, 0, Math.max(0, docH - viewH));
    if (Math.abs(targetX - scrollX) > 0.5 || Math.abs(targetY - scrollY) > 0.5) {
      window.scrollTo(targetX, targetY);
    }
  }

  function checkFood() {
    var head = snake[0];
    var headX = head.x + CELL / 2;
    var headY = head.y + CELL / 2;
    var radius = CELL * 1.2;
    for (var i = 0; i < foods.length; i++) {
      var food = foods[i];
      if (food.eaten) continue;
      var dx = food.x - headX;
      var dy = food.y - headY;
      if (dx * dx + dy * dy <= radius * radius) {
        eat(food);
        break;
      }
    }
  }

  function eat(food) {
    if (food.eaten) return;
    food.eaten = true;
    food.el.classList.add("snake-eaten");
    score++;
    grow += GROW_PER_FOOD;

    for (var i = 0; i < foods.length; i++) {
      var other = foods[i];
      if (other.eaten) continue;
      if (other.el === food.el || food.el.contains(other.el)) {
        other.eaten = true;
        other.el.classList.add("snake-eaten");
      }
    }
  }

  function updateHud() {
    if (!hud) return;
    var remaining = 0;
    for (var i = 0; i < foods.length; i++) {
      if (!foods[i].eaten) remaining++;
    }
    if (remaining === 0) won = true;
    if (won) {
      hud.classList.add("is-win");
      hud.innerHTML = '页面已吃空 · <span class="snake-key">R 重开</span> · <span class="snake-key">ESC 退出</span>';
      return;
    }
    hud.classList.remove("is-win");
    hud.innerHTML =
      "吃掉 <b>" + score + "</b> · 长度 <b>" + snake.length + "</b> · 剩余 <b>" + remaining +
      '</b> · <span class="snake-key">R 重开</span> · <span class="snake-key">ESC 退出</span>';
  }

  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r);
    c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r);
    c.arcTo(x, y, x + w, y, r);
    c.closePath();
  }

  function draw(now) {
    if (!ctx) return;
    var offsetX = window.scrollX;
    var offsetY = window.scrollY;
    ctx.clearRect(0, 0, viewW, viewH);

    for (var i = 0; i < foods.length; i++) {
      var food = foods[i];
      if (food.eaten) continue;
      var fx = food.x - offsetX;
      var fy = food.y - offsetY;
      if (fx < -30 || fx > viewW + 30 || fy < -30 || fy > viewH + 30) continue;
      var pulse = 1 + 0.14 * Math.sin(now / 280 + i * 1.7);
      var radius = 8.5 * pulse;
      var glow = ctx.createRadialGradient(fx, fy, 0, fx, fy, radius * 2.6);
      glow.addColorStop(0, "rgba(196, 181, 253, 0.95)");
      glow.addColorStop(0.32, "rgba(139, 92, 246, 0.62)");
      glow.addColorStop(1, "rgba(139, 92, 246, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(fx, fy, radius * 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ede9fe";
      ctx.beginPath();
      ctx.arc(fx, fy, 3.1, 0, Math.PI * 2);
      ctx.fill();
    }

    for (var j = snake.length - 1; j >= 0; j--) {
      var seg = snake[j];
      var sx = seg.x - offsetX;
      var sy = seg.y - offsetY;
      if (sx < -CELL || sx > viewW + CELL || sy < -CELL || sy > viewH + CELL) continue;
      var ratio = j / Math.max(1, snake.length - 1);
      var size = CELL - 2 - ratio * 3;
      var pad = (CELL - size) / 2;
      ctx.fillStyle = j === 0 ? "#c4b5fd" : "rgba(139, 92, 246, " + (0.96 - ratio * 0.48) + ")";
      ctx.shadowColor = "rgba(139, 92, 246, 0.6)";
      ctx.shadowBlur = j === 0 ? 18 : 8;
      roundRect(ctx, sx + pad, sy + pad, size, size, 5);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    var head = snake[0];
    var cx = head.x - offsetX + CELL / 2;
    var cy = head.y - offsetY + CELL / 2;
    var perpX = -dir.y;
    var perpY = dir.x;
    var forward = 3.6;
    var side = 4.1;
    var eyeRadius = 2.8;
    var pupilRadius = 1.35;
    var eyes = [
      { x: cx + dir.x * forward + perpX * side, y: cy + dir.y * forward + perpY * side },
      { x: cx + dir.x * forward - perpX * side, y: cy + dir.y * forward - perpY * side }
    ];
    for (var k = 0; k < eyes.length; k++) {
      var eye = eyes[k];
      ctx.fillStyle = "#f5f3ff";
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, eyeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1e1b4b";
      ctx.beginPath();
      ctx.arc(eye.x + dir.x * 1.1, eye.y + dir.y * 1.1, pupilRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function autoStart() {
    if (window.location.search.indexOf("game=1") !== -1) {
      setTimeout(start, 1100);
    }
  }

  document.addEventListener(
    "keydown",
    function (event) {
      if (active) {
        if (event.key === "Escape") {
          event.preventDefault();
          stop();
          return;
        }
        if (event.key === "r" || event.key === "R") {
          event.preventDefault();
          stop();
          setTimeout(start, 60);
          return;
        }
        var next = dirFromKey(event.key);
        if (next) {
          event.preventDefault();
          queueDir(next);
        }
        return;
      }

      if (isEditable(event.target)) return;
      if (!event.key || event.key.length !== 1) return;
      seq = (seq + event.key.toLowerCase()).slice(-8);
      if (seq.indexOf("alist") !== -1) {
        seq = "";
        start();
      }
    },
    { passive: false }
  );

  if (document.readyState === "complete") autoStart();
  else window.addEventListener("load", autoStart);
})();
