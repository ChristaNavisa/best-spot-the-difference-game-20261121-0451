/* Sound effects for Three Little Worlds: tiny WebAudio synth, no audio files. */
(function (global) {
  'use strict';

  var ctx = null;
  var muted = false;

  function ensureCtx() {
    if (!ctx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, startAt, dur, type, vol) {
    var ac = ensureCtx();
    if (!ac || muted) return;
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ac.currentTime + startAt);
    gain.gain.setValueAtTime(0.0001, ac.currentTime + startAt);
    gain.gain.exponentialRampToValueAtTime(vol || 0.12, ac.currentTime + startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + startAt + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + startAt);
    osc.stop(ac.currentTime + startAt + dur + 0.05);
  }

  var SoundFX = {
    isMuted: function () { return muted; },
    toggleMute: function () {
      muted = !muted;
      return muted;
    },
    /* A satisfying two-note chime when a difference is found. */
    found: function () {
      tone(660, 0, 0.16, 'sine', 0.14);
      tone(990, 0.09, 0.24, 'sine', 0.14);
      tone(1320, 0.18, 0.18, 'triangle', 0.06);
    },
    /* A soft low buzz for a wrong click. */
    wrong: function () {
      tone(140, 0, 0.18, 'sawtooth', 0.07);
      tone(110, 0.1, 0.2, 'sawtooth', 0.06);
    },
    /* A short sparkle when a hint is used. */
    hint: function () {
      tone(1180, 0, 0.1, 'sine', 0.08);
      tone(1560, 0.07, 0.14, 'sine', 0.08);
    },
    /* A little arpeggio when a level is cleared. */
    win: function () {
      var notes = [523, 659, 784, 1047];
      for (var i = 0; i < notes.length; i++) tone(notes[i], i * 0.11, 0.22, 'triangle', 0.12);
    },
    /* A descending sigh when time runs out. */
    lose: function () {
      tone(392, 0, 0.25, 'triangle', 0.1);
      tone(311, 0.2, 0.3, 'triangle', 0.1);
      tone(233, 0.4, 0.45, 'triangle', 0.1);
    },
    click: function () {
      tone(880, 0, 0.06, 'square', 0.04);
    }
  };

  global.SoundFX = SoundFX;
})(window);
