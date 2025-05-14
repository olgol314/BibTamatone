const pressedKeys = new Set();
const activeSources = new Map(); // 키에 대응하는 재생 노드 저장
const context = new (window.AudioContext || window.webkitAudioContext)();
let sharedBuffer = null;

const playbackRates = {
  1: 0.5946,  // C
  q: 0.6299,  // C#
  2: 0.6674,  // D
  w: 0.7071,  // D#
  3: 0.7491,  // E
  4: 0.7943,  // F
  r: 0.8414,  // F#
  5: 0.8909,  // G
  t: 0.9439,  // G#
  6: 1.0,     // A
  y: 1.0595,  // A#
  7: 1.1225,  // B
  8: 1.1892   // High C
};


function isPlayableKey(key) {
  return Object.keys(playbackRates).includes(key);
}


document.addEventListener("keydown", (e) => {
  const key = e.key;
  if (!pressedKeys.has(key) && isPlayableKey(key)) {
    pressedKeys.add(key);
    playSound(key);
    animateOtamatone(true); // 입을 연다
  }
  setKeyVisual(key, true);
});

document.addEventListener("keyup", (e) => {

  const key = e.key;
  pressedKeys.delete(key);

  if (activeSources.has(key)) {
    const source = activeSources.get(key);
    source.stop();
    activeSources.delete(key);
  }

  if (pressedKeys.size === 0) {
    animateOtamatone(false); // 모든 키가 떼졌을 때 입을 닫는다
  }

  setKeyVisual(key, false);
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

function playSound(key) {
  if (!sharedBuffer) return;

  const source = context.createBufferSource();
  source.buffer = sharedBuffer;
  source.playbackRate.value = playbackRates[key];
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
