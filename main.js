const greetingArea = document.querySelector(".greeting");
const gameEl = document.querySelector(".game-container");
const gameArea = document.querySelector(".game");
const playButton = document.getElementById("play");
const wave = document.querySelector(".game__wave-one");
const gamePlace = document.querySelector(".game__place");
const game = document.querySelector(".game");
const scoreEl = document.getElementById("score");
const heartsContainer = document.querySelector(".game__lives-container");
const levelDisplay = document.querySelector(".level-display");
const fullEl = document.getElementById("full");
const gameRulesButton = document.querySelector(".how-to-play");
const gameRulesSection = document.querySelector(".game__instructions");
const sliderEl = document.getElementById("slider");
const sliderItems = Array.from(sliderEl.children);
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const instructionPlayBtn = document.getElementById("instruction-play-btn");

//-------------------------Музыка---------------------------
const seaSound = document.getElementById("sea");
const fellDropSound = document.getElementById("drop-sound");
const rightAnswerSound = document.getElementById("right-answer-sound");
const failSound = document.getElementById("fail-sound");
//----------------------------------------------------------

//____________________Калькулятор__________________________
const answerInput = document.querySelector(
  ".result-entry__calc-answer-display"
);
const resultEntryEl = document.querySelector(".result-entry");
const keyboardEl = document.querySelector(".result-entry__calc-keyboard");

const calculatorButtons = document.querySelectorAll(".result-entry__key");
keyboardEl.addEventListener("click", handlerCalcOnMouse);
window.addEventListener("keydown", handleKeyboardInput);

//____________Поле статистики___________________________________________
const scoreBoard = document.querySelector(".score-board");
const continueButton = document.querySelector(".score-board__continue");
const resultScore = document.querySelector(".score-board__result-score");
const resultRightAnswers = document.querySelector(
  ".score-board__result-right-answers"
);
const resultWrongAnswers = document.querySelector(
  ".score-board__result-wrong-answers"
);
//======================Переменные и константы==========================
let countAutoDrop = 0;
let countRightAnswers = 0;

const maxErrors = 3; // Максимальное количество ошибок
let score = 0;
let errors = 0;
const initialLives = 3;
let livesCount;
let hearts = [];

let seaLevelHeight = 0;
let initialWaveHeight;
const initialGameSpeed = 40;
let gameSpeed = initialGameSpeed; //скорость падения капли

let drops = []; // массив капель
let raindropAnswers = []; //массив ответов
let isGameOver = false;
let minNumber = 0;
let maxNumber = 10;
let operations;
let totalDropsCreated = 0;

let idTimeCreateDrop;
let dropCollisionIntervalId;

let isGameRulesShow = false;
let isGameRulesShowTwo = false;
let isGameRulesShowThree = false;

//===========================================================================
// Обработчики событий
playButton.addEventListener("click", startGame);
continueButton.addEventListener("click", continueGame);
fullEl.addEventListener("click", toggleScreen);
//==========================================================================

function startGame() {
  seaSound.play();
  resetGame();

  if (isGameRulesShow || isGameRulesShowTwo || isGameRulesShowThree) {
    calculatorButtons.forEach((btn) => {
      btn.style.cursor = "not-allowed";
    });
    answerInput.disabled = true;
  } else {
    calculatorButtons.forEach((btn) => {
      btn.style.cursor = "pointer";
    });
    answerInput.disabled = false;
  }

  dropCollisionIntervalId = setInterval(checkAllDropCollisions, 100); //проверка всех капель на столкновение

  gameEl.style.display = "flex";
  gameEl.style.flexDirection = "row";
  greetingArea.style.display = "none";

  initialWaveHeight = wave.offsetHeight; // Сохраняем начальную высоту волны

  // Создаем первую каплю при запуске игры
  createRaindrop();
}

function showPoints(points, isMinus) {
  let scoreEl = document.createElement("div");
  scoreEl.classList.add("game__points");
  gamePlace.appendChild(scoreEl);

  scoreEl.textContent = isMinus ? `-${points}` : `+${points}`;

  scoreEl.classList.add("fade-out"); //  класс для анимации исчезновения

  setTimeout(() => {
    scoreEl.remove();
  }, 1000);
}

function generateRandomNumber(minNumber, maxNumber) {
  return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
}

