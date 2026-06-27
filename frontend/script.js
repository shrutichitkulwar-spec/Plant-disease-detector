const API_URL = "http://localhost:8000/predict";

// ── Elements ────────────────────────────────────────────────────────────────
const dropZone    = document.getElementById("dropZone");
const fileInput   = document.getElementById("fileInput");
const placeholder = document.getElementById("placeholder");
const browseBtn   = document.getElementById("browseBtn");
const preview     = document.getElementById("preview");
const analyzeBtn  = document.getElementById("analyzeBtn");
const btnText     = document.getElementById("btnText");
const btnSpinner  = document.getElementById("btnSpinner");
const resetBtn    = document.getElementById("resetBtn");
const resultCard  = document.getElementById("resultCard");
const diseaseName = document.getElementById("diseaseName");
const confPercent = document.getElementById("confPercent");
const confBar     = document.getElementById("confBar");
const allPredsList= document.getElementById("allPredsList");

let selectedFile = null;

// ── Upload Triggers ──────────────────────────────────────────────────────────
dropZone.addEventListener("click", (e) => {
  if (e.target === browseBtn || dropZone.contains(e.target)) fileInput.click();
});
browseBtn.addEventListener("click", (e) => { e.stopPropagation(); fileInput.click(); });
fileInput.addEventListener("change", () => { if (fileInput.files[0]) handleFile(fileInput.files[0]); });

// ── Drag & Drop ──────────────────────────────────────────────────────────────
dropZone.addEventListener("dragover",  (e) => { e.preventDefault(); dropZone.classList.add("dragging"); });
dropZone.addEventListener("dragleave", ()  => dropZone.classList.remove("dragging"));
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragging");
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

// ── Handle Selected File ─────────────────────────────────────────────────────
function handleFile(file) {
  if (!file.type.startsWith("image/")) return;

  selectedFile = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result;
    preview.hidden = false;
    placeholder.hidden = true;
  };
  reader.readAsDataURL(file);

  analyzeBtn.disabled = false;
  resetBtn.hidden = false;
  hideResult();
}

// ── Analyze Button ───────────────────────────────────────────────────────────
analyzeBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  setLoading(true);
  hideResult();

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await fetch(API_URL, { method: "POST", body: formData });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Server error" }));
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    showResult(data);

  } catch (err) {
    console.error("Prediction error:", err);
  } finally {
    setLoading(false);
  }
});

// ── Reset ────────────────────────────────────────────────────────────────────
resetBtn.addEventListener("click", () => {
  selectedFile = null;
  fileInput.value = "";
  preview.src = "";
  preview.hidden = true;
  placeholder.hidden = false;
  analyzeBtn.disabled = true;
  resetBtn.hidden = true;
  hideResult();
});

// ── Show Result ──────────────────────────────────────────────────────────────
function showResult(data) {
  diseaseName.textContent = data.disease;
  confPercent.textContent = data.confidence + "%";

  requestAnimationFrame(() => {
    setTimeout(() => { confBar.style.width = data.confidence + "%"; }, 80);
  });

  allPredsList.innerHTML = "";

  // Use detections array from backend
  const entries = data.detections && data.detections.length > 0
    ? data.detections.map(d => [d.disease, d.confidence])
    : [[data.disease, data.confidence]];

  entries.forEach(([name, score], idx) => {
    const row = document.createElement("div");
    row.className = "pred-row" + (idx === 0 ? " top" : "");
    row.style.animationDelay = `${idx * 80}ms`;

    const nameEl = document.createElement("span");
    nameEl.className = "pred-name";
    nameEl.textContent = name;

    const miniWrap = document.createElement("div");
    miniWrap.className = "pred-mini-bar-wrap";
    const miniBar = document.createElement("div");
    miniBar.className = "pred-mini-bar";
    miniWrap.appendChild(miniBar);

    const scoreEl = document.createElement("span");
    scoreEl.className = "pred-score";
    scoreEl.textContent = score + "%";

    row.appendChild(nameEl);
    row.appendChild(miniWrap);
    row.appendChild(scoreEl);
    allPredsList.appendChild(row);

    requestAnimationFrame(() => {
      setTimeout(() => { miniBar.style.width = score + "%"; }, 150 + idx * 80);
    });
  });

  resultCard.hidden = false;
  setTimeout(() => {
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function hideResult() {
  resultCard.hidden = true;
  confBar.style.width = "0%";
}

function setLoading(on) {
  analyzeBtn.disabled = on;
  btnText.textContent = on ? "Analyzing…" : "Analyze Leaf";
  btnSpinner.hidden = !on;
}