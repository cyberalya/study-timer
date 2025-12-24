/* =====================
   ELEMENTS
===================== */
const timerEl = document.getElementById("timer");
const modeContainer = document.querySelector(".mode-container");
const modeBtns = document.querySelectorAll(".mode-btn");

const stopBtn = document.getElementById("stopBtn");
const resetBtn = document.getElementById("resetBtn");

stopBtn.textContent = "Start";
resetBtn.style.display = "none";

/* =====================
   TIMER STATE
===================== */
let duration = 25 * 60;
let timeLeft = duration;
let timer = null;
let isRunning = false;

/* =====================
   TIMER FUNCTIONS
===================== */
function format(sec) {
  return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

function render() {
  timerEl.textContent = format(timeLeft);
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;

  modeContainer.style.display = "none";
  stopBtn.textContent = "Pause";
  resetBtn.style.display = "inline-block";

  timer = setInterval(() => {
    timeLeft--;
    render();
    if (timeLeft <= 0) finishTimer();
  }, 1000);
}

function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  stopBtn.textContent = "Resume";
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  timeLeft = duration;
  render();

  modeContainer.style.display = "flex";
  stopBtn.textContent = "Start";
  resetBtn.style.display = "none";
}

/* =====================
   TIMER EVENTS
===================== */
stopBtn.onclick = () => {
  if (!isRunning && stopBtn.textContent === "Start") startTimer();
  else if (isRunning) pauseTimer();
  else startTimer();
};

resetBtn.onclick = resetTimer;

/* =====================
   MODE BUTTONS
===================== */
modeBtns.forEach(btn => {
  btn.onclick = () => {
    modeBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    duration = btn.dataset.time * 60;
    timeLeft = duration;
    render();
  };
});

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
    new Notification("⏰ Timer selesai!");
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
   MUSIC + QUEUE (SAVE)
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
let queue = JSON.parse(localStorage.getItem("queue")) || [];
let currentIndex = -1;

function saveQueue() {
  localStorage.setItem("queue", JSON.stringify(queue));
}

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
      queue.splice(i, 1);
      saveQueue();
      renderQueue();
    };

    li.appendChild(del);
    queueList.appendChild(li);
  });
}

function playSong(i) {
  currentIndex = i;
  audio.src = queue[i].url;
  audio.play();
  playPauseBtn.textContent = "⏸";
  currentSongEl.textContent = queue[i].name;
  renderQueue();
}

addSongBtn.onclick = () => musicInput.click();

musicInput.onchange = () => {
  [...musicInput.files].forEach(file => {
    queue.push({
      name: file.name,
      url: URL.createObjectURL(file)
    });
  });
  saveQueue();
  renderQueue();
  if (currentIndex === -1 && queue.length) playSong(0);
};

playPauseBtn.onclick = () => {
  if (!audio.src) return;
  audio.paused ? audio.play() : audio.pause();
  playPauseBtn.textContent = audio.paused ? "▶" : "⏸";
};

nextBtn.onclick = () => playSong((currentIndex + 1) % queue.length);
prevBtn.onclick = () => playSong((currentIndex - 1 + queue.length) % queue.length);

queueToggle.onclick = () => queueContainer.classList.toggle("hidden");

render();
renderQueue();

if ("Notification" in window) Notification.requestPermission();
