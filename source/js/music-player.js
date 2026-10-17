(function () {
  "use strict";

  if (window.__alistMusicLoaded) return;
  window.__alistMusicLoaded = true;

  var root = document.createElement("div");
  root.id = "alist-music";
  root.innerHTML =
    '<button id="alist-music-toggle" type="button" aria-label="播放环境音乐"><span class="alist-music-icon">▶</span></button>' +
    '<div class="alist-music-info"><strong>ALIST RADIO</strong><span>星尘 · 环境音</span></div>' +
    '<div class="alist-music-eq" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
    '<input id="alist-music-volume" type="range" min="0" max="100" value="32" aria-label="音量">';
  document.body.appendChild(root);

  var toggle = document.getElementById("alist-music-toggle");
  var icon = toggle.querySelector(".alist-music-icon");
  var volume = document.getElementById("alist-music-volume");

  var audio = null;
  var master = null;
  var timer = 0;
  var chordIndex = 0;
  var playing = false;
  var chords = [
    [146.83, 174.61, 220.0, 293.66],
    [116.54, 146.83, 174.61, 233.08],
    [87.31, 110.0, 130.81, 174.61],
    [130.81, 164.81, 196.0, 261.63]
  ];

  function ensureAudio() {
    if (audio) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    audio = new AC();
    master = audio.createGain();
    master.gain.value = (Number(volume.value) / 100) * 0.34;
    var filter = audio.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1500;
    filter.Q.value = 0.4;
    var compressor = audio.createDynamicsCompressor();
    master.connect(filter);
    filter.connect(compressor);
    compressor.connect(audio.destination);
  }

  function playChord() {
    if (!audio || !playing) return;
    var now = audio.currentTime;
    var chord = chords[chordIndex % chords.length];
    chordIndex++;
    for (var i = 0; i < chord.length; i++) {
      var osc = audio.createOscillator();
      var gain = audio.createGain();
      osc.type = i % 2 ? "triangle" : "sine";
      osc.frequency.value = chord[i];
      osc.detune.value = (i - 1.5) * 4;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.055, now + 2.2);
      gain.gain.setValueAtTime(0.055, now + 5.4);
      gain.gain.linearRampToValueAtTime(0, now + 8.4);
      osc.connect(gain);
      gain.connect(master);
      osc.start(now);
      osc.stop(now + 8.6);
    }
  }

  function start() {
    ensureAudio();
    if (!audio) return;
    if (audio.state === "suspended") audio.resume();
    playing = true;
    root.classList.add("is-playing");
    icon.textContent = "Ⅱ";
    toggle.setAttribute("aria-label", "暂停环境音乐");
    playChord();
    clearInterval(timer);
    timer = setInterval(playChord, 8000);
  }

  function pause() {
    playing = false;
    root.classList.remove("is-playing");
    icon.textContent = "▶";
    toggle.setAttribute("aria-label", "播放环境音乐");
    clearInterval(timer);
    timer = 0;
    if (audio && audio.state === "running") audio.suspend();
  }

  toggle.addEventListener("click", function () {
    if (playing) pause();
    else start();
  });

  volume.addEventListener("input", function () {
    if (!master) return;
    master.gain.setTargetAtTime((Number(volume.value) / 100) * 0.34, audio.currentTime, 0.08);
  });
})();
