/* Game engine for Three Little Worlds: state, clicks, timer, hints, score.
 * Knows nothing about the DOM except through the callbacks the renderer
 * installs (onHud, onToast, onOverlay). Panels are 600 x 400 logical px. */
(function (global) {
  'use strict';

  var CLICK_RADIUS = 30;
  var WRONG_PENALTY_SEC = 3;
  var HINTS_PER_LEVEL = 3;
  var HINT_MS = 2600;

  var state = {
    screen: 'menu', // menu | playing | levelDone | gameDone | timeUp
    levelIndex: 0,
    found: [], // diff ids found in the current level
    hintsLeft: HINTS_PER_LEVEL,
    hinted: null, // {diff, until} while a hint ring is shown
    timeLeft: 0,
    score: 0,
    combo: 0,
    bestCombo: 0,
    levelScores: [],
    completed: [false, false, false],
    muted: false,
    startedAt: 0,
    lastTick: 0
  };

  var listeners = { hud: [], toast: [], overlay: [], redraw: [] };

  function on(event, fn) {
    listeners[event].push(fn);
  }

  function emit(event, data) {
    for (var i = 0; i < listeners[event].length; i++) listeners[event][i](data);
  }

  function level() {
    return global.LEVELS[state.levelIndex];
  }

  function remaining() {
    return level().diffs.length - state.found.length;
  }

  function isFound(id) {
    return state.found.indexOf(id) !== -1;
  }

  function startLevel(index) {
    state.levelIndex = index;
    state.found = [];
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hinted = null;
    state.timeLeft = level().timeLimit;
    state.combo = 0;
    state.screen = 'playing';
    state.startedAt = Date.now();
    state.lastTick = Date.now();
    emit('overlay', null);
    emit('hud');
    emit('redraw');
  }

  function showMenu() {
    state.screen = 'menu';
    emit('overlay', { kind: 'menu' });
    emit('hud');
  }

  function foundDiff(diff) {
    return { id: diff.id, x: diff.x, y: diff.y, label: diff.label };
  }

  /* A click at panel coordinates (x, y) on either panel. Returns what happened. */
  function clickAt(x, y) {
    if (state.screen !== 'playing') return { result: 'ignored' };
    var diffs = level().diffs;
    var best = null;
    var bestDist = Infinity;
    for (var i = 0; i < diffs.length; i++) {
      var d = diffs[i];
      if (isFound(d.id)) continue;
      var dx = x - d.x;
      var dy = y - d.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = d;
      }
    }
    if (best && bestDist <= CLICK_RADIUS) {
      state.found.push(best.id);
      state.combo++;
      if (state.combo > state.bestCombo) state.bestCombo = state.combo;
      var gained = 100 + (state.combo - 1) * 25;
      state.score += gained;
      global.SoundFX.found();
      emit('redraw');
      emit('hud');
      if (remaining() === 0) {
        var timeBonus = Math.round(state.timeLeft) * 2;
        state.score += timeBonus;
        state.completed[state.levelIndex] = true;
        state.levelScores[state.levelIndex] = gained;
        state.screen = 'levelDone';
        global.SoundFX.win();
        emit('hud');
        emit('overlay', {
          kind: 'levelDone',
          level: level(),
          timeBonus: timeBonus,
          score: state.score,
          last: state.levelIndex === global.LEVELS.length - 1
        });
        return { result: 'found', diff: foundDiff(best), gained: gained, levelDone: true };
      }
      emit('toast', '+' + gained + '  ' + best.label + '!');
      return { result: 'found', diff: foundDiff(best), gained: gained };
    }
    // A miss: small time penalty, combo resets.
    state.combo = 0;
    state.timeLeft = Math.max(0, state.timeLeft - WRONG_PENALTY_SEC);
    global.SoundFX.wrong();
    emit('hud');
    emit('toast', 'Not quite — minus ' + WRONG_PENALTY_SEC + 's');
    return { result: 'miss', x: x, y: y };
  }

  function useHint() {
    if (state.screen !== 'playing') return null;
    if (state.hintsLeft <= 0) {
      emit('toast', 'No hints left!');
      return null;
    }
    var unfound = [];
    for (var i = 0; i < level().diffs.length; i++) {
      if (!isFound(level().diffs[i].id)) unfound.push(level().diffs[i]);
    }
    if (unfound.length === 0) return null;
    var pick = unfound[Math.floor(Math.random() * unfound.length)];
    state.hintsLeft--;
    state.hinted = { diff: pick, until: Date.now() + HINT_MS };
    global.SoundFX.hint();
    emit('hud');
    emit('redraw');
    emit('toast', 'Hint: look near the ' + pick.label.toLowerCase());
    return pick;
  }

  function tick() {
    if (state.screen !== 'playing') return;
    var now = Date.now();
    var dt = (now - state.lastTick) / 1000;
    state.lastTick = now;
    state.timeLeft -= dt;
    if (state.hinted && now > state.hinted.until) {
      state.hinted = null;
      emit('redraw');
    }
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = 'timeUp';
      global.SoundFX.lose();
      emit('hud');
      emit('overlay', {
        kind: 'timeUp',
        level: level(),
        found: state.found.length,
        total: level().diffs.length
      });
      return;
    }
    emit('hud');
  }

  function nextLevel() {
    if (state.levelIndex + 1 < global.LEVELS.length) {
      startLevel(state.levelIndex + 1);
    } else {
      state.screen = 'gameDone';
      global.SoundFX.win();
      emit('overlay', {
        kind: 'gameDone',
        score: state.score,
        bestCombo: state.bestCombo,
        levels: global.LEVELS.map(function (lv, i) {
          return { name: lv.name, diffs: lv.diffs.length, done: state.completed[i] };
        })
      });
      emit('hud');
    }
  }

  function restartLevel() {
    startLevel(state.levelIndex);
  }

  function formatTime(sec) {
    var s = Math.max(0, Math.ceil(sec));
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  /* Debug / automation hook used by the screenshot script: real clicks go
   * through clickAt with panel coordinates, this only exposes the state. */
  global.SpotEngine = {
    state: state,
    on: on,
    level: level,
    remaining: remaining,
    isFound: isFound,
    startLevel: startLevel,
    showMenu: showMenu,
    clickAt: clickAt,
    useHint: useHint,
    tick: tick,
    nextLevel: nextLevel,
    restartLevel: restartLevel,
    formatTime: formatTime,
    CLICK_RADIUS: CLICK_RADIUS,
    HINTS_PER_LEVEL: HINTS_PER_LEVEL
  };
})(window);
