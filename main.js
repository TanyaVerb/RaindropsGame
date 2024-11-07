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
//============================Переменные и константы==========================
let countAutoDrop = 0;
let countRightAnswers = 0;

const maxErrors = 3; // Максимальное количество ошибок
let score = 0;
let errors = 0;

let seaLevelHeight = 0;
let initialWaveHeight;
let gameSpeed = 40; //скорость падения капли

let drops = []; // массив капель
let raindropAnswers = []; //массив ответов
let gameOver = false;
let minNumber = 0;
let maxNumber = 10;
let operations;
let totalDropsCreated = 0;

let idTimeCreateDrop;
let idTimeDropFalse;

let isGameRulesShow = false;
let isGameRulesShowTwo = false;
//===========================================================================
// Обработчики событий
playButton.addEventListener("click", startGame);
continueButton.addEventListener("click", continueGame);
fullEl.addEventListener("click", toggleScreen);
//==========================================================================
const initialLives = 3;
let hearts = [];

function startGame() {
  livesCount = initialLives; // Изначальное количество жизней

  seaSound.play();
  createHearts();
  // Очищаем поле и переменные
  score = 0;
  errors = 0;
  drops = [];
  updateScore();

  idTimeDropFalse = setInterval(checkAllDropCollisions, 100); //проверка всех капель на столкновение

  gameEl.style.display = "flex";
  gameEl.style.flexDirection = "row";
  greetingArea.style.display = "none";
  answerInput.value = "";

  initialWaveHeight = wave.offsetHeight; // Сохраняем начальную высоту волны
  console.log(initialWaveHeight);

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
  }, 2000);
}

//________________________

function generateRandomNumber(minNumber, maxNumber) {
  return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
}

