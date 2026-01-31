const $ = (sel) => document.querySelector(sel);

/* UI Elemente */
const btnTheme = $("#btnTheme");
const btnFullscreen = $("#btnFullscreen");
const btnNextQuote = $("#btnNextQuote");
const btnCopy = $("#btnCopy");
const btnBreath = $("#btnBreath");
const btnReset = $("#btnReset");
const btnRitual = $("#btnRitual");
const btnMusic = $("#btnMusic");

/* Settings Modal Elemente */
const btnSettings = $("#btnSettings");
const btnCloseSettings = $("#btnCloseSettings");
const settingsModal = $("#settingsModal");

/* Sliders & Values */
const hueSlider = $("#hueSlider");
const satSlider = $("#satSlider");
const lightSlider = $("#lightSlider");
const timerSlider = $("#timerSlider");

const hueValue = $("#hueValue");
const satValue = $("#satValue");
const lightValue = $("#lightValue");
const timerValue = $("#timerValue");

/* Audio & Timer Status */
const bowlAudio = $("#bowlAudio");
const meditationAudio = $("#meditationAudio");
const breathCircle = $("#breathCircle");
const breathLabel = $("#breathLabel");
const quoteEl = $("#quote");
const toast = $("#toast");
const ritualOverlay = $("#ritualOverlay");
const ritualText = $("#ritualText");
const ritualSub = $("#ritualSub");

const btnPause = $("#btnPause");
const btnToggleBowl = $("#btnToggleBowl");

/* GLOBALE STATUS VARIABLEN */
let breathing = false;
let isMusicPlaying = false; // Musik-Master-Schalter
let isBowlEnabled = true;   // Bowl-Sub-Schalter
let isPaused = false;
let countdownInterval = null;
let timeLeft = 180;
let toastTimer = null;

// Timer Anzeige dynamisch erstellen
const timerDisplay = document.createElement("div");
timerDisplay.className = "timer-display";
if(breathCircle) breathCircle.before(timerDisplay);

const quotes = [
  "„Atme ein, und ich beruhige Körper und Geist. Atme aus, und ich lächle.“",
  "„Der gegenwärtige Moment ist voller Freude und Glück. Wenn du achtsam bist, wirst du es sehen.“",
  "„Frieden ist jeder Schritt.“",
  "„Wenn du wirklich da bist, ist alles da.“",
  "„Lass los. Nicht um etwas zu verlieren – sondern um frei zu sein.“",
  "„Das Wunder ist nicht, über Wasser zu gehen. Das Wunder ist, auf der Erde zu gehen.“",
  "„Gefühle kommen und gehen wie Wolken am Himmel. Bewusstes Atmen ist mein Anker.“",
  "„Wenn wir unseren Geist beruhigen, wird unsere Welt klar.“"
];

/* --- FUNKTIONEN --- */

function showToast(msg="🌿 Ruhe…") {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function openSettings() {
  settingsModal.classList.add("open");
  settingsModal.setAttribute("aria-hidden", "false");
}

function closeSettings() {
  settingsModal.classList.remove("open");
  settingsModal.setAttribute("aria-hidden", "true");
}

function setTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    btnTheme.textContent = "☀️ Light";
  } else {
    document.documentElement.removeAttribute("data-theme");
    btnTheme.textContent = "🌙 Dark";
  }
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  setTheme(isDark ? "light" : "dark");
}

async function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    btnFullscreen.textContent = "⛶ Exit";
  } else {
    document.exitFullscreen();
    btnFullscreen.textContent = "⛶ Vollbild";
  }
}

function setHue(h){ document.documentElement.style.setProperty("--h", h); hueValue.textContent = h + "°"; }
function setSat(s){ document.documentElement.style.setProperty("--s", s + "%"); satValue.textContent = s + "%"; }
function setLight(l){ document.documentElement.style.setProperty("--l", l + "%"); lightValue.textContent = l + "%"; }

function resetAll(){
  setHue(180); setSat(50); setLight(50);
  hueSlider.value = 180; satSlider.value = 50; lightSlider.value = 50;
  showToast("↺ Reset");
}

function randomQuote() {
  quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
}

/* AUDIO LOGIK */

function toggleMusic() {
  if (!meditationAudio) return;
  isMusicPlaying = !isMusicPlaying;

  if (isMusicPlaying) {
    meditationAudio.play().catch(() => console.log("Start blockiert"));
    btnMusic.textContent = "🎶 Musik: An";
    btnMusic.classList.add("btn-primary");
  } else {
    meditationAudio.pause();
    meditationAudio.currentTime = 0;
    btnMusic.textContent = "🎵 Musik: Aus";
    btnMusic.classList.remove("btn-primary");
    // Falls Musik aus, stoppe auch sofort einen eventuell laufenden Bowl-Ton
    if(bowlAudio) { bowlAudio.pause(); bowlAudio.currentTime = 0; }
  }
}

