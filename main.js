/ TFT Item Quiz - main.js (supports optional icons in data.js)
// Requires:
// - index.html has: #components, #options, #feedback, #nextBtn, #scoreText
// - data.js defines: const tftData = { components: [...], combined: [...] }
// - Each item can optionally have: icon: "https://..."

let score = 0;
let total = 0;

let currentAnswerId = null;
let answered = false;

const componentsDiv = document.getElementById("components");
const optionsDiv = document.getElementById("options");
const feedbackDiv = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const scoreText = document.getElementById("scoreText");

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getComponentById(id) {
  return tftData.components.find(c => c.id === id) || { id, name: id };
}

function getCombinedById(id) {
  return tftData.combined.find(i => i.id === id) || { id, name: id, components: [] };
}

function makeItemBox({ name, icon }, onClick) {
  const box = document.createElement("div");
  box.className = "item-box";

  // If your CSS supports images, it will show nicely; otherwise it's fine.
  if (icon) {
    const img = document.createElement("img");
    img.src = icon;
    img.alt = name || "";
    img.loading = "lazy";
    // if icon link broken, fallback to text-only
    img.onerror = () => img.remove();
    box.appendChild(img);
  }

  const text = document.createElement("div");
  text.textContent = name || "";
  box.appendChild(text);

  if (typeof onClick === "function") {
    box.addEventListener("click", onClick);
  }
  return box;
}

function setFeedback(text, type) {
  // type: "correct" | "wrong" | ""
  feedbackDiv.textContent = text || "";
  feedbackDiv.classList.remove("correct", "wrong");
  if (type === "correct") feedbackDiv.classList.add("correct");
  if (type === "wrong") feedbackDiv.classList.add("wrong");
}

function setNextEnabled(enabled) {
  if (enabled) nextBtn.classList.remove("disabled");
  else nextBtn.classList.add("disabled");
}

function lockOptions() {
  const boxes = optionsDiv.querySelectorAll(".item-box");
  boxes.forEach(b => b.classList.add("disabled"));
}

function unlockOptions() {
  const boxes = optionsDiv.querySelectorAll(".item-box");
  boxes.forEach(b => b.classList.remove("disabled"));
}

function updateScore() {
  scoreText.textContent = `得分：${score} / ${total}`;
}

function createQuestion() {
  // basic safety checks
  if (!window.tftData || !Array.isArray(tftData.components) || !Array.isArray(tftData.combined)) {
    setFeedback("資料載入失敗：請檢查 data.js", "wrong");
    return;
  }
  if (tftData.combined.length < 2) {
    setFeedback("合成裝備數量不足（combined 太少）", "wrong");
    return;
  }

  answered = false;
  currentAnswerId = null;

  setFeedback("", "");
  setNextEnabled(false);

  componentsDiv.innerHTML = "";
  optionsDiv.innerHTML = "";

  // Pick a random combined item as the correct answer
  const correctItem = pickRandom(tftData.combined);
  currentAnswerId = correctItem.id;

  // Display the 2 components for this combined item
  const compObjs = (correctItem.components || []).map(getComponentById);
  compObjs.forEach(comp => {
    const box = makeItemBox(comp, null);
    componentsDiv.appendChild(box);
  });

  // Build options list: 1 correct + (up to) 3 wrong
  const optionCount = Math.min(4, tftData.combined.length);
  const options = [correctItem];

  // Add random wrong options, avoiding duplicates
  while (options.length < optionCount) {
    const candidate = pickRandom(tftData.combined);
    if (!options.some(o => o.id === candidate.id)) options.push(candidate);
  }

  const shuffled = shuffle(options);

  shuffled.forEach(item => {
    const box = makeItemBox(item, () => handleAnswer(box, item.id));
    optionsDiv.appendChild(box);
  });

  unlockOptions();
}

function handleAnswer(clickedBox, chosenId) {
  if (answered) return;
  answered = true;
  total += 1;

  lockOptions();

  const correctItem = getCombinedById(currentAnswerId);

  if (chosenId === currentAnswerId) {
    score += 1;
    clickedBox.classList.add("correct");
    setFeedback("答啱喇！", "correct");
  } else {
    clickedBox.classList.add("wrong");
    setFeedback(`答錯咗。正確答案係：${correctItem.name}`, "wrong");

    // highlight correct option
    const boxes = optionsDiv.querySelectorAll(".item-box");
    boxes.forEach(box => {
      // compare by displayed name (simple) - robust enough for this small app
      const text = box.textContent || "";
      if (text.trim() === (correctItem.name || "").trim()) {
        box.classList.add("correct");
      }
    });
  }

  updateScore();
  setNextEnabled(true);
}

nextBtn.addEventListener("click", () => {
  if (!answered) return;
  createQuestion();
});

// Start
updateScore();
createQuestion();
