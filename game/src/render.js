/* Renderer for Three Little Worlds: paints both panels, the found markers,
 * the hint ring, the HUD and the overlay screens. Panels are 600 x 400
 * logical pixels, backed by a 1200 x 800 canvas for crisp screenshots. */
(function (global) {
  'use strict';

  var W = global.SCENE_PANEL_W;
  var H = global.SCENE_PANEL_H;
  var SCALE = 2;

  var canvasL = document.getElementById('canvas-left');
  var canvasR = document.getElementById('canvas-right');
  var ctxL = canvasL.getContext('2d');
  var ctxR = canvasR.getContext('2d');

  var hudLevel = document.getElementById('hud-level');
  var hudLevelName = document.getElementById('hud-level-name');
  var hudRemaining = document.getElementById('hud-remaining');
  var hudTime = document.getElementById('hud-time');
  var hudScore = document.getElementById('hud-score');
  var hudCombo = document.getElementById('hud-combo');
  var hudHints = document.getElementById('hud-hints');
  var timerFill = document.getElementById('timer-fill');
  var timerBox = document.querySelector('.timer-box');
  var btnHint = document.getElementById('btn-hint');
  var levelDots = document.getElementById('level-dots');
  var toastEl = document.getElementById('toast');
  var overlayEl = document.getElementById('overlay');
  var overlayCard = document.getElementById('overlay-card');

  var toastTimer = null;
  var bursts = []; // {x, y, born} expanding rings after a find
  var dirty = true;

  function markDirty() {
    dirty = true;
  }

  /* Draw one panel: the scene, then a marker ring on every found difference,
   * then the pulsing hint ring, then the short-lived burst rings. */
  function drawPanel(ctx, side) {
    var engine = global.SpotEngine;
    var st = engine.state;
    var lv = engine.level();
    ctx.save();
    ctx.clearRect(0, 0, W * SCALE, H * SCALE);
    ctx.scale(SCALE, SCALE);
    lv.draw(ctx, side);
    // Found markers: a bold ring plus a check, on BOTH panels.
    for (var i = 0; i < st.found.length; i++) {
      var diff = null;
      for (var j = 0; j < lv.diffs.length; j++) {
        if (lv.diffs[j].id === st.found[i]) diff = lv.diffs[j];
      }
      if (!diff) continue;
      ctx.strokeStyle = '#ffcf4d';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#2b2118';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#ffcf4d';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, 26, 0, Math.PI * 2);
      ctx.stroke();
      // Check mark
      ctx.strokeStyle = '#1e7d32';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(diff.x - 11, diff.y);
      ctx.lineTo(diff.x - 3, diff.y + 9);
      ctx.lineTo(diff.x + 12, diff.y - 9);
      ctx.stroke();
    }
    // Hint ring: a dashed pulsing circle around the hinted difference.
    if (st.hinted) {
      var hd = st.hinted.diff;
      var pulse = 1 + 0.12 * Math.sin(Date.now() / 120);
      ctx.strokeStyle = '#ff6b5e';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(hd.x, hd.y, 30 * pulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    // Burst rings from recent finds.
    var now = Date.now();
    bursts = bursts.filter(function (b) { return now - b.born < 650; });
    for (var k = 0; k < bursts.length; k++) {
      var b = bursts[k];
      var age = (now - b.born) / 650;
      ctx.globalAlpha = 1 - age;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(b.x, b.y, 26 + age * 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawAll() {
    drawPanel(ctxL, 0);
    drawPanel(ctxR, 1);
    dirty = false;
  }

  function addBurst(x, y) {
    bursts.push({ x: x, y: y, born: Date.now() });
    markDirty();
  }

  function updateHud() {
    var engine = global.SpotEngine;
    var st = engine.state;
    var lv = engine.level();
    hudLevel.textContent = (st.levelIndex + 1) + ' / ' + global.LEVELS.length;
    hudLevelName.textContent = lv.name;
    hudRemaining.textContent = engine.remaining();
    hudTime.textContent = engine.formatTime(st.timeLeft);
    hudScore.textContent = st.score;
    hudCombo.textContent = st.combo >= 2 ? 'Combo x' + st.combo : '';
    hudHints.textContent = st.hintsLeft;
    btnHint.disabled = st.hintsLeft <= 0 || st.screen !== 'playing';
    var frac = st.timeLeft / lv.timeLimit;
    timerFill.style.width = Math.max(0, frac * 100) + '%';
    timerBox.classList.toggle('low', frac < 0.25 && st.screen === 'playing');
    var dots = '';
    for (var i = 0; i < global.LEVELS.length; i++) {
      var cls = st.completed[i] ? 'dot done' : (i === st.levelIndex ? 'dot current' : 'dot');
      dots += '<span class="' + cls + '">' + (st.completed[i] ? '&#10003;' : (i + 1)) + '</span>';
    }
    levelDots.innerHTML = dots;
  }

  function showToast(text) {
    toastEl.textContent = text;
    toastEl.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 1600);
  }

  function levelCard(lv, index) {
    return '<li>' + (index + 1) + '. ' + lv.name +
      ' <b>' + lv.diffs.length + ' differences &middot; ' +
      global.SpotEngine.formatTime(lv.timeLimit) + '</b></li>';
  }

  function showOverlay(data) {
    if (!data) {
      overlayEl.hidden = true;
      return;
    }
    var html = '';
    if (data.kind === 'menu') {
      var list = '';
      for (var i = 0; i < global.LEVELS.length; i++) list += levelCard(global.LEVELS[i], i);
      html =
        '<h2>&#9678; Three Little Worlds</h2>' +
        '<p>Two pictures. Almost the same. Find every difference before the clock runs out — ' +
        'some are hiding in plain sight, and some are only a shade apart.</p>' +
        '<ul class="level-list">' + list + '</ul>' +
        '<div class="howto"><b>How to play</b><ul>' +
        '<li>Click a difference on <b>either</b> picture — it gets circled on both.</li>' +
        '<li>A wrong click costs 3 seconds. A streak of finds builds a combo bonus.</li>' +
        '<li>Stuck? Press <b>H</b> for a hint (3 per level). <b>R</b> restarts the level.</li>' +
        '</ul></div>' +
        '<button class="menu-btn" data-action="play">Start level 1</button>' +
        '<button class="menu-btn ghost" data-action="play-level" data-level="1">Harbor</button>' +
        '<button class="menu-btn ghost" data-action="play-level" data-level="2">Night Market</button>';
    } else if (data.kind === 'levelDone') {
      var stars = data.timeBonus >= 200 ? '&#9733;&#9733;&#9733;' : (data.timeBonus >= 80 ? '&#9733;&#9733;' : '&#9733;');
      html =
        '<div class="stars">' + stars + '</div>' +
        '<h2>Level complete!</h2>' +
        '<p>You found all <b>' + data.level.diffs.length + '</b> differences in <b>' + data.level.name + '</b>.</p>' +
        '<p>Time bonus: <b>+' + data.timeBonus + '</b></p>' +
        '<p class="big-score">' + data.score + '</p>' +
        '<p>total score</p>' +
        (data.last
          ? '<button class="menu-btn" data-action="finish">See your results</button>'
          : '<button class="menu-btn" data-action="next">Next level &rsaquo;</button>') +
        '<button class="menu-btn ghost" data-action="replay">Replay level</button>';
    } else if (data.kind === 'timeUp') {
      html =
        '<h2>Out of time!</h2>' +
        '<p>The clock beat you in <b>' + data.level.name + '</b> — you found ' +
        '<b>' + data.found + ' of ' + data.total + '</b> differences.</p>' +
        '<p>Tip: the quiet corners hide the best differences. Try the hint key <b>H</b> earlier.</p>' +
        '<button class="menu-btn" data-action="replay">Try again</button>' +
        '<button class="menu-btn ghost" data-action="menu">Back to menu</button>';
    } else if (data.kind === 'gameDone') {
      var rows = '';
      for (var li = 0; li < data.levels.length; li++) {
        rows += '<li>' + data.levels[li].name + ' <b>' +
          (data.levels[li].done ? data.levels[li].diffs + ' / ' + data.levels[li].diffs + ' found' : 'not finished') +
          '</b></li>';
      }
      html =
        '<div class="stars">&#9733;&#9733;&#9733;</div>' +
        '<h2>You found them all!</h2>' +
        '<p>All three little worlds, every last difference. Sharp eyes!</p>' +
        '<ul class="level-list">' + rows + '</ul>' +
        '<p>Best combo: <b>x' + data.bestCombo + '</b></p>' +
        '<p class="big-score">' + data.score + '</p>' +
        '<p>final score</p>' +
        '<button class="menu-btn" data-action="menu">Back to menu</button>' +
        '<button class="menu-btn ghost" data-action="play">Play again</button>';
    }
    overlayCard.innerHTML = html;
    overlayEl.hidden = false;
  }

  /* The animation loop: redraw panels when dirty or while a hint/burst
   * animates, and tick the engine clock once a second-ish via rAF. */
  var lastHudSecond = -1;
  function frame() {
    var engine = global.SpotEngine;
    var st = engine.state;
    if (st.screen === 'playing') {
      engine.tick();
      var sec = Math.ceil(st.timeLeft);
      if (sec !== lastHudSecond) {
        lastHudSecond = sec;
        updateHud();
      }
      if (st.hinted || bursts.length > 0) markDirty();
    }
    if (dirty) drawAll();
    requestAnimationFrame(frame);
  }

  global.SpotRenderer = {
    drawAll: drawAll,
    markDirty: markDirty,
    addBurst: addBurst,
    updateHud: updateHud,
    showToast: showToast,
    showOverlay: showOverlay,
    startLoop: function () { requestAnimationFrame(frame); },
    canvases: { left: canvasL, right: canvasR }
  };
})(window);
