// ================= ELEMENT =================
const timerEl = document.getElementById("timer");
const modeContainer = document.getElementById("modeContainer");
const controlContainer = document.getElementById("controlContainer");

const currentSongEl = document.getElementById("currentSong");
const queueListEl = document.getElementById("queueList");
const queueContainer = document.getElementById("queueContainer");

const stopAlarmBtn = document.getElementById("stopAlarmBtn");

// ================= TIMER =================
let duration = 1500;
let interval = null;
let wasMusicPlaying = false;

function updateDisplay() {
  const m = Math.floor(duration / 60);
  const s = duration % 60;
  timerEl.textContent = `${m}:${s.toString().padStart(2, "0")}`;
}

document.querySelectorAll(".mode-btn").forEach(btn => {
  btn.onclick = () => {
    duration = btn.dataset.time * 60;
    updateDisplay();
    modeContainer.style.display = "none";
    controlContainer.style.display = "flex";
    startTimer();
  };
});

document.getElementById("resetBtn").onclick = () => {
  clearInterval(interval);
  duration = 1500;
  updateDisplay();
  modeContainer.style.display = "flex";
  controlContainer.style.display = "none";
};

function startTimer() {
  clearInterval(interval);
  interval = setInterval(() => {
    duration--;
    updateDisplay();
    if (duration <= 0) {
      clearInterval(interval);
      timeUp();
    }
  }, 1000);
}

// ================= ALARM =================
const alarm = new Audio(
  "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
);

function timeUp() {
  wasMusicPlaying = !music.paused;
  music.pause();

  alarm.loop = true;
  alarm.play();
  stopAlarmBtn.classList.remove("hidden");

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("⏰ Waktu Habis!", {
      body: "Sesi selesai. Istirahat dulu 👀"
    });
  }
}

stopAlarmBtn.onclick = () => {
  alarm.pause();
  alarm.currentTime = 0;
  stopAlarmBtn.classList.add("hidden");

  if (wasMusicPlaying) {
    setTimeout(() => music.play(), 2000);
  }
};

// ================= MUSIC =================
let queue = [];
let currentIndex = -1;
const music = new Audio();

music.onended = nextSong;

function playSong(i) {
  if (!queue[i]) return;
  currentIndex = i;
  music.src = queue[i].url;
  music.play();
  currentSongEl.textContent = queue[i].name;
  renderQueue();
}

function nextSong() {
  if (!queue.length) return;
  currentIndex = (currentIndex + 1) % queue.length;
  playSong(currentIndex);
}

function prevSong() {
  if (!queue.length) return;
  currentIndex = (currentIndex - 1 + queue.length) % queue.length;
  playSong(currentIndex);
}

document.getElementById("playPause").onclick = () => {
  music.paused ? music.play() : music.pause();
};

document.getElementById("nextSong").onclick = nextSong;
document.getElementById("prevSong").onclick = prevSong;

document.getElementById("queueToggle").onclick = () => {
  queueContainer.classList.toggle("hidden");
};

// ================= QUEUE =================
function renderQueue() {
  queueListEl.innerHTML = "";
  queue.forEach((song, i) => {
    const li = document.createElement("li");
    li.className = i === currentIndex ? "active" : "";
    li.textContent = song.name;
    li.onclick = () => playSong(i);
    queueListEl.appendChild(li);
  });
}

updateDisplay();
