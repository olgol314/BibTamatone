const pressedKeys = new Set();
const activeSources = new Map(); // 키에 대응하는 재생 노드 저장
const context = new (window.AudioContext || window.webkitAudioContext)();
let sharedBuffer = null;

const playbackRates = {
  1: 0.7491, // 기준음보다 -4 반음
  2: 0.8409, // 기준음보다 -2 반음
  3: 1.0, // 기준음 (Base pitch)
  4: 1.1225, // 기준음보다 +2 반음
  5: 1.2599, // 기준음보다 +4 반음
  6: 1.3348, // +5 반음
  7: 1.4142, // +6 반음
  8: 1.4983, // +7 반음
  9: 1.5874, // +8 반음
  0: 1.6818, // +9 반음
};

document.addEventListener("keydown", (e) => {
  const key = e.key;
  if (!pressedKeys.has(key) && isPlayableKey(key)) {
    pressedKeys.add(key);
    playSound(key);
    animateOtamatone();
  }
});

document.addEventListener("keyup", (e) => {
  const key = e.key;
  pressedKeys.delete(key);

  if (activeSources.has(key)) {
    const source = activeSources.get(key);
    source.stop();
    activeSources.delete(key);
  }
});

function isPlayableKey(key) {
  return Object.keys(playbackRates).includes(key);
}

function loadBuffer() {
  return fetch("sounds/base_note.mp3")
    .then((res) => res.arrayBuffer())
    .then((data) => context.decodeAudioData(data))
    .then((buffer) => {
      sharedBuffer = buffer;
    });
}

function playSound(key) {
  if (!sharedBuffer) return;

  const source = context.createBufferSource();
  source.buffer = sharedBuffer;
  source.playbackRate.value = playbackRates[key];
  source.connect(context.destination);
  source.start();
  activeSources.set(key, source);
}

function animateOtamatone() {
  const otamatone = document.getElementById("otamatone");
  otamatone.classList.add("playing");
  setTimeout(() => otamatone.classList.remove("playing"), 150);
}

// 첫 로딩 시 오디오 버퍼 미리 로드
loadBuffer();
