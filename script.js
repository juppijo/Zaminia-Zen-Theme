const $ = (sel) => document.querySelector(sel);

/* Buttons */
const btnTheme = $("#btnTheme");
const btnFullscreen = $("#btnFullscreen");
const btnNextQuote = $("#btnNextQuote");
const btnCopy = $("#btnCopy");
const btnToast = $("#btnToast");
const btnBreath = $("#btnBreath");
const btnReset = $("#btnReset");
const btnRitual = $("#btnRitual");

/* Toast */
const toast = $("#toast");
let toastTimer = null;

/* Sliders */
const hueSlider = $("#hueSlider");
const satSlider = $("#satSlider");
const lightSlider = $("#lightSlider");

const hueValue = $("#hueValue");
const satValue = $("#satValue");
const lightValue = $("#lightValue");

/* Quote */
const quoteEl = $("#quote");

/* Breath */
const breathCircle = $("#breathCircle");
const breathLabel = $("#breathLabel");
let breathing = false;

/* Ritual */
const ritualOverlay = $("#ritualOverlay");
const ritualText = $("#ritualText");
const ritualSub = $("#ritualSub");
const bowlAudio = $("#bowlAudio");

/* Quotes (German paraphrases / common translations) */
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

function showToast(msg="🌿 Ruhe…") {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* Theme */
function setTheme(theme) {
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    btnTheme.textContent = "☀️ Light";
  } else {
    document.documentElement.removeAttribute("data-theme");
    btnTheme.textContent = "🌙 Dark";
  }
  localStorage.setItem("zen_theme", theme);
}
function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  setTheme(isDark ? "light" : "dark");
  showToast(isDark ? "☀️ Light Mode" : "🌙 Dark Mode");
}

/* Fullscreen */
async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      btnFullscreen.textContent = "⛶ Exit";
      showToast("⛶ Vollbild aktiviert");
    } else {
      await document.exitFullscreen();
      btnFullscreen.textContent = "⛶ Vollbild";
      showToast("⛶ Vollbild beendet");
    }
  } catch {
    showToast("⚠️ Vollbild nicht möglich");
  }
}

/* Quote */
function randomQuote() {
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  quoteEl.textContent = q;
  showToast("✨ Ein Satz – ein Atemzug.");
}
async function copyQuote() {
  try {
    await navigator.clipboard.writeText(quoteEl.textContent.trim());
    showToast("📋 Zitat kopiert");
  } catch {
    showToast("⚠️ Kopieren nicht möglich");
  }
}

/* Relative palette controls: H / S / L */
function setHue(h){
  document.documentElement.style.setProperty("--h", String(h));
  hueValue.textContent = `${h}°`;
  localStorage.setItem("zen_h", String(h));
}
function setSat(s){
  document.documentElement.style.setProperty("--s", `${s}%`);
  satValue.textContent = `${s}%`;
  localStorage.setItem("zen_s", String(s));
}
function setLight(l){
  document.documentElement.style.setProperty("--l", `${l}%`);
  lightValue.textContent = `${l}%`;
  localStorage.setItem("zen_l", String(l));
}

/* Reset */
function resetAll(){
  const defaults = { h: 180, s: 28, l: 58 };
  hueSlider.value = defaults.h;
  satSlider.value = defaults.s;
  lightSlider.value = defaults.l;

  setHue(defaults.h);
  setSat(defaults.s);
  setLight(defaults.l);

  showToast("↺ Reset auf Zen-Türkis");
}

/* Ripple */
function attachRipple(btn) {
  btn.addEventListener("click", (e) => {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";

    btn.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  });
}

/* Breathing */
function toggleBreath(){
  breathing = !breathing;
  breathCircle.classList.toggle("breathing", breathing);
  breathLabel.textContent = breathing ? "Ein… Aus…" : "Ruhe";
  showToast(breathing ? "🌿 Atme weich" : "🕊️ Pause");
}

