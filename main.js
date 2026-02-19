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

function byId(list, id) {
  return list.find(x => x.id === id);
}

function clearUI() {
  componentsDiv.innerHTML = "";
  optionsDiv.innerHTML = "";
}

function setFeedback(text, type) {
  feedbackDiv.textContent = text || "";
  feedbackDiv.classList.remove("correct", "wrong");
  if (type) feedbackDiv.classList.add(type);
}

function setNextEnabled(enabled) {
  if (enabled) nextBtn.classList.remove("disabled");
  else nextBtn.classList.add("disabled");
}

function updateScore() {
  scoreText.textContent = `得分：${score} / ${total}`;
}

function createItemBox(item, clickable, onClick) {
  const box = document.createElement("div");
  box.className = "item-box";

  if (clickable) {
    box.addEventListener("click", onClick);
  } else {
    box.style.cursor = "default";
  }

  // icon (optional)
  if (item && item.icon) {
    const img = document.createElement("img");
    img.src = item.icon;
    img.alt = item.name || "";
    img.referrerPolicy = "no-referrer"; // 有啲 CDN 需要
    img.onload = () => {};
    img.onerror = () => {
      // 顯示「圖壞咗」提示（唔會靜靜地消失）
      img.remove();
      const fail = document.createElement("div");
      fail.style.fontSize = "12px";
      fail.style.color = "#fca5a5";
      fail.style.textAlign = "center";
      fail.style.marginBottom = "8px";
      fail.textContent = "（圖片載入失敗）";
      box.prepend(fail);
    };
    box.appendChild(img);
  }

  const name = document.createElement("div");
  name.className = "item-name";
  name.textContent = item?.name || "";
  box.appendChild(name);

  return box;
}

function lockOptions() {
  const boxes = optionsDiv.querySelectorAll(".item-box");
  boxes.forEach(b => b.classList.add("disabled"));
}

function createQuestion() {
  if (!window.tftData) {
    setFeedback("data.js 未載入（tftData 不存在）", "wrong");
    return;
  }
  if (!Array.isArray(tftData.components) || !Array.isArray(tftData.combined)) {
    setFeedback("data.js 格式錯（components/combined 唔係 array）", "wrong");
    return;
  }
  if (tftData.combined.length < 2) {
    setFeedback("combined 數量太少，至少要 2 個", "wrong");
    return;
  }

  answered = false;
  setFeedback("", "");
  setNextEnabled(false);
  clearUI();

  const correct = pickRandom(tftData.combined);
  currentAnswerId = correct.id;

  // 顯示散件（2件）
  const compIds = correct.components || [];
  compIds.forEach(cid => {
    const comp = byId(tftData.components, cid) || { id: cid, name: cid };
    componentsDiv.appendChild(createItemBox(comp, false, null));
  });

  // 4選1（不足4就用現有數量）
  const optionCount = Math.min(4, tftData.combined.length);
  const options = [correct];
  while (options.length < optionCount) {
    const c = pickRandom(tftData.combined);
    if (!options.some(o => o.id === c.id)) options.push(c);
  }

  shuffle(options).forEach(item => {
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
    setFeedback(`答錯咗。正確答案係：${correctItem?.name || ""}`, "wrong");

    // 標記正確選項
    const boxes = optionsDiv.querySelectorAll(".item-box");
    boxes.forEach(b => {
      const txt = b.textContent || "";
      if ((correctItem?.name || "").trim() && txt.includes((correctItem.name || "").trim())) {
        b.classList.add("correct");
      }
    });
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
