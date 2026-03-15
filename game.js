const CATEGORIES = {
  glass: { label: "Стекло", key: "1" },
  paper: { label: "Бумага", key: "2" },
  plastic: { label: "Пластик", key: "3" },
  organic: { label: "Органика", key: "4" },
  metal: { label: "Металл", key: "5" }
};

const TRASH_ITEMS = [
  {
    id: "metal-cans",
    name: "Консервы",
    hint: "Обычно открывают консервным ножом",
    category: "metal",
    image: "assets/items/metal-cans.svg"
  },
  {
    id: "plastic-water-bottle",
    name: "Бутылка для воды",
    hint: "Лёгкая тара после прогулки",
    category: "plastic",
    image: "assets/items/plastic-water-bottle.svg"
  },
  {
    id: "plastic-sand-shovel",
    name: "Лопатка для песка",
    hint: "Игрушка с пляжа и песочницы",
    category: "plastic",
    image: "assets/items/plastic-sand-shovel.svg"
  },
  {
    id: "metal-batteries",
    name: "Батарейки",
    hint: "Элемент питания из старого фонарика",
    category: "metal",
    image: "assets/items/metal-batteries.svg"
  },
  {
    id: "metal-nails",
    name: "Гвозди",
    hint: "Крепёж, которым собирают доски",
    category: "metal",
    image: "assets/items/metal-nails.svg"
  },
  {
    id: "plastic-straws",
    name: "Трубочки для питья",
    hint: "Остаются после лимонада",
    category: "plastic",
    image: "assets/items/plastic-straws.svg"
  },
  {
    id: "glass-jar",
    name: "Стеклянная банка",
    hint: "Тара, в которой часто хранят варенье",
    category: "glass",
    image: "assets/items/glass-jar.svg"
  },
  {
    id: "glass-vase",
    name: "Ваза",
    hint: "Дом для букета на столе",
    category: "glass",
    image: "assets/items/glass-vase.svg"
  },
  {
    id: "metal-chandelier",
    name: "Люстра",
    hint: "Потолочный светильник с подвесами",
    category: "metal",
    image: "assets/items/metal-chandelier.svg"
  },
  {
    id: "glass-mirror",
    name: "Зеркало",
    hint: "Поверхность, в которой видно отражение",
    category: "glass",
    image: "assets/items/glass-mirror.svg"
  },
  {
    id: "metal-flashlight",
    name: "Фонарь",
    hint: "Карманный источник света",
    category: "metal",
    image: "assets/items/metal-flashlight.svg"
  },
  {
    id: "organic-peel",
    name: "Кожура",
    hint: "Остаётся после фруктового перекуса",
    category: "organic",
    image: "assets/items/organic-banana-peel.svg"
  },
  {
    id: "paper-boxes",
    name: "Коробки",
    hint: "Упаковка после доставки",
    category: "paper",
    image: "assets/items/paper-boxes.svg"
  },
  {
    id: "paper-newspaper",
    name: "Газета",
    hint: "Утренний выпуск новостей",
    category: "paper",
    image: "assets/items/paper-newspaper.svg"
  },
  {
    id: "organic-wilted-flowers",
    name: "Завянувшие цветы",
    hint: "Букет, который уже отжил своё",
    category: "organic",
    image: "assets/items/organic-wilted-flowers.svg"
  }
];
const BIN_ASSETS = [
  "assets/bins/bin-glass.svg",
  "assets/bins/bin-paper.svg",
  "assets/bins/bin-plastic.svg",
  "assets/bins/bin-organic.svg",
  "assets/bins/bin-metal.svg"
];

const COMPLETION_PROMPT_TEXT = "Найдите разницу между временем разложения алюминиевой банки и числом 83.";

const state = {
  status: "loading",
  score: 0,
  combo: 0,
  maxCombo: 0,
  lives: 3,
  sortedCount: 0,
  correctCount: 0,
  items: []
};

const els = {
  startBtn: document.getElementById("startBtn"),
  retryBtn: document.getElementById("retryBtn"),
  restartBtn: document.getElementById("restartBtn"),
  scoreValue: document.getElementById("scoreValue"),
  comboValue: document.getElementById("comboValue"),
  livesValue: document.getElementById("livesValue"),
  loadingState: document.getElementById("loadingState"),
  idleState: document.getElementById("idleState"),
  playingState: document.getElementById("playingState"),
  gameOverState: document.getElementById("gameOverState"),
  errorState: document.getElementById("errorState"),
  errorText: document.getElementById("errorText"),
  trashGrid: document.getElementById("trashGrid"),
  trashCounter: document.getElementById("trashCounter"),
  selectedHint: document.getElementById("selectedHint"),
  feedback: document.getElementById("feedback"),
  gameOverReason: document.getElementById("gameOverReason"),
  completionPrompt: document.getElementById("completionPrompt"),
  bins: [...document.querySelectorAll(".bin-btn")]
};

function shuffle(items) {
  const list = [...items];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }
  return list;
}

function setVisibleState(name) {
  const entries = [
    ["loading", els.loadingState],
    ["idle", els.idleState],
    ["playing", els.playingState],
    ["gameover", els.gameOverState],
    ["error", els.errorState]
  ];

  entries.forEach(([key, node]) => {
    node.classList.toggle("hidden", key !== name);
  });
}

function getRemainingItems() {
  return state.items.filter((item) => !item.sorted);
}

function getCurrentItem() {
  return state.items.find((item) => !item.sorted) || null;
}

function updateHud() {
  els.scoreValue.textContent = String(state.score);
  els.comboValue.textContent = String(state.combo);
  els.livesValue.textContent = String(state.lives);
}

