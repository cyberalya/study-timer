// ================= ELEMENT =================
const timerEl = document.getElementById("timer");
const options = document.getElementById("options");
const controls = document.getElementById("controls");
const musicInput = document.getElementById("musicInput");
const currentSongEl = document.getElementById("currentSong");
const queueListEl = document.getElementById("queueList");
const queueContainer = document.getElementById("queueContainer");

// ================= TIMER STATE =================
let duration = 1500;
let interval = null;
let wasMusicPlaying = false;

// ================= MUSIC STATE =================
let queue = [];
let currentIndex = -1;

const music = new Audio();
music.addEventListener("ended", nextSong);

// ================= ALARM =================
const alarm = new Audio(
  "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg"
);

// ================= NOTIFICATION =================
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// ================= TIMER =================
function updateDisplay() {
  const m = Math.floor(duration / 60);
  const s = duration % 60;
  timerEl.textContent = `${m}:${s.toString().padStart(2, "0")}`;
}

function setTimer(min) {
  clearInterval(interval);
  duration = min * 60;
  updateDisplay();
  options.style.display = "none";
  controls.style.display = "block";
  startTimer();
}

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

function timeUp() {
  wasMusicPlaying = !music.paused;
  music.pause();

  alarm.loop = true;
  alarm.play();

  if (Notification.permission === "granted") {
    new Notification("⏰ Waktu Habis!", {
      body: "Sesi belajar selesai. Waktunya istirahat 💆‍♀️",
    });
  }
}

function stopAlarm() {
  alarm.pause();
  alarm.currentTime = 0;

  if (wasMusicPlaying) {
    setTimeout(() => {
      music.play();
    }, 2000);
  }
}

function resetTimer() {
  clearInterval(interval);
  duration = 1500;
  updateDisplay();
  options.style.display = "block";
  controls.style.display = "none";
}

// ================= MUSIC INPUT =================
musicInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  queue.push({
    name: file.name,
    url: URL.createObjectURL(file),
  });

  if (currentIndex === -1) {
    currentIndex = 0;
    playSong(currentIndex);
  }

  renderQueue();
});

// ================= MUSIC CONTROL =================
function playSong(index) {
  if (!queue[index]) return;
  currentIndex = index;
  music.src = queue[index].url;
  music.play();
  currentSongEl.textContent = queue[index].name;
  renderQueue();
}

function nextSong() {
  if (queue.length === 0) return;
  currentIndex = (currentIndex + 1) % queue.length;
  playSong(currentIndex);
}

function prevSong() {
  if (queue.length === 0) return;
  currentIndex =
    (currentIndex - 1 + queue.length) % queue.length;
  playSong(currentIndex);
}

// ================= DELETE SONG =================
function deleteSong(index) {
  if (index === currentIndex) {
    music.pause();
  }

  queue.splice(index, 1);

  if (queue.length === 0) {
    currentIndex = -1;
    music.src = "";
    currentSongEl.textContent = "Tidak ada lagu";
  } else if (index < currentIndex) {
    currentIndex--;
  } else if (index === currentIndex) {
    currentIndex = currentIndex % queue.length;
    playSong(currentIndex);
  }

  renderQueue();
}

// ================= RENDER QUEUE =================
function renderQueue() {
  queueListEl.innerHTML = "";

  queue.forEach((song, i) => {
    const li = document.createElement("li");
    li.className = "queue-item";

    if (i === currentIndex) {
      li.classList.add("active");
    }

    const title = document.createElement("span");
    title.textContent = song.name;
    title.onclick = () => playSong(i);

    const del = document.createElement("button");
    del.textContent = "❌";
    del.onclick = () => deleteSong(i);

    li.appendChild(title);
    li.appendChild(del);
    queueListEl.appendChild(li);
  });
}

// ================= UI BUTTON =================
document.getElementById("queueToggle").onclick = () => {
  queueContainer.classList.toggle("hidden");
};

document.getElementById("nextSong").onclick = nextSong;
document.getElementById("prevSong").onclick = prevSong;

document.getElementById("playPause").onclick = () => {
  if (music.paused) music.play();
  else music.pause();
};

// ================= INIT =================
updateDisplay();