function toggleBowlSetting() {
  isBowlEnabled = !isBowlEnabled;
  if (isBowlEnabled) {
    btnToggleBowl.textContent = "✓ Bowl: An";
    btnToggleBowl.classList.replace("btn-soft", "btn-success");
  } else {
    btnToggleBowl.textContent = "✕ Bowl: Aus";
    btnToggleBowl.classList.replace("btn-success", "btn-soft");
  }
}

/* TIMER & ATMUNG */

function updateTimerDisplay(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  timerDisplay.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
}

function startTimer(isResuming = false) {
  clearInterval(countdownInterval);
  timerDisplay.classList.add("active");
  
  // Schale nur, wenn Master-Musik AN und Bowl-Sub AN
  if (isMusicPlaying && isBowlEnabled && bowlAudio && !isResuming) { 
    bowlAudio.currentTime = 0; 
    bowlAudio.play().catch(e => console.log("Audio blockiert")); 
  }
  
  // Musik starten, falls sie durch toggleMusic() vorbereitet wurde
  if (isMusicPlaying && meditationAudio && meditationAudio.paused) {
    meditationAudio.play().catch(e => console.log("Musik blockiert"));
  }

  countdownInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay(timeLeft);
    if (timeLeft <= 0) stopTimer(true);
  }, 1000);
}

function stopTimer(withEndSound = false) {
  clearInterval(countdownInterval);
  breathing = false;
  isPaused = false;
  
  if (meditationAudio) { meditationAudio.pause(); meditationAudio.currentTime = 0; }
  
  breathCircle.classList.remove("breathing");
  breathCircle.style.animationPlayState = "running";
  breathLabel.textContent = "Ruhe";
  timerDisplay.classList.remove("active");

  // MASTER-REGEL: End-Gong NUR wenn Musik-Button auf AN steht
  if (withEndSound && isMusicPlaying && isBowlEnabled && bowlAudio) { 
    bowlAudio.currentTime = 0; 
    bowlAudio.play(); 
  }
}

function toggleBreath() {
  if (isPaused) { togglePause(); return; } 
  
  breathing = !breathing;
  if (breathing) {
    // NEU: Wenn Musik noch aus ist, schalte sie jetzt ein
    if (!isMusicPlaying) {
      toggleMusic(); 
    }

    timeLeft = timerSlider.value * 60;
    updateTimerDisplay(timeLeft);
    breathCircle.classList.add("breathing");
    breathLabel.textContent = "Ein… Aus…";
    startTimer();
  } else {
    stopTimer();
  }
}

function togglePause() {
  if (!breathing) return;
  isPaused = !isPaused;

  if (isPaused) {
    clearInterval(countdownInterval);
    if (meditationAudio) meditationAudio.pause();
    if (bowlAudio) { bowlAudio.pause(); } // Bowl sofort stoppen bei Pause
    btnPause.textContent = "▶ Weiter";
    btnPause.classList.replace("btn-danger", "btn-success");
    breathCircle.style.animationPlayState = "paused";
    breathLabel.textContent = "Pause...";
  } else {
    if (isMusicPlaying && meditationAudio) meditationAudio.play();
    btnPause.textContent = "✕ Pause";
    btnPause.classList.replace("btn-success", "btn-danger");
    breathCircle.style.animationPlayState = "running";
    breathLabel.textContent = "Ein… Aus…";
    startTimer(true); // Fortsetzen ohne Start-Gong
  }
}

async function startRitual(){
  setTheme("dark");
  ritualOverlay.classList.add("show");
  // MASTER-REGEL: Ritual-Ton NUR wenn Musik-Button auf AN steht
  if (isMusicPlaying && bowlAudio) { 
    bowlAudio.currentTime = 0; 
    bowlAudio.play(); 
  }
}

function attachRipple(btn) {
  btn.addEventListener("click", (e) => {
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

/* --- INIT --- */
(function init(){
  btnTheme.addEventListener("click", toggleTheme);
  btnMusic.addEventListener("click", toggleMusic);
  btnSettings.addEventListener("click", openSettings);
  btnCloseSettings.addEventListener("click", closeSettings);
  btnFullscreen.addEventListener("click", toggleFullscreen);
  btnNextQuote.addEventListener("click", randomQuote);
  btnBreath.addEventListener("click", toggleBreath);
  btnReset.addEventListener("click", resetAll);
  btnRitual.addEventListener("click", startRitual);
  btnPause.addEventListener("click", togglePause);
  btnToggleBowl.addEventListener("click", toggleBowlSetting);

  hueSlider.addEventListener("input", () => setHue(hueSlider.value));
  satSlider.addEventListener("input", () => setSat(satSlider.value));
  lightSlider.addEventListener("input", () => setLight(lightSlider.value));
  timerSlider.addEventListener("input", () => {
    timerValue.textContent = `${timerSlider.value} Min.`;
  });

  document.querySelectorAll(".preset").forEach(btn => {
    btn.addEventListener("click", () => {
      hueSlider.value = btn.dataset.h;
      setHue(btn.dataset.h);
    });
  });

  ritualOverlay.addEventListener("click", () => ritualOverlay.classList.remove("show"));
  document.querySelectorAll("button.btn").forEach(attachRipple);
})();