function setDifficult() {
  if (score < 100) {
    minNumber = 0;
    maxNumber = 10;
    isGameRulesShowTwo ? (gameSpeed = 10) : 40; ////????
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
  console.log({ minNumber, maxNumber, operations });

  return { minNumber, maxNumber, operations, gameSpeed };
}

// Создание выражения
function generateExpression() {
  const { minNumber, maxNumber, operations } = setDifficult(); // Устанавливаем уровень сложности перед генерацией
  let firstNum = generateRandomNumber(minNumber, maxNumber);
  let secondNum = generateRandomNumber(minNumber, maxNumber);

  console.log(firstNum, secondNum);

  let operator = operations[Math.floor(Math.random() * operations.length)];
  if ((firstNum < secondNum && operator === "-") || operator === "/") {
    [firstNum, secondNum] = [secondNum, firstNum];
  }
  if (operator === "/" && firstNum % secondNum != 0) {
    firstNum -= firstNum % secondNum; //уменьшаем первое число на остаток от деления
  }
  if (isGameRulesShow === true) {
    //изм
    firstNum = 7;
    secondNum = 2;
    operator = "+";
  }
  return { firstNum, operator, secondNum };
}
console.log(generateExpression());
//----------------------------------
function calculateExpression(firstNum, operator, secondNum) {
  // Выполняем операцию
  switch (operator) {
    case "+":
      console.log(firstNum + secondNum);

      return firstNum + secondNum;
    case "-":
      console.log(firstNum - secondNum);
      return firstNum - secondNum;
    case "*":
      console.log(firstNum * secondNum);
      return firstNum * secondNum;
    case "/":
      console.log(firstNum / secondNum);
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
  console.log(raindropAnswer);

  const raindropData = {
    raindrop: raindrop,
    answer: raindropAnswer,
  };
  drops.push(raindropData);
  console.log(drops);

  animateRaindrop(raindrop);

  idTimeCreateDrop = setTimeout(() => {
    createRaindrop();
  }, 3500);

  if (isGameRulesShowTwo) {
    if (drops.length === 3) {
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

// Функция анимации падения капли
function animateRaindrop(raindrop) {
  raindrop.classList.add("active");
  gameSpeed = setDifficult();
  raindrop.style.transitionDuration = `${gameSpeed}s`;

  console.log(gameSpeed);
}

// Обработка столкновения
function handleDropCollision(raindrop) {
  countAutoDrop++;
  console.log(countAutoDrop);

  fellDropSound.play();
  // gamePlace.removeChild(raindrop);
  drops = drops.filter((dropData) => dropData.raindrop !== raindrop);

  // Сохраняем координаты капли перед удалением
  const dropLeft = raindrop.offsetLeft;
  const dropTop = raindrop.offsetTop;

  // // Удаляем элемент из DOM только если он еще существует
  if (raindrop.parentNode) {
    createSplash(dropLeft, dropTop);
    raindrop.parentNode.removeChild(raindrop);
    console.log("капля удалена");
  }

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

//----------Отрисовка количества жизней(сердец)

// Устанавливаем начальное количество жизней,кот.можно менять
// let initialLives = 3; //const?
// livesCount = initialLives; // Изначальное количество жизней
// let hearts = [];

function createHearts() {
  // Удаляем все предыдущие изображения сердец

  heartsContainer.innerHTML = "";

  for (let i = 0; i < initialLives; i++) {
    const heartImage = document.createElement("img");
    heartImage.src = "../../../img/heart.png";
    heartImage.classList.add("game__heart");
    heartsContainer.appendChild(heartImage);
    hearts.push(heartImage);
  }
}

function loseLife() {
  if (livesCount > 0) {
    livesCount--;

    failSound.play();
    // Находим последний  элемент и добавляем класс "game__lose"
    let lastHeart = hearts[livesCount]; //элемент массива hearts, индекс кот. соответствует текущему кол-ву жизней.
    lastHeart.classList.add("game__lose");
    console.log(lastHeart);

    const waveHeight = wave.offsetHeight;
    console.log(waveHeight);

    // Поднимаем уровень моря на 30% от высоты волны
    seaLevelHeight = waveHeight * 0.3;
    wave.style.height = wave.offsetHeight + seaLevelHeight + "px";

    console.log(seaLevelHeight);
    console.log(wave.offsetHeight, wave.offsetTop);
  }

  if (livesCount === 0) {
    // failSound.pause();
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
  // Получаем текущее значение на экране калькулятора
  let currentScreenValue = answerInput.value;
  // Добавляем введенное число к текущему значению
  answerInput.value = currentScreenValue + numbersBtn;
}

//-------------------------

function handlerCalcOnMouse(e) {
  e.stopPropagation();
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
    console.log(answerInput.value);
  }

  // Удаление последней цифры (Delete)
  if (event.key === "Delete") {
    deleteLastChar();
  }

  // Очистка поля (Clear)
  if (event.key === "Escape") {
    clearDisplayValue();
  }
  if (event.key === "Enter") {
    checkAnswer();
  }
}
//++++++++++++++++++++++++++++++++++++++++++++++++++++
function checkAnswer() {
  if (gameOver) return;

  if (drops.length === 0) return;

  const answer = parseFloat(answerInput.value); //можно Number()

  // Проверяем, совпадает ли введенный ответ с ответом хотя бы одной из капель
  const matchingDrop = drops.find((drop) => drop.answer === answer);
  console.log(matchingDrop);

  if (matchingDrop) {
    if (answer === matchingDrop.answer) {
      handleCorrectAnswer(matchingDrop, drops.indexOf(matchingDrop));
    } else {
      handleWrongAnswer();
    }
  } else {
    handleWrongAnswer();
  }
}

function handleCorrectAnswer(currentDrop, dropIndex) {
  rightAnswerSound.play();

  // Сохраняем координаты капли перед удалением
  const dropLeft = currentDrop.raindrop.offsetLeft;
  const dropTop = currentDrop.raindrop.offsetTop;

  // Создаем анимацию брызг
  createSplash(dropLeft, dropTop);
  gamePlace.removeChild(currentDrop.raindrop);

  // Удаляем каплю из массива drops
  drops.splice(dropIndex, 1);
  answerInput.value = "";

  if (currentDrop.raindrop.classList.contains("bonus-drop")) {
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
      gameOver = true;
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
  }, 500); // - время анимации брызг
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
  clearTimeout(idTimeCreateDrop);
  clearInterval(idTimeDropFalse);

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

  livesCount = 3;

  countRightAnswers = 0;
  totalDropsCreated = 0;
  countAutoDrop = 0;

  console.log(hearts);
  hearts.forEach((heart) => {
    heart.classList.remove("game__lose");
  });

  // Сбрасываем высоту волны к исходному значению
  seaLevelHeight = 0;
  wave.style.height = initialWaveHeight + "px";
  startGame();
}

//********************************Fullscreen*********************************/

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
//============================Как играть=====================================

let idShowRulesInterval1 = null;
let idShowRulesInterval2 = null;
let active = 0;
let idSetTimeoutCheckAnswer;
let isIntervalRunning = false;
let isIntervalRunning2 = false;
let isGameOver = false;

gameRulesButton.addEventListener("click", showGameRules);
instructionPlayBtn.addEventListener("click", goToHome);

sliderItems.forEach(function (slide) {
  console.log(slide);
  slide.classList.add("hidden");
});

function clearTimers() {
  clearInterval(idShowRulesInterval1);
  clearInterval(idTimeCreateDrop);
  clearTimeout(idSetTimeoutCheckAnswer);
  clearInterval(idShowRulesInterval2);
}
function goToHome() {
  seaSound.pause();
  answerInput.value === "";
  clearGamePlace();
  clearTimers();
  reset();
  active === null; //????
  isGameRulesShow = false; //чтобы при нажатии на play не было одинаковых примеров (7+2=9)
  isGameRulesShowTwo = false; //
  isIntervalRunning = false;
  isIntervalRunning2 = false;
  isGameOver = false;

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

  reset();
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

  // Очистка интервалов и сброс переменных при переходе слайдов
  clearGamePlace();
  clearTimers();
  reset();
  isIntervalRunning = false;
  isIntervalRunning2 = false;

  if (active === 0) {
    showGameRules1();
  } else if (active === 1) {
    showGameRules2();
  } else if (active === 2) {
    // showGameRules3();
  }
  updateButtonStates();
}
//============================================================================
btnPrev.addEventListener("click", () => {
  clearGamePlace();
  clearTimers();
  reset();
  isIntervalRunning = false;
  isIntervalRunning2 = false;

  answerInput.value = "";

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
//=============================================================================
function showGameRules1() {
  if (active === 0) {
    isGameRulesShow = true;
    startGame();
    clearInterval(idTimeCreateDrop);

    setTimeout(() => {
      const btn9 = document.querySelector('[data-num="9"]');
      const btnEnter = document.querySelector(".enter");

      if (isIntervalRunning && drops.length) {
        btn9.classList.add("press-btn");
        setTimeout(() => {
          btn9.classList.remove("press-btn");
          btnEnter.classList.add("press-btn");
        }, 500);
        if (drops.length) {
          answerInput.value = drops[0].answer;
        }
      }

      idSetTimeoutCheckAnswer = setTimeout(() => {
        if (answerInput.value) {
          checkAnswer();
        }
        btnEnter.classList.remove("press-btn");
      }, 600);
    }, 3000);

    if (!isIntervalRunning) {
      isIntervalRunning = true;
      idShowRulesInterval1 = setInterval(() => {
        clearGamePlace();
        livesCount = 3;
        countRightAnswers = 0;
        totalDropsCreated = 0;
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
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function showGameRules2() {
  clearTimers();
  if (active === 1) {
    isGameRulesShow = false;
    isGameRulesShowTwo = true;
    isIntervalRunning2 = false; //чтобы функция повторялась!!!
    startGame();

    console.log(livesCount);

    if (drops.length === 3) {
      clearInterval(idTimeCreateDrop);

      showGameOver();
    }
    console.log(livesCount);
    if (!isIntervalRunning2) {
      isIntervalRunning2 = true;
      idShowRulesInterval2 = setInterval(() => {
        clearGamePlace();
        reset();

        showGameRules2();
      }, 20000);
    }
  } else {
    clearInterval(idShowRulesInterval2);
    // clearTimers();
  }
}

function updateButtonStates() {
  btnPrev.disabled = active === 0;
  btnNext.disabled = active === sliderItems.length - 1;
}

function showGameOver() {
  isGameOver = true;
  isGameRulesShow = false;
  isIntervalRunning2 = true;
  let gameOverEl = document.createElement("p");
  setTimeout(() => {
    gameOverEl.classList.add("game__points");
    gamePlace.appendChild(gameOverEl);
    gameOverEl.textContent = "Game over";

    gameOverEl.classList.add("fade-out");
  }, 1000);
  setTimeout(() => {
    gameOverEl.remove();
  }, 2000);
}

function reset() {
  countRightAnswers = 0;
  totalDropsCreated = 0;
  countAutoDrop = 0;
  seaLevelHeight = 0;
  livesCount = 3;
  wave.style.height = initialWaveHeight + "px";
}
