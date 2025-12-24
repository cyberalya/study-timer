// ================== ELEMENT ==================
const timerEl = document.getElementById("timer");
const modeContainer = document.getElementById("modeContainer");
const controlContainer = document.getElementById("controlContainer");
const resetBtn = document.getElementById("resetBtn");

const currentSongEl = document.getElementById("currentSong");
const queueListEl = document.getElementById("queueList");
const queueContainer = document.getElementById("queueContainer");
const stopAlarmBtn = document.getElementById("stopAlarmBtn");

// ================== TIMER ==================
let duration = 25 * 60;
let interval = null;
let wasMusicPlaying = false;

function updateDisplay() {
  const m = Math.floor(duration / 60);
  const s = duration % 60;
  timerEl.textContent = `${m}:${s.toString().padStart(2, "0")}`;
}

document.querySelectorAll(".mode-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    duration = btn.dataset.time * 60;
    updateDisplay();
    modeContainer.style.display = "none";
    controlContainer.style.display = "flex";
    startTimer();
  });
});

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

resetBtn.onclick = () => {
  clearInterval(interval);
  duration = 25 * 60;
  updateDisplay();
  modeContainer.style.display = "flex";
  controlContainer.style.display = "none";
};

// ================== ALARM ==================
const alarm = new Audio(
  "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
);

function timeUp() {
  wasMusicPlaying = !music.paused;
  music.pause();

  alarm.loop = true;
  alarm.play();
  stopAlarmBtn.classList.remove("hidden");

  if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("⏰ Waktu Habis!", {
      body: "Sesi belajar selesai 👏"
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

// ================== MUSIC ==================
let queue = [];
let currentIndex = -1;

const music = new Audio();
music.addEventListener("ended", nextSong);

// === ADD SONG BUTTON (AUTO CREATE, AMAN) ===
const addBtn = document.createElement("button");
addBtn.textContent = "+ Add Song";
addBtn.style.marginTop = "10px";

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "audio/*";
fileInput.hidden = true;

document.querySelector(".music-container").appendChild(addBtn);
document.querySelector(".music-container").appendChild(fileInput);

addBtn.onclick = () => fileInput.click();

fileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  queue.push({
    name: file.name,
    url: URL.createObjectURL(file)
  });

  if (currentIndex === -1) {
    playSong(0);
  } else {
    renderQueue();
  }
};

// ================== MUSIC CONTROL ==================
function playSong(index) {
  if (!queue[index]) return;
  currentIndex = index;
  music.src = queue[index].url;
  music.play();
  currentSongEl.textContent = queue[index].name;
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
  if (!music.src) return;
  music.paused ? music.play() : music.pause();
};

document.getElementById("nextSong").onclick = nextSong;
document.getElementById("prevSong").onclick = prevSong;

document.getElementById("queueToggle").onclick = () => {
  queueContainer.classList.toggle("hidden");
};

// ================== QUEUE ==================
function renderQueue() {
  queueListEl.innerHTML = "";
  queue.forEach((song, i) => {
    const li = document.createElement("li");
    li.textContent = song.name;
    if (i === currentIndex) li.style.fontWeight = "bold";
    li.onclick = () => playSong(i);
    queueListEl.appendChild(li);
  });
}

// ================== INIT ==================
updateDisplay();
