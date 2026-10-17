(function () {
  "use strict";

  if (window.__alistAsteroidsLoaded) return;
  window.__alistAsteroidsLoaded = true;

  var W = 960;
  var H = 600;
  var overlay = null;
  var canvas = null;
  var ctx = null;
  var raf = null;
  var running = false;
  var last = 0;

  var ship;
  var bullets;
  var asteroids;
  var stars;
  var keys;
  var score;
  var lives;
  var invuln;
  var shootCd;
  var gameOver;
  var seq = "";

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function makeStars() {
    var list = [];
    for (var i = 0; i < 90; i++) {
      list.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.6 + 0.4,
        a: Math.random() * 0.55 + 0.15
      });
    }
    return list;
  }

  function makeAsteroid(x, y, r) {
    var verts = [];
    var n = 9 + Math.floor(Math.random() * 4);
    for (var i = 0; i < n; i++) {
      verts.push({
        a: (i / n) * Math.PI * 2,
        r: r * rand(0.72, 1.14)
      });
    }
    return {
      x: x,
      y: y,
      r: r,
      verts: verts,
      vx: rand(-55, 55),
      vy: rand(-55, 55),
      rot: rand(0, Math.PI * 2),
      vr: rand(-1.2, 1.2)
    };
  }

  function resetShip() {
    ship = { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0, r: 14 };
    invuln = 2;
  }

  function initGame() {
    score = 0;
    lives = 3;
    bullets = [];
    asteroids = [];
    stars = makeStars();
    keys = {};
    gameOver = false;
    shootCd = 0;
    resetShip();

    for (var i = 0; i < 6; i++) {
      var edge = Math.floor(Math.random() * 4);
      var x = 0;
      var y = 0;
      if (edge === 0) {
        x = rand(0, W);
        y = -40;
      } else if (edge === 1) {
        x = W + 40;
        y = rand(0, H);
      } else if (edge === 2) {
        x = rand(0, W);
        y = H + 40;
      } else {
        x = -40;
        y = rand(0, H);
      }
      asteroids.push(makeAsteroid(x, y, rand(18, 40)));
    }

    var scoreEl = document.getElementById("ast-score");
    var livesEl = document.getElementById("ast-lives");
    var overEl = document.getElementById("ast-over");
    if (scoreEl) scoreEl.textContent = "0";
    if (livesEl) livesEl.textContent = "3";
    if (overEl) overEl.style.display = "none";

    last = performance.now();
  }

  function start() {
    if (overlay) return;

    overlay = document.createElement("div");
    overlay.id = "asteroids-overlay";
    overlay.innerHTML =
      '<div id="asteroids-panel">' +
      '<canvas id="asteroids-canvas" width="960" height="600" aria-label="小行星游戏"></canvas>' +
      '<div class="asteroids-hud"><span>SCORE <b id="ast-score">0</b></span><span>LIVES <b id="ast-lives">3</b></span></div>' +
      '<div class="asteroids-hint">← → 转向 · ↑ 推进 · 空格 射击 · Esc 退出</div>' +
      '<button type="button" class="asteroids-close" aria-label="关闭游戏">×</button>' +
      '<div class="asteroids-over" id="ast-over" style="display:none"><strong>GAME OVER</strong><span>按 Enter 重开 · Esc 退出</span></div>' +
      "</div>";

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    canvas = document.getElementById("asteroids-canvas");
    ctx = canvas.getContext("2d");
    overlay.querySelector(".asteroids-close").addEventListener("click", close);

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    initGame();
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }

  function close() {
    if (!overlay) return;
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    document.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("keyup", onKeyUp);
    overlay.remove();
    overlay = null;
    document.body.style.overflow = "";
  }

  function onKeyDown(e) {
    if (!overlay) return;

    if (e.key === "Escape" || e.code === "Escape") {
      e.preventDefault();
      close();
      return;
    }

    if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].indexOf(e.code) >= 0 ||
      ["ArrowLeft", "ArrowRight", "ArrowUp", " "].indexOf(e.key) >= 0
    ) {
      e.preventDefault();
    }

    keys[e.code] = true;

    if (gameOver && (e.code === "Enter" || e.key === "Enter")) {
      initGame();
    }

    if (e.code === "Space" || e.key === " ") {
      shoot();
    }
  }

  function onKeyUp(e) {
    keys[e.code] = false;
  }

  function shoot() {
    if (!overlay || gameOver || shootCd > 0) return;
    shootCd = 0.16;
    bullets.push({
      x: ship.x + Math.cos(ship.a) * 16,
      y: ship.y + Math.sin(ship.a) * 16,
      vx: Math.cos(ship.a) * 520,
      vy: Math.sin(ship.a) * 520,
      life: 1
    });
  }

  function hitShip() {
    lives -= 1;
    if (lives <= 0) {
      lives = 0;
      gameOver = true;
      var overEl = document.getElementById("ast-over");
      if (overEl) overEl.style.display = "flex";
    } else {
      resetShip();
    }
    var livesEl = document.getElementById("ast-lives");
    if (livesEl) livesEl.textContent = String(lives);
  }

  function update(dt) {
    if (gameOver) return;

    shootCd = Math.max(0, shootCd - dt);
    invuln = Math.max(0, invuln - dt);

    if (keys["ArrowLeft"]) ship.a -= 3.6 * dt;
    if (keys["ArrowRight"]) ship.a += 3.6 * dt;
    if (keys["ArrowUp"]) {
      ship.vx += Math.cos(ship.a) * 190 * dt;
      ship.vy += Math.sin(ship.a) * 190 * dt;
    }

    ship.vx *= 0.994;
    ship.vy *= 0.994;

    var sp = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
    if (sp > 300) {
      ship.vx = (ship.vx / sp) * 300;
      ship.vy = (ship.vy / sp) * 300;
    }

    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;
    ship.x = (ship.x + W) % W;
    ship.y = (ship.y + H) % H;

    for (var i = bullets.length - 1; i >= 0; i--) {
      var b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (b.life <= 0 || b.x < -12 || b.x > W + 12 || b.y < -12 || b.y > H + 12) {
        bullets.splice(i, 1);
      }
    }

    for (var j = asteroids.length - 1; j >= 0; j--) {
      var a = asteroids[j];
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.rot += a.vr * dt;
      a.x = (a.x + W) % W;
      a.y = (a.y + H) % H;
    }

    for (var k = asteroids.length - 1; k >= 0; k--) {
      var ast = asteroids[k];

      if (
        invuln <= 0 &&
        Math.sqrt(Math.pow(ast.x - ship.x, 2) + Math.pow(ast.y - ship.y, 2)) <
          ast.r + ship.r
      ) {
        hitShip();
        break;
      }

      for (var m = bullets.length - 1; m >= 0; m--) {
        var bb = bullets[m];
        if (Math.sqrt(Math.pow(ast.x - bb.x, 2) + Math.pow(ast.y - bb.y, 2)) < ast.r) {
          bullets.splice(m, 1);
          asteroids.splice(k, 1);
          score += 10;

          if (ast.r > 26) {
            for (var s = 0; s < 2; s++) {
              var na = makeAsteroid(ast.x, ast.y, ast.r / 1.7);
              na.vx += rand(-30, 30);
              na.vy += rand(-30, 30);
              asteroids.push(na);
            }
          }
          break;
        }
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = "rgba(196, 181, 253, 0.35)";
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      ctx.globalAlpha = st.a;
      ctx.fillRect(st.x, st.y, st.r, st.r);
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 1.4;
    ctx.fillStyle = "rgba(139, 92, 246, 0.08)";
    for (var j = 0; j < asteroids.length; j++) {
      var a = asteroids[j];
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rot);
      ctx.beginPath();
      for (var v = 0; v < a.verts.length; v++) {
        var vert = a.verts[v];
        var x = Math.cos(vert.a) * vert.r;
        var y = Math.sin(vert.a) * vert.r;
        if (v === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.fillStyle = "#c4b5fd";
    for (var b = 0; b < bullets.length; b++) {
      ctx.beginPath();
      ctx.arc(bullets[b].x, bullets[b].y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    var blink = invuln > 0 && Math.floor(performance.now() / 110) % 2 === 0;
    if (!blink) {
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.a + Math.PI / 2);
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(12, 12);
      ctx.lineTo(0, 7);
      ctx.lineTo(-12, 12);
      ctx.closePath();
      ctx.fillStyle = "#f5f3ff";
      ctx.fill();
      ctx.strokeStyle = "#8b5cf6";
      ctx.lineWidth = 2;
      ctx.stroke();

      if (keys["ArrowUp"]) {
        ctx.beginPath();
        ctx.moveTo(-5, 12);
        ctx.lineTo(0, 20 + Math.random() * 8);
        ctx.lineTo(5, 12);
        ctx.closePath();
        ctx.fillStyle = "#f59e0b";
        ctx.fill();
      }
      ctx.restore();
    }

    var scoreEl = document.getElementById("ast-score");
    if (scoreEl) scoreEl.textContent = String(score);
  }

  function loop(now) {
    if (!running) return;
    var dt = Math.min(0.033, (now - last) / 1000 || 0);
    last = now;
    update(dt);
    draw();
    raf = requestAnimationFrame(loop);
  }

  document.addEventListener("keydown", function (e) {
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (!e.key || e.key.length !== 1) return;
    seq = (seq + e.key.toLowerCase()).slice(-8);
    if (seq.indexOf("alist") >= 0) {
      seq = "";
      start();
    }
  });

  window.addEventListener("load", function () {
    if (window.location.search.indexOf("game=1") >= 0) {
      setTimeout(start, 300);
    }
  });

  window.__alistAsteroids = start;
})();
