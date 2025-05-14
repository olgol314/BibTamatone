const pressedKeys = new Set();
const activeSources = new Map(); // 키에 대응하는 재생 노드 저장
const context = new (window.AudioContext || window.webkitAudioContext)();
let sharedBuffer = null;

const playbackRates = {
  1: { natural: 0.8909, sharp: 0.9439 },  // C, C#
  2: { natural: 1.0, sharp: 1.0595 },     // D, D#
  3: { natural: 1.1225, sharp: null },    // E, no E#
  4: { natural: 1.1892, sharp: 1.2599 },  // F, F#
  5: { natural: 1.3348, sharp: 1.4142 },  // G, G#
  6: { natural: 1.4983, sharp: 1.5874 },  // A, A#
  7: { natural: 1.6818, sharp: null },    // B, no B#
  8: { natural: 1.7818, sharp: 1.8877 },  // C', C#'
  9: { natural: 2.0, sharp: 2.1190 },     // D', D#'
  0: { natural: 2.2449, sharp: null },    // E', no E#'
};




function isPlayableKey(key) {
  return Object.keys(playbackRates).includes(key);
}


document.addEventListener("keydown", (e) => {
  const key = e.key;

  // 기본적인 조건 필터
  if (!pressedKeys.has(key) && isPlayableKey(key)) {
    pressedKeys.add(key);

    const isSharp = e.code === "Space" || e.getModifierState("Shift");

    playSound(key, isSharp);
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


function setKeyVisual(key, active) {
  const el = document.querySelector(`#keyboard-visualizer span[data-key="${key}"]`);
  if (el) {
    if (active) {
      el.classList.add("active");
    } else {
      el.classList.remove("active");
    }
  }
}


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

function playSound(key, isSharp = false) {
  const rates = playbackRates[key];
  if (!rates) return;

  const rate = isSharp ? rates.sharp : rates.natural;
  if (!rate) return;  // 유효하지 않은 샵 음은 무시

  const source = context.createBufferSource();
  source.buffer = sharedBuffer;
  source.playbackRate.value = rate;
  source.connect(context.destination);
  source.start();
  activeSources.set(key, source);
}


function animateOtamatone(open) {
  const otamatone = document.getElementById("otamatone");
  if (open) {
    otamatone.src = "images/otamatone_open.png";   // 입 연 이미지
  } else {
    otamatone.src = "images/otamatone_closed.png"; // 입 닫은 이미지
  }
}


// 첫 로딩 시 오디오 버퍼 미리 로드
loadBuffer();
