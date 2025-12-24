/* =====================
   TIMER
===================== */
const timerEl = document.getElementById("timer");
const modeContainer = document.querySelector(".mode-container");
const modeBtns = document.querySelectorAll(".mode-btn");
const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

let duration = 25 * 60;
let timeLeft = duration;
let timer = null;
let isRunning = false;

function format(sec) {
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

function renderTimer() {
  timerEl.textContent = format(timeLeft);
}

renderTimer();

/* mode */
modeBtns.forEach(btn => {
  btn.onclick = () => {
    if (isRunning) return;
    modeBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    duration = btn.dataset.time * 60;
    timeLeft = duration;
    renderTimer();
  };
});

/* start / pause / resume */
stopBtn.onclick = () => {
  if (!isRunning && stopBtn.textContent === "Start") {
    modeContainer.style.display = "none";
    resetBtn.style.display = "inline-block";
    stopBtn.textContent = "Pause";
    startTimer();
  } 
  else if (isRunning) {
    pauseTimer();
  } 
  else {
    stopBtn.textContent = "Pause";
    startTimer();
  }
};

resetBtn.onclick = () => {
  clearInterval(timer);
  isRunning = false;
  timeLeft = duration;
  renderTimer();
  stopBtn.textContent = "Start";
  resetBtn.style.display = "none";
  modeContainer.style.display = "flex";
};

function startTimer() {
  isRunning = true;
  timer = setInterval(() => {
    timeLeft--;
    renderTimer();
    if (timeLeft <= 0) finishTimer();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  stopBtn.textContent = "Resume";
}

/* =====================
   ALARM
===================== */
const alarm = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
const stopAlarmBtn = document.getElementById("stopAlarmBtn");

function finishTimer() {
  clearInterval(timer);
  isRunning = false;

  audio.pause();
  alarm.loop = true;
  alarm.play();
  stopAlarmBtn.classList.remove("hidden");

  if (Notification.permission === "granted") {
    new Notification("⏰ Waktu habis!");
  }
}

stopAlarmBtn.onclick = () => {
  alarm.pause();
  alarm.currentTime = 0;
  stopAlarmBtn.classList.add("hidden");

  setTimeout(() => {
    if (currentIndex !== -1) audio.play();
  }, 1500);
};

/* =====================
   MUSIC PLAYER + QUEUE
===================== */
const addSongBtn = document.getElementById("addSongBtn");
const musicInput = document.getElementById("musicInput");
const playPauseBtn = document.getElementById("playPause");
const nextBtn = document.getElementById("nextSong");
const prevBtn = document.getElementById("prevSong");
const currentSongEl = document.getElementById("currentSong");
const queueToggle = document.getElementById("queueToggle");
const queueContainer = document.getElementById("queueContainer");
const queueList = document.getElementById("queueList");

let audio = new Audio();
let queue = [];
let currentIndex = -1;

/* add song */
addSongBtn.onclick = () => musicInput.click();

musicInput.onchange = () => {
  [...musicInput.files].forEach(file => {
    queue.push({
      name: file.name,
      url: URL.createObjectURL(file)
    });
  });
  renderQueue();
  if (currentIndex === -1 && queue.length > 0) playSong(0);
};

/* play song (FIX) */
function playSong(i) {
  if (!queue[i]) return;

  audio.pause();
  audio.currentTime = 0;

  currentIndex = i;
  audio.src = queue[i].url;
  audio.play();

  currentSongEl.textContent = queue[i].name;
  playPauseBtn.textContent = "⏸";
  renderQueue();
}

/* play / pause */
playPauseBtn.onclick = () => {
  if (!audio.src) return;
  if (audio.paused) {
    audio.play();
    playPauseBtn.textContent = "⏸";
  } else {
    audio.pause();
    playPauseBtn.textContent = "▶";
  }
};

/* next / prev */
nextBtn.onclick = () => {
  if (!queue.length) return;
  playSong((currentIndex + 1) % queue.length);
};

prevBtn.onclick = () => {
  if (!queue.length) return;
  playSong((currentIndex - 1 + queue.length) % queue.length);
};

/* AUTO NEXT (FIX UTAMA) */
audio.addEventListener("ended", () => {
  if (!queue.length) return;
  if (currentIndex >= queue.length - 1) {
    playSong(0);
  } else {
    playSong(currentIndex + 1);
  }
});

/* queue toggle */
queueToggle.onclick = () => {
  queueContainer.classList.toggle("hidden");
};

/* render queue (FIX HAPUS LAGU) */
function renderQueue() {
  queueList.innerHTML = "";

  queue.forEach((song, i) => {
    const li = document.createElement("li");
    li.textContent = song.name;
    if (i === currentIndex) li.classList.add("active");

    li.onclick = () => playSong(i);

    const del = document.createElement("button");
    del.textContent = "✖";
    del.onclick = e => {
      e.stopPropagation();

      const wasPlaying = i === currentIndex;
      queue.splice(i, 1);

      if (!queue.length) {
        audio.pause();
        audio.src = "";
        currentIndex = -1;
        currentSongEl.textContent = "No song playing";
      } 
      else if (wasPlaying) {
        currentIndex = i >= queue.length ? 0 : i;
        playSong(currentIndex);
      } 
      else if (i < currentIndex) {
        currentIndex--;
      }

      renderQueue();
    };

    li.appendChild(del);
    queueList.appendChild(li);
  });
}

/* notif permission */
if ("Notification" in window) Notification.requestPermission();
