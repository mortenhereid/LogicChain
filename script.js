let quizData = [];
let globalGlossary = {};
let currentIdx = 0;
let score = 0;

const questionEl = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const explanationBox = document.getElementById("explanation-box");
const explanationText = document.getElementById("explanation-text");
const practicalBox = document.getElementById("practical-box");
const practicalText = document.getElementById("practical-text");
const nextBtn = document.getElementById("next-btn");
const progressEl = document.querySelectorAll("#progress"); // Target both progress indicators
const themeToggle = document.getElementById("theme-toggle");
const menuContainer = document.getElementById("menu-container");
const quizContent = document.getElementById("quiz-content");

/** THEME ENGINE **/
if (localStorage.getItem("quiz-theme") === "dark") {
  document.body.classList.add("dark-mode");
  themeToggle.innerText = "☀️ Light Mode";
}
themeToggle.onclick = () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeToggle.innerText = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("quiz-theme", isDark ? "dark" : "light");
};

/** GLOSSARY ENGINE **/
function applyGlossary(text) {
  if (!text) return "";
  let html = text;
  const sortedKeys = Object.keys(globalGlossary).sort(
    (a, b) => b.length - a.length,
  );
  sortedKeys.forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    html = html.replace(
      regex,
      `<span class="glossary-term" data-definition="${globalGlossary[term]}">$&</span>`,
    );
  });
  return html;
}

/** SHUFFLE **/
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/** INITIALIZATION (Updated to accept filename) **/
async function init(filename) {
  try {
    const response = await fetch(filename);
    const json = await response.json();
    globalGlossary = json.global_glossary;
    quizData = shuffle(json.questions);

    // UI Toggle
    menuContainer.classList.add("hidden");
    quizContent.classList.remove("hidden");

    render();
  } catch (e) {
    alert("Runtime Error: Unable to access " + filename);
  }
}

function render() {
  const q = quizData[currentIdx];
  explanationBox.classList.add("hidden");
  practicalBox.classList.add("hidden");
  nextBtn.classList.add("hidden");
  optionsContainer.innerHTML = "";

  // Update only the quiz progress (index 1)
  progressEl[1].innerText = `Metric: ${currentIdx + 1} / ${quizData.length}`;
  questionEl.innerHTML = applyGlossary(q.question);

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.classList.add("option-btn");
    btn.onclick = () => check(i);
    optionsContainer.appendChild(btn);
  });
}

function check(choice) {
  const q = quizData[currentIdx];
  const btns = optionsContainer.querySelectorAll(".option-btn");
  btns.forEach((b) => (b.disabled = true));

  if (choice === q.answer) {
    btns[choice].classList.add("correct");
    score++;
  } else {
    btns[choice].classList.add("incorrect");
    btns[q.answer].classList.add("correct");
  }

  explanationText.innerHTML = `
        <div><strong>Rationale:</strong> ${applyGlossary(q.explanation)}</div>
        <div class="deep-dive">
            <strong>Monograph Context:</strong><br>
            ${applyGlossary(q.elaborated_feedback)}
        </div>
    `;

  if (q.practical_example) {
    practicalText.innerHTML = `<strong>Practical Application:</strong><br>${applyGlossary(q.practical_example)}`;
    practicalBox.classList.remove("hidden");
  }

  explanationBox.classList.remove("hidden");
  nextBtn.classList.remove("hidden");
}

nextBtn.onclick = () => {
  currentIdx++;
  if (currentIdx < quizData.length) {
    render();
  } else {
    quizContent.classList.add("hidden");
    const res = document.getElementById("result-area");
    res.classList.remove("hidden");
    document.getElementById("score-text").innerText =
      `Performance Metric: ${score} / ${quizData.length} objectives mastered.`;
  }
};

// Autostart removed to allow menu selection