function setDifficult() {
  if (score < 100) {
    minNumber = 0;
    maxNumber = 10;
    isGameRulesShowTwo || isGameRulesShowThree ? (gameSpeed = 10) : 40;
    operations = ["+", "-"];
    levelDisplay.textContent = "Level: 1";
  } else if (score > 100 && score < 200) {
    minNumber = 10;
    maxNumber = 20;
    operations = ["+", "-"];
    gameSpeed = 30;
    levelDisplay.textContent = "Level: 2";
  } else if (score > 200 && score < 300) {
    minNumber = 20;
    maxNumber = 30;
    operations = ["+", "-", "*"];
    gameSpeed = 20;
    levelDisplay.textContent = "Level: 3";
  } else if (score > 300 && score < 400) {
    minNumber = 30;
    maxNumber = 35;
    operations = ["+", "-", "*", "/"];
    gameSpeed = 10;
    levelDisplay.textContent = "Level: 4";
  }
  console.log(gameSpeed);

  return { minNumber, maxNumber, operations, gameSpeed };
}

// Создание выражения
function generateExpression() {
  const { minNumber, maxNumber, operations } = setDifficult();
  let firstNum = generateRandomNumber(minNumber, maxNumber);
  let secondNum = generateRandomNumber(minNumber, maxNumber);

  let operator = operations[Math.floor(Math.random() * operations.length)];

  if ((firstNum < secondNum && operator === "-") || operator === "/") {
    [firstNum, secondNum] = [secondNum, firstNum];
  }
  if (operator === "/" && firstNum % secondNum != 0) {
    firstNum -= firstNum % secondNum; //уменьшаем первое число на остаток от деления
  }
  if (isGameRulesShow === true) {
    firstNum = 7;
    secondNum = 2;
    operator = "+";
  }
  if (isGameRulesShowThree === true && totalDropsCreated % 5 === 0) {
    firstNum = 18;
    secondNum = 2;
    operator = "/";
  }
  return { firstNum, operator, secondNum };
}

//----------------------------------
function calculateExpression(firstNum, operator, secondNum) {
  // Выполняем операцию
  switch (operator) {
    case "+":
      return firstNum + secondNum;
    case "-":
      return firstNum - secondNum;
    case "*":
      return firstNum * secondNum;
    case "/":
      return firstNum / secondNum;
  }
}
//=======================================================

// Создание капли дождя
function createRaindrop() {
  totalDropsCreated++;

  const raindrop = document.createElement("div");
  raindrop.classList.add("raindrop");

  //------ (isBonus)
  if (totalDropsCreated % 5 === 0) {
    raindrop.classList.add("bonus-drop");
  }
  gamePlace.appendChild(raindrop);

  //Вычисляем случайное левое положение в пределах gamePlace
  let leftPos = generateRandomNumber(
    0,
    gamePlace.offsetWidth - raindrop.offsetWidth
  );
  raindrop.style.left = leftPos + "px";

  const { firstNum, operator, secondNum } = generateExpression();

  raindrop.innerHTML = `
    <div class="num1">${firstNum}</div>
    <div class="operator">${operator}</div>
    <div class="num2">${secondNum}</div>
  `;

  let raindropAnswer = calculateExpression(firstNum, operator, secondNum); //ответ в капле в виде числа

  const raindropData = {
    raindrop: raindrop,
    answer: raindropAnswer,
  };
  drops.push(raindropData);
  console.log(drops);

  animateRaindrop(raindrop);

  idTimeCreateDrop = setTimeout(
    () => {
      createRaindrop();
    },

    isGameRulesShowTwo || isGameRulesShowThree ? 1000 : 3500
  );

  if (isGameRulesShowTwo) {
    if (drops.length === 3) {
      clearTimeout(idTimeCreateDrop);
    }
  }
  if (isGameRulesShowThree) {
    if (drops.length === 5) {
      clearTimeout(idTimeCreateDrop);
    }
  }
}

//*********************************************************** */
// Проверка столкновений для всех капель
function checkAllDropCollisions() {
  drops.forEach((drop) => {
    const raindrop = drop.raindrop; // Проверяем каждую каплю
    if (!raindrop) return;
    let waveTop = wave.offsetTop;
    const dropPosition = raindrop.offsetTop + raindrop.offsetHeight;

    if (dropPosition >= waveTop + (raindrop.offsetHeight * 50) / 100) {
      handleDropCollision(raindrop);
    }
  });
}

function animateRaindrop(raindrop) {
  raindrop.classList.add("active");
  let { gameSpeed } = setDifficult();
  raindrop.style.transitionDuration = `${gameSpeed}s`;
}

// Обработка столкновения
function handleDropCollision(raindrop) {
  countAutoDrop++;
  fellDropSound.play();

  drops = drops.filter((dropData) => dropData.raindrop !== raindrop);

  // Сохраняем координаты капли перед удалением
  const dropLeft = raindrop.offsetLeft;
  const dropTop = raindrop.offsetTop;

  createSplash(dropLeft, dropTop);
  raindrop.remove();

  score -= 13;
  if (score < 0) {
    score = 0;
  }

  showPoints(13, true);

  setTimeout(() => {
    loseLife();
  }, 500);

  updateScore();
}

