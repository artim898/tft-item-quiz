// 用 tftData 產生題目
let score = 0;
let total = 0;
let currentAnswerId = null;
let answered = false;

const componentsDiv = document.getElementById("components");
const optionsDiv = document.getElementById("options");
const feedbackDiv = document.getElementById("feedback");
const nextBtn = document.getElementById("nextBtn");
const scoreText = document.getElementById("scoreText");

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createQuestion() {
  answered = false;
  feedbackDiv.textContent = "";
  nextBtn.classList.add("disabled");

  // 清空畫面
  componentsDiv.innerHTML = "";
  optionsDiv.innerHTML = "";

  const combined = tftData.combined;
  const components = tftData.components;

  // 1. 隨機抽一件合成裝
  const correctItem = getRandomElement(combined);
  currentAnswerId = correctItem.id;

  // 2. 顯示兩件散件
  correctItem.components.forEach(cid => {
    const comp = components.find(c => c.id === cid);
    const div = document.createElement("div");
    div.className = "item-box";
    div.textContent = comp ? comp.name : cid;
    componentsDiv.appendChild(div);
  });

  // 3. 準備選項（1 正確 + 幾個錯誤）
  const optionsSet = new Set();
  optionsSet.add(correctItem.id);

  while (optionsSet.size < Math.min(4, combined.length)) {
    const other = getRandomElement(combined);
    optionsSet.add(other.id);
  }

  const optionIds = Array.from(optionsSet)
    .map(id => combined.find(item => item.id === id))
    .sort(() => Math.random() - 0.5);

  optionIds.forEach(item => {
    const div = document.createElement("div");
    div.className = "item-box";
    div.textContent = item.name;
    div.addEventListener("click", () => handleAnswer(div, item.id));
    optionsDiv.appendChild(div);
  });
}

function handleAnswer(element, chosenId) {
  if (answered) return;
  answered = true;
  total += 1;

  const optionBoxes = document.querySelectorAll(".options .item-box");
  optionBoxes.forEach(box => box.classList.add("disabled"));

  if (chosenId === currentAnswerId) {
    score += 1;
    element.classList.add("correct");
    feedbackDiv.textContent = "答啱喇！";
  } else {
    element.classList.add("wrong");
    feedbackDiv.textContent = "答錯咗。綠色框先係正確答案。";

    optionBoxes.forEach(box => {
      if (box.textContent === tftData.combined.find(i => i.id === currentAnswerId).name) {
        box.classList.add("correct");
      }
    });
  }

  scoreText.textContent = `得分：${score} / ${total}`;
  nextBtn.classList.remove("disabled");
}

nextBtn.addEventListener("click", () => {
  if (!answered) return;
  createQuestion();
});

// 初始載入第一題
createQuestion();
