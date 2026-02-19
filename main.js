let score = 0;
let total = 0;
let currentAnswerId = null;
let answered = false;

const componentsDiv = document.getElementById("components");
const optionsDiv = document.getElementById("options");
const feedbackDiv = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const scoreText = document.getElementById("scoreText");

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function byId(list, id) {
  return list.find(x => x.id === id);
}

function updateScore() {
  scoreText.textContent = "得分：" + score + " / " + total;
}

function setNextEnabled(enabled) {
  nextBtn.classList.toggle("disabled", !enabled);
}

function setFeedback(text, type) {
  feedbackDiv.textContent = text || "";
  feedbackDiv.classList.remove("correct", "wrong");
  if (type) feedbackDiv.classList.add(type);
}

function createItemBox(item, clickable, onClick) {
  const box = document.createElement("div");
  box.className = "item-box";
  if (clickable) box.addEventListener("click", onClick);
  else box.style.cursor = "default";

  if (item && item.icon) {
    const img = document.createElement("img");
    img.src = item.icon;
    img.alt = item.name || "";
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    img.onerror = () => {
      img.remove();
      const t = document.createElement("div");
      t.style.color = "#fca5a5";
      t.style.fontSize = "12px";
      t.style.textAlign = "center";
      t.style.marginBottom = "6px";
      t.textContent = "（圖片載入失敗）";
      box.prepend(t);
    };
    box.appendChild(img);
  }

  const name = document.createElement("div");
  name.className = "item-name";
  name.textContent = (item && item.name) ? item.name : "";
  box.appendChild(name);

  return box;
}

function lockOptions() {
  optionsDiv.querySelectorAll(".item-box").forEach(b => b.classList.add("disabled"));
}

function createQuestion() {
  if (typeof tftData === "undefined") {
  setFeedback("data.js 未載入（tftData 不存在）", "wrong");
  return;
}

  answered = false;
  setFeedback("", "");
  setNextEnabled(false);

  componentsDiv.innerHTML = "";
  optionsDiv.innerHTML = "";

  const correct = pickRandom(tftData.combined);
  currentAnswerId = correct.id;

  (correct.components || []).forEach(cid => {
    const comp = byId(tftData.components, cid) || { id: cid, name: cid };
    componentsDiv.appendChild(createItemBox(comp, false, null));
  });

  const optionCount = Math.min(4, tftData.combined.length);
  const options = [correct];
  while (options.length < optionCount) {
    const c = pickRandom(tftData.combined);
    if (!options.some(o => o.id === c.id)) options.push(c);
  }
  options.sort(() => Math.random() - 0.5);

  options.forEach(item => {
    const box = createItemBox(item, true, () => answer(item.id, box));
    optionsDiv.appendChild(box);
  });
}

function answer(chosenId, chosenBox) {
  if (answered) return;
  answered = true;
  total += 1;
  lockOptions();

  const correctItem = byId(tftData.combined, currentAnswerId);

  if (chosenId === currentAnswerId) {
    score += 1;
    chosenBox.classList.add("correct");
    setFeedback("答啱喇！", "correct");
  } else {
    chosenBox.classList.add("wrong");
    const correctName = correctItem && correctItem.name ? correctItem.name : "";
    setFeedback("答錯咗。正確答案係：" + correctName, "wrong");
  }

  updateScore();
  setNextEnabled(true);
}

nextBtn.addEventListener("click", () => {
  if (nextBtn.classList.contains("disabled")) return;
  createQuestion();
});

updateScore();
createQuestion();