/* Ritual: Klangschale + Fade to Night */
async function playBowl(){
  if (!bowlAudio) return;
  try{
    bowlAudio.currentTime = 0;
    bowlAudio.volume = 0.85;
    await bowlAudio.play();
  }catch{
    // If autoplay is blocked or file missing: ignore
  }
}

function stopBowlSoft(){
  if (!bowlAudio) return;
  try{
    // Soft fade out
    const start = bowlAudio.volume ?? 0.85;
    const steps = 18;
    let i = 0;
    const timer = setInterval(()=>{
      i++;
      const v = Math.max(0, start * (1 - i/steps));
      bowlAudio.volume = v;
      if (i >= steps){
        clearInterval(timer);
        bowlAudio.pause();
      }
    }, 90);
  }catch{}
}

function openRitual(){
  ritualOverlay.classList.add("show");
  ritualOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeRitual(){
  ritualOverlay.classList.remove("show");
  ritualOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

async function startRitual(){
  showToast("🌙 Abschlussritual…");

  // Make it dark automatically
  setTheme("dark");

  // Breath off for calm
  breathing = false;
  breathCircle.classList.remove("breathing");
  breathLabel.textContent = "Stille";

  ritualText.textContent = "Danke…";
  ritualSub.textContent = "Atme aus und lass los.";

  openRitual();
  await playBowl();

  // After a moment show a second line
  setTimeout(()=>{
    ritualText.textContent = "Gute Nacht";
    ritualSub.textContent = "Mögest du Frieden in dir finden.";
  }, 2400);
}

/* Exit ritual on click / ESC */
function ritualExit(){
  stopBowlSoft();
  closeRitual();
  showToast("🕊️ Ritual beendet");
}

/* Init */
(function init(){
  // Load theme
  const savedTheme = localStorage.getItem("zen_theme");
  if (savedTheme === "dark") setTheme("dark");

  // Load HSL
  const savedH = localStorage.getItem("zen_h");
  const savedS = localStorage.getItem("zen_s");
  const savedL = localStorage.getItem("zen_l");

  if (savedH) hueSlider.value = savedH;
  if (savedS) satSlider.value = savedS;
  if (savedL) lightSlider.value = savedL;

  setHue(parseInt(hueSlider.value, 10));
  setSat(parseInt(satSlider.value, 10));
  setLight(parseInt(lightSlider.value, 10));

  hueSlider.addEventListener("input", () => setHue(parseInt(hueSlider.value, 10)));
  satSlider.addEventListener("input", () => setSat(parseInt(satSlider.value, 10)));
  lightSlider.addEventListener("input", () => setLight(parseInt(lightSlider.value, 10)));

  // Presets (only hue changes)
  document.querySelectorAll(".preset").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const h = parseInt(btn.dataset.h, 10);
      hueSlider.value = h;
      setHue(h);
      showToast("🎨 Neue Stimmung");
    });
  });

  // Buttons
  btnTheme.addEventListener("click", toggleTheme);
  btnFullscreen.addEventListener("click", toggleFullscreen);
  btnNextQuote.addEventListener("click", randomQuote);
  btnCopy.addEventListener("click", copyQuote);
  btnToast.addEventListener("click", ()=> showToast("🔔 Achtsamkeit ist schon der Weg."));
  btnBreath.addEventListener("click", toggleBreath);
  btnReset.addEventListener("click", resetAll);
  btnRitual.addEventListener("click", startRitual);

  // Ripple
  document.querySelectorAll("button.btn").forEach(attachRipple);

  // Fullscreen change
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) btnFullscreen.textContent = "⛶ Vollbild";
  });

  // Ritual exit
  ritualOverlay.addEventListener("click", ritualExit);
  document.addEventListener("keydown", (e)=>{
    if (e.key === "Escape" && ritualOverlay.classList.contains("show")){
      ritualExit();
    }
  });
})();