function updateTrashCounter() {
  const remaining = getRemainingItems().length;
  els.trashCounter.textContent = `Осталось предметов: ${remaining}`;
}

function updateSelectedHint() {
  const currentItem = getCurrentItem();
  if (!currentItem) {
    els.selectedHint.textContent = "Все предметы отсортированы.";
    return;
  }

  els.selectedHint.textContent = `Текущий предмет: ${currentItem.name}. Выберите подходящий контейнер снизу.`;
}

function pushFeedback(text, mode = "") {
  els.feedback.textContent = text;
  els.feedback.classList.remove("ok", "bad");
  if (mode) {
    els.feedback.classList.add(mode);
  }
}

function flashBin(category, success) {
  const targetBin = els.bins.find((button) => button.dataset.category === category);
  if (!targetBin) {
    return;
  }

  targetBin.classList.remove("correct-hit", "wrong-hit");
  targetBin.classList.add(success ? "correct-hit" : "wrong-hit");
  window.setTimeout(() => {
    targetBin.classList.remove("correct-hit", "wrong-hit");
  }, 340);
}

function renderTrashGrid() {
  const currentItem = getCurrentItem();
  els.trashGrid.innerHTML = "";

  if (!currentItem) {
    return;
  }

  const card = document.createElement("article");
  card.className = "trash-item current-trash";
  card.setAttribute("aria-label", `Мусор: ${currentItem.name}`);

  card.innerHTML =
    '<img src="' +
    currentItem.image +
    '" alt="' +
    currentItem.name +
    '" width="180" height="180" />' +
    "<span>" +
    currentItem.name +
    "</span>" +
    "<small>" +
    currentItem.hint +
    "</small>";

  els.trashGrid.append(card);
}

function finishGame(reason, isCompleted = false) {
  state.status = "gameover";
  setVisibleState("gameover");

  els.startBtn.disabled = false;
  els.startBtn.textContent = "Начать заново";
  els.gameOverReason.textContent = reason;

  if (isCompleted) {
    els.completionPrompt.textContent = COMPLETION_PROMPT_TEXT;
    els.completionPrompt.classList.remove("hidden");
  } else {
    els.completionPrompt.textContent = "";
    els.completionPrompt.classList.add("hidden");
  }

  pushFeedback("");
}

function processChoice(selectedCategory) {
  if (state.status !== "playing") {
    return;
  }

  const item = getCurrentItem();
  if (!item) {
    finishGame("Все предметы отсортированы.", true);
    return;
  }

  state.sortedCount += 1;
  const isCorrect = selectedCategory === item.category;

  if (isCorrect) {
    state.combo += 1;
    state.correctCount += 1;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    state.score += 10 + state.combo * 2;
    item.sorted = true;

    pushFeedback(`Верно: \"${item.name}\" отправлен в \"${CATEGORIES[item.category].label}\".`, "ok");
    flashBin(selectedCategory, true);
  } else {
    state.combo = 0;
    state.lives -= 1;
    state.score = Math.max(0, state.score - 6);

    pushFeedback(
      `Неверно. \"${item.name}\" нужно отправить в \"${CATEGORIES[item.category].label}\".`,
      "bad"
    );
    flashBin(selectedCategory, false);
  }

  updateHud();
  updateTrashCounter();
  updateSelectedHint();
  renderTrashGrid();

  if (state.lives <= 0) {
    finishGame("Жизни закончились.");
    return;
  }

  if (getRemainingItems().length === 0) {
    finishGame("Все предметы отсортированы.", true);
  }
}

function startRound() {
  state.status = "playing";
  state.score = 0;
  state.combo = 0;
  state.maxCombo = 0;
  state.lives = 3;
  state.sortedCount = 0;
  state.correctCount = 0;
  state.items = shuffle(TRASH_ITEMS).map((item) => ({ ...item, sorted: false }));

  setVisibleState("playing");
  updateHud();
  updateTrashCounter();
  updateSelectedHint();
  renderTrashGrid();
  pushFeedback("Сортируйте предметы по очереди: выбирайте контейнер снизу.");

  els.startBtn.disabled = true;
  els.startBtn.textContent = "Раунд идёт";
}

function bindControls() {
  els.startBtn.addEventListener("click", () => {
    if (state.status === "ready" || state.status === "gameover" || state.status === "idle") {
      startRound();
    }
  });

  els.restartBtn.addEventListener("click", startRound);
  els.retryBtn.addEventListener("click", preloadAndReady);

  els.bins.forEach((button) => {
    button.addEventListener("click", () => processChoice(button.dataset.category));
  });

  document.addEventListener("keydown", (event) => {
    if (state.status !== "playing") {
      return;
    }

    const category = Object.keys(CATEGORIES).find((key) => CATEGORIES[key].key === event.key);
    if (category) {
      processChoice(category);
    }
  });
}

function preloadAssets(paths) {
  const jobs = paths.map(
    (path) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = () => reject(new Error(path));
        img.src = path;
      })
  );

  return Promise.all(jobs);
}

async function preloadAndReady() {
  state.status = "loading";
  setVisibleState("loading");
  els.startBtn.disabled = true;
  els.startBtn.textContent = "Загрузка...";

  try {
    const itemPaths = TRASH_ITEMS.map((item) => item.image);
    await preloadAssets([...itemPaths, ...BIN_ASSETS]);

    state.status = "ready";
    startRound();
  } catch (error) {
    state.status = "error";
    setVisibleState("error");
    els.errorText.textContent = `Не удалось загрузить файл: ${error.message}`;
    els.startBtn.disabled = true;
  }
}

bindControls();
preloadAndReady();
