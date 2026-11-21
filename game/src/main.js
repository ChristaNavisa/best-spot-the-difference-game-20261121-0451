/* Bootstrap for Three Little Worlds: wires mouse and keyboard input to the
 * engine, buttons and overlay actions to the renderer, and exposes a small
 * read-only debug hook (window.__spot) for play-testing and screenshots. */
(function (global) {
  'use strict';

  var engine = global.SpotEngine;
  var render = global.SpotRenderer;
  var W = global.SCENE_PANEL_W;
  var H = global.SCENE_PANEL_H;

  var canvasL = render.canvases.left;
  var canvasR = render.canvases.right;
  var btnHint = document.getElementById('btn-hint');
  var btnMute = document.getElementById('btn-mute');
  var btnMenu = document.getElementById('btn-menu');
  var overlayCard = document.getElementById('overlay-card');

  /* Map a mouse event on a panel canvas to 600 x 400 panel coordinates. */
  function panelCoords(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = (event.clientX - rect.left) * (W / rect.width);
    var y = (event.clientY - rect.top) * (H / rect.height);
    return { x: x, y: y };
  }

  function handleCanvasClick(canvas, event) {
    var pos = panelCoords(canvas, event);
    var outcome = engine.clickAt(pos.x, pos.y);
    if (outcome.result === 'found') {
      render.addBurst(outcome.diff.x, outcome.diff.y);
    } else if (outcome.result === 'miss') {
      canvas.classList.remove('shake');
      void canvas.offsetWidth; // restart the shake animation
      canvas.classList.add('shake');
    }
  }

  canvasL.addEventListener('click', function (e) { handleCanvasClick(canvasL, e); });
  canvasR.addEventListener('click', function (e) { handleCanvasClick(canvasR, e); });

  btnHint.addEventListener('click', function () {
    engine.useHint();
  });

  btnMute.addEventListener('click', function () {
    var muted = global.SoundFX.toggleMute();
    btnMute.textContent = muted ? '\uD83D\uDD07' : '\uD83D\uDD0A';
    btnMute.title = muted ? 'Sound off — click to turn on (M)' : 'Sound on — click to mute (M)';
  });

  btnMenu.addEventListener('click', function () {
    engine.showMenu();
  });

  overlayCard.addEventListener('click', function (event) {
    var btn = event.target.closest('[data-action]');
    if (!btn) return;
    var action = btn.getAttribute('data-action');
    global.SoundFX.click();
    if (action === 'play') engine.startLevel(0);
    else if (action === 'play-level') engine.startLevel(parseInt(btn.getAttribute('data-level'), 10));
    else if (action === 'next') engine.nextLevel();
    else if (action === 'finish') engine.nextLevel();
    else if (action === 'replay') engine.restartLevel();
    else if (action === 'menu') engine.showMenu();
  });

  document.addEventListener('keydown', function (event) {
    if (event.repeat) return;
    var key = event.key.toLowerCase();
    if (key === 'h') {
      engine.useHint();
    } else if (key === 'r') {
      if (engine.state.screen === 'playing' || engine.state.screen === 'timeUp') engine.restartLevel();
    } else if (key === 'm') {
      var muted = global.SoundFX.toggleMute();
      btnMute.textContent = muted ? '\uD83D\uDD07' : '\uD83D\uDD0A';
    } else if (key === 'escape') {
      engine.showMenu();
    } else if (key === '1' || key === '2' || key === '3') {
      var idx = parseInt(key, 10) - 1;
      if (idx < global.LEVELS.length) engine.startLevel(idx);
    } else if (key === 'enter') {
      if (engine.state.screen === 'menu') engine.startLevel(0);
      else if (engine.state.screen === 'levelDone') engine.nextLevel();
    }
  });

  /* Engine events -> renderer. */
  engine.on('hud', render.updateHud);
  engine.on('toast', render.showToast);
  engine.on('overlay', render.showOverlay);
  engine.on('redraw', render.markDirty);

  /* Read-only debug hook for play-testing and screenshots. */
  global.__spot = {
    engine: engine,
    state: engine.state,
    levels: global.LEVELS,
    panelSize: { w: W, h: H },
    canvasRects: function () {
      var rl = canvasL.getBoundingClientRect();
      var rr = canvasR.getBoundingClientRect();
      return {
        left: { x: rl.left, y: rl.top, w: rl.width, h: rl.height },
        right: { x: rr.left, y: rr.top, w: rr.width, h: rr.height }
      };
    },
    startLevel: function (i) { engine.startLevel(i); },
    clickAt: function (x, y) { return engine.clickAt(x, y); },
    hint: function () { return engine.useHint(); }
  };

  /* Boot: paint the first level behind the menu so the menu already shows
   * the game, then show the menu overlay. */
  engine.startLevel(0);
  engine.state.screen = 'menu';
  render.drawAll();
  render.updateHud();
  engine.showMenu();
  render.startLoop();
})(window);
