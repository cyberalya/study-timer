// ================== ELEMENT ==================
const timerEl = document.getElementById("timer");
const modeContainer = document.getElementById("modeContainer");
const controlContainer = document.getElementById("controlContainer");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

const currentSongEl = document.getElementById("currentSong");
const queueContainer = document.getElementById("queueContainer");
const queueListEl = document.getElementById("queueList");

const addSongBtn = document.getElementById("addSongBtn");
const musicInput = document.getElementById("musicInput");

const stopAlarmBtn = document.getElementById("stopAlarmBtn");

// ================== TIMER ==================
let duration = 25 * 60;
let interval = null;
let isPaused = false;
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
    isPaused = false;
    stopBtn.textContent = "Stop";
    modeContainer.style.display = "none";
    controlContainer.style.display = "flex";
    startTimer();
  };
});

function startTimer() {
  clearInterval(interval);
  interval = setInterval(() => {
    if (!isPaused) {
      duration--;
      updateDisplay();
      if (duration <= 0) {
        clearInterval(interval);
        timeUp();
      }
    }
  }, 1000);
}

stopBtn.onclick = () => {
  isPaused = !isPaused;
  stopBtn.textContent = isPaused ? "Resume" : "Stop";
};

resetBtn.onclick = () => {
  clearInterval(interval);
  duration = 25 * 60;
  updateDisplay();
  isPaused = false;
  stopBtn.textContent = "Stop";
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

music.onended = nextSong;

addSongBtn.onclick = () => musicInput.click();

musicInput.onchange = () => {
  const files = [...musicInput.files];

  files.forEach(file => {
    queue.push({
      name: file.name,
      url: URL.createObjectURL(file)
    });
  });

  if (currentIndex === -1 && queue.length > 0) {
    playSong(0);
  } else {
    renderQueue();
  }

  musicInput.value = "";
};

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

// ================== QUEUE + DELETE ==================
function deleteSong(index) {
  if (index === currentIndex) {
    music.pause();
  }

  queue.splice(index, 1);

  if (queue.length === 0) {
    currentIndex = -1;
    music.src = "";
    currentSongEl.textContent = "No song playing";
  } else if (index < currentIndex) {
    currentIndex--;
  } else if (index === currentIndex) {
    currentIndex = currentIndex % queue.length;
    playSong(currentIndex);
  }

  renderQueue();
}

function renderQueue() {
  queueListEl.innerHTML = "";
  queue.forEach((song, i) => {
    const li = document.createElement("li");
    li.className = i === currentIndex ? "active" : "";

    const title = document.createElement("span");
    title.textContent = song.name;
    title.onclick = () => playSong(i);

    const del = document.createElement("button");
    del.textContent = "❌";
    del.style.marginLeft = "8px";
    del.onclick = (e) => {
      e.stopPropagation();
      deleteSong(i);
    };

    li.appendChild(title);
    li.appendChild(del);
    queueListEl.appendChild(li);
  });
}

// ================== INIT ==================
updateDisplay();