//----------Отрисовка количества жизней(сердец)--------------------------
function createHearts() {
  // Удаляем все предыдущие изображения сердец
  heartsContainer.innerHTML = "";
  hearts = [];

  for (let i = 0; i < initialLives; i++) {
    const heartImage = document.createElement("img");
    heartImage.src = "../../../img/heart.png";
    heartImage.alt = "heart";
    heartImage.classList.add("game__heart");
    heartsContainer.appendChild(heartImage);

    hearts.push(heartImage);
  }
}

function loseLife() {
  if (livesCount > 0) {
    livesCount--;

    failSound.play();

    let lastHeart = hearts[livesCount]; //элемент массива hearts, индекс кот. соответствует текущему кол-ву жизней.
    lastHeart.classList.add("game__lose");

    const waveHeight = wave.offsetHeight;
    // Поднимаем уровень моря на 30% от высоты волны
    seaLevelHeight = waveHeight * 0.3;
    wave.style.height = wave.offsetHeight + seaLevelHeight + "px";
  }

  if (livesCount === 0) {
    isGameRulesShowTwo ? showGameOver() : endGame();
  }
}

//========================================================

function clearDisplayValue() {
  answerInput.value = "";
}
function deleteLastChar() {
  answerInput.value = answerInput.value.slice(0, -1);
}

function printNumbersScreen(numbersBtn) {
  let currentScreenValue = answerInput.value;
  // Добавляем введенное число к текущему значению
  answerInput.value = currentScreenValue + numbersBtn;
}

//-------------------------

function handlerCalcOnMouse(e) {
  let numbersBtn = e.target.getAttribute("data-num");
  let funcBtn = e.target.getAttribute("data-func");
  if (funcBtn || numbersBtn) {
    switch (funcBtn) {
      case "Enter":
        checkAnswer();
        break;
      case "Delete":
        deleteLastChar();
        break;
      case "Escape":
        clearDisplayValue();
        break;
      default:
        printNumbersScreen(numbersBtn);
    }
  }
}

//*********************************************/
//ввод ответа при помощи клавиатуры

function handleKeyboardInput(event) {
  // Ввод цифры
  if (event.key >= "0" && event.key <= "9") {
    answerInput.value += event.key;
  }

  if (event.key === "Delete") {
    deleteLastChar();
  }

  if (event.key === "Escape") {
    clearDisplayValue();
  }
  if (event.key === "Enter") {
    checkAnswer();
  }
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++
function checkAnswer() {
  if (isGameOver) return;
  if (drops.length === 0) return;
  if (answerInput.value === "") return;

  const answer = Number(answerInput.value);

  // Проверяем, совпадает ли введенный ответ с ответом хотя бы одной из капель
  const matchingDropObject = drops.find((drop) => drop.answer === answer);
  console.log(matchingDropObject);

  if (matchingDropObject) {
    handleCorrectAnswer(matchingDropObject, drops.indexOf(matchingDropObject));
  } else {
    handleWrongAnswer();
  }
}

function handleCorrectAnswer(matchingDropObject, dropIndex) {
  rightAnswerSound.play();

  // Сохраняем координаты капли перед удалением
  const dropLeft = matchingDropObject.raindrop.offsetLeft;
  const dropTop = matchingDropObject.raindrop.offsetTop;

  // Создаем анимацию брызг
  createSplash(dropLeft, dropTop);
  gamePlace.removeChild(matchingDropObject.raindrop);

  // Удаляем каплю из массива drops
  drops.splice(dropIndex, 1);
  answerInput.value = "";

  if (matchingDropObject.raindrop.classList.contains("bonus-drop")) {
    clearGamePlace();
    answerInput.value = "";
    countRightAnswers += 1;
    score += 20 + countRightAnswers;
    showPoints(20 + countRightAnswers, false);
  } else {
    countRightAnswers += 1;
    score += 10 + countRightAnswers;
    showPoints(10 + countRightAnswers, false);
  }
  updateScore();
}

function handleWrongAnswer() {
  failSound.play();
  errors++;

  score -= 13;

  answerInput.value = "";
  if (score < 0) {
    score = 0;
  }
  updateScore();

  setTimeout(() => {
    loseLife();
  }, 500);

  showPoints(13, true);

  if (errors >= maxErrors) {
    setTimeout(() => {
      endGame();
      isGameOver = true;
    }, 1200);
  }
}
function createSplash(left, top) {
  const splash = document.createElement("div");
  splash.classList.add("splash");
  splash.style.left = left + "px";
  splash.style.top = top + "px";
  gamePlace.appendChild(splash);

  setTimeout(() => {
    gamePlace.removeChild(splash);
  }, 500);
}

// Обновляет счет в игре
function updateScore() {
  scoreEl.textContent = score;
}

seaSound.pause();

//--------------------------------------------------------------------
function endGame() {
  seaSound.pause();
  hearts = [];
  clearTimers();

  // Удаляем все капли
  clearGamePlace();

  // Вывод результатов
  resultScore.textContent = score;
  resultRightAnswers.textContent = countRightAnswers;
  resultWrongAnswers.textContent = errors;

  gameEl.style.display = "none";
  greetingArea.style.display = "none";
  scoreBoard.style.display = "flex";
}

// Функция для очистки игрового поля
function clearGamePlace() {
  // Удаляем все капли из drops и DOM
  drops.forEach((dropData) => {
    if (dropData.raindrop.parentNode) {
      dropData.raindrop.remove();
    }
  });
  drops = [];
}

function continueGame() {
  scoreBoard.style.display = "none";
  greetingArea.style.display = "flex";
  startGame();
}

//******************************Fullscreen*********************************/

function toggleScreen() {
  // Проверяем, включен ли полноэкранный режим
  if (document.fullscreenElement) {
    // Если включен, выходим из полноэкранного режима
    document.exitFullscreen();
    fullEl.classList.toggle("fullscreen");
    fullEl.classList.toggle("exit-fullscreen");
  } else {
    // Если не включен, включаем полноэкранный режим
    gameEl.requestFullscreen();
    fullEl.classList.toggle("fullscreen");
    fullEl.classList.toggle("exit-fullscreen");
  }
}
//========================Как играть==================================

let idShowRulesInterval1 = null;
let idShowRulesInterval2 = null;
let idShowRulesInterval3 = null;
let active = 0;
let idSetTimeoutCheckAnswer;
let idSetTimeoutShowGameOver;
let isIntervalRunning = false;
let isIntervalRunning2 = false;
let isIntervalRunning3 = false;
let isTextGameOver = false;

const btn9 = document.querySelector('[data-num="9"]');
const btnEnter = document.querySelector(".enter");

gameRulesButton.addEventListener("click", showGameRules);
instructionPlayBtn.addEventListener("click", goToHome);

sliderItems.forEach(function (slide) {
  slide.classList.add("hidden");
});

function goToHome() {
  seaSound.pause();
  answerInput.value === "";
  clearGamePlace();
  clearTimers();
  resetGame();

  isGameRulesShow = false; //чтобы при нажатии на play не было одинаковых примеров (7+2=9)
  isGameRulesShowTwo = false; // -//-
  isGameRulesShowThree = false; // -//-
  isIntervalRunning = false;
  isIntervalRunning2 = false;
  isIntervalRunning3 = false;
  isTextGameOver = false;

  sliderItems.forEach(function (slide) {
    slide.classList.add("hidden");
  });

  gameRulesSection.style.display = "none";
  greetingArea.style.display = "flex";
}

function showGameRules() {
  greetingArea.style.display = "none";
  gameRulesSection.style.display = "flex";
  gameEl.style.flexDirection = "row";
  active = 0;
  sliderItems[active].classList.remove("hidden");
  isGameRulesShow = true;

  resetGame();
  showGameRules1();
}
//================================================================
btnNext.addEventListener("click", showSlides);

function showSlides() {
  answerInput.value === "";

  sliderItems[active].classList.add("hidden");
  active++;
  if (active === sliderItems.length) {
    active--;
  }
  sliderItems[active].classList.remove("hidden");

  clearGamePlace();
  clearTimers();
  resetGame();
  isIntervalRunning = false;
  isIntervalRunning2 = false;

  if (active === 0) {
    showGameRules1();
  } else if (active === 1) {
    showGameRules2();
  } else if (active === 2) {
    showGameRules3();
  }
  updateButtonStates();
}
//=====================================================================
btnPrev.addEventListener("click", () => {
  clearGamePlace();
  clearTimers();
  resetGame();
  isIntervalRunning = false;
  isIntervalRunning2 = false;

  sliderItems[active].classList.add("hidden");
  active--;
  if (active < 0) {
    active = 0;
  }
  sliderItems[active].classList.remove("hidden");

  if (active === 0) {
    showGameRules1();
  }
  if (active === 1) {
    showGameRules2();
  }

  updateButtonStates();
});
//==================================================================
function showGameRules1() {
  if (active === 0) {
    isGameRulesShow = true;
    startGame();
    clearInterval(idTimeCreateDrop);

    setTimeout(() => {
      if (isIntervalRunning && drops.length) {
        btn9.classList.add("press-btn");
        setTimeout(() => {
          btn9.classList.remove("press-btn");
          btnEnter.classList.add("press-btn");
        }, 1500);
        if (drops.length) {
          answerInput.value = drops[0].answer;
        }
      }

      idSetTimeoutCheckAnswer = setTimeout(() => {
        if (answerInput.value) {
          checkAnswer();
        }
        btnEnter.classList.remove("press-btn");
      }, 1700);
    }, 3000);

    if (!isIntervalRunning) {
      isIntervalRunning = true;
      idShowRulesInterval1 = setInterval(() => {
        clearGamePlace();
        resetGame();
        showGameRules1();
      }, 5000);
    }
  } else {
    clearGamePlace();
    clearTimers();

    answerInput.value === "";
  }
  updateButtonStates();
}
//----------------------------2--------------------------

function showGameRules2() {
  clearTimers();
  if (active === 1) {
    isGameRulesShow = false;
    isGameRulesShowTwo = true;
    isGameRulesShowThree = false;
    isIntervalRunning2 = false; //чтобы функция повторялась!!!

    startGame();

    if (drops.length === 3) {
      clearInterval(idTimeCreateDrop);
      showGameOver();
    }

    if (!isIntervalRunning2) {
      isIntervalRunning2 = true;
      idShowRulesInterval2 = setInterval(() => {
        clearGamePlace();
        resetGame();

        showGameRules2();
      }, 12000);
    }
  } else {
    clearInterval(idShowRulesInterval2);
  }
}

function updateButtonStates() {
  btnPrev.disabled = active === 0 ? true : false;
  btnNext.disabled = active === sliderItems.length - 1 ? true : false;
}

function showGameOver() {
  isTextGameOver = true;
  isGameRulesShow = false;
  isIntervalRunning2 = true;
  let gameOverEl = document.createElement("p");
  idSetTimeoutShowGameOver = setTimeout(() => {
    gameOverEl.classList.add("game__points");
    gamePlace.appendChild(gameOverEl);
    gameOverEl.textContent = "Game over";

    gameOverEl.classList.add("fade-out");
  }, 1000);
  setTimeout(() => {
    gameOverEl.remove();
  }, 2000);
}

//============================== 3 ==================================
let idSetTimeoutCheckAnswer3;
function showGameRules3() {
  clearTimers();

  if (active === 2) {
    isGameRulesShowTwo = false;
    isIntervalRunning3 = false;
    isTextGameOver = false;
    isGameRulesShowThree = true;

    startGame();

    setTimeout(() => {
      if (isIntervalRunning3 && drops.length === 5) {
        btn9.classList.add("press-btn");
        setTimeout(() => {
          btn9.classList.remove("press-btn");
          btnEnter.classList.add("press-btn");
        }, 500);
        if (drops.length === 5) {
          answerInput.value = drops[4].answer;
        }
      }

      idSetTimeoutCheckAnswer3 = setTimeout(() => {
        if (answerInput.value) {
          checkAnswer();
        }
        btnEnter.classList.remove("press-btn");
      }, 600);
    }, 6500);

    if (!isIntervalRunning3) {
      isIntervalRunning3 = true;

      idShowRulesInterval3 = setInterval(() => {
        clearGamePlace();
        resetGame();
        showGameRules3();
      }, 7200);
    }
  } else {
    clearGamePlace();
    clearTimers();
  }
}

function clearTimers() {
  clearInterval(idShowRulesInterval1);
  clearInterval(idTimeCreateDrop);
  clearTimeout(idSetTimeoutCheckAnswer);
  clearInterval(idShowRulesInterval2);
  clearInterval(idShowRulesInterval3);
  clearTimeout(idSetTimeoutShowGameOver);
  clearInterval(dropCollisionIntervalId);
}

function resetGame() {
  countRightAnswers = 0;
  totalDropsCreated = 0;
  countAutoDrop = 0;
  seaLevelHeight = 0;
  score = 0;
  updateScore();

  livesCount = initialLives;
  createHearts();
  wave.style.height = initialWaveHeight + "px";
  gameSpeed = initialGameSpeed;
  answerInput.value = "";

  hearts.forEach((heart) => {
    heart.classList.remove("game__lose");
  });
  if (
    btn9.classList.contains("press-btn") ||
    btnEnter.classList.contains("press-btn")
  ) {
    btn9.classList.remove("press-btn");
    btnEnter.classList.remove("press-btn");
  }
}
