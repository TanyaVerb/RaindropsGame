const greetingArea = document.querySelector(".greeting");
const gameEl = document.querySelector(".game-container");
const gameArea = document.querySelector(".game");
const playButton = document.querySelector(".play");
const wave = document.querySelector(".game__wave-one");
const gamePlace = document.querySelector(".game__place");
const game = document.querySelector(".game");
const scoreEl = document.getElementById("score");
const heartsContainer = document.querySelector(".game__lives-container");
const levelDisplay = document.querySelector(".level-display");
const fullEl = document.getElementById("full");

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

//===========================================================================
// Обработчики событий
playButton.addEventListener("click", startGame);
continueButton.addEventListener("click", continueGame);
fullEl.addEventListener("click", toggleScreen);
//==========================================================================
function startGame() {
  seaSound.play();
  createHearts();
  // Очищаем поле и переменные
  score = 0;
  errors = 0;
  drops = [];
  updateScore();

  gameEl.style.display = "block";
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
    scoreEl.remove(); // Удаляем элемент более лаконично
  }, 2000);
}

//________________________

function generateRandomNumber(minNumber, maxNumber) {
  return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
}

//Уровни
// const levelDisplay = document.createElement("div");
// levelDisplay.classList.add("level-display");
// resultEntryEl.appendChild(levelDisplay);

// let currentLvl = 1;
// let helper = null;
// levelDisplay.textContent = `Level:${currentLvl}`;

// function setDifficult() {
//   operations = ["+", "-", "*", "/"];
//   minNumber = 0;
//   maxNumber = 10;
//   // gameSpeed = 40;

//   console.log(countRightAnswers);

//   if (helper === currentLvl) return;
//   if (countRightAnswers % 5 === 0 && countRightAnswers > 0) {
//     // helper = currentLvl;
//     minNumber = minNumber + 1;
//     maxNumber = maxNumber + 1;
//     // gameSpeed = score >= 100 ? gameSpeed - 10 : gameSpeed; //??????????
//     currentLvl = currentLvl + 1;
//     helper = currentLvl;
//     levelDisplay.textContent = `Level:${currentLvl}`;
//   }

//   // console.log({ minNumber, maxNumber, operations });
//   console.log({ minNumber, maxNumber, operations });

//   return { minNumber, maxNumber, operations };
// }

function setDifficult() {
  if (score < 100) {
    minNumber = 0;
    maxNumber = 10;
    gameSpeed = 40;
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

  return { minNumber, maxNumber, operations };
}

// Создание выражения
function generateExpression() {
  const { minNumber, maxNumber, operations } = setDifficult(); // Устанавливаем уровень сложности перед генерацией
  let firstNum = generateRandomNumber(minNumber, maxNumber);
  let secondNum = generateRandomNumber(minNumber, maxNumber);

  console.log(firstNum, secondNum);

  const operator = operations[Math.floor(Math.random() * operations.length)];
  if ((firstNum < secondNum && operator === "-") || operator === "/") {
    [firstNum, secondNum] = [secondNum, firstNum];
  }
  if (operator === "/" && firstNum % secondNum != 0) {
    firstNum -= firstNum % secondNum; //уменьшаем первое число на остаток от деления
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
let totalDropsCreated = 0;

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

  // Создание элементов выражения с использованием шаблонных строк
  raindrop.innerHTML = `
    <div class="num1">${firstNum}</div>
    <div class="operator">${operator}</div>
    <div class="num2">${secondNum}</div>
  `;

  let raindropAnswer = calculateExpression(firstNum, operator, secondNum); //ответ в капле в виде числа
  console.log(raindropAnswer);

  // Сохраняем ответ и каплю в объекте
  const raindropData = {
    raindrop: raindrop,
    answer: raindropAnswer,
  };

  // Запускаем анимацию падения
  animateRaindrop(raindrop);

  drops.push(raindropData); //добавляем в массив капли
  console.log(drops);

  // Создаем следующую каплю с задержкой
  setTimeoutId = setTimeout(() => {
    createRaindrop();
  }, 3500);
}

// Функция анимации падения капли
function animateRaindrop(raindrop) {
  raindrop.classList.add("active");
  raindrop.style.transitionDuration = `${gameSpeed}s`;
  // gameSpeed = score >= 100 ? gameSpeed - 10 : gameSpeed;//???????????????????
  let dropRect = raindrop.getBoundingClientRect();
  console.log(dropRect);
  // Получаем позицию волны
  let waveRect = wave.getBoundingClientRect();
  let waveRectTop = waveRect.top;
  console.log(waveRect.height);
  console.log(waveRectTop);
  console.log(seaLevelHeight);

  // Устанавливаем top капли на уровень волны
  raindrop.style.top = waveRectTop - dropRect.height + "px";
  console.log(raindrop.style.top);
  console.log(dropRect.height);

  let collisionHandled = false;

  // Проверяем столкновение после завершения анимации
  raindrop.addEventListener("transitionend", () => {
    if (!collisionHandled) {
      collisionHandled = true;
      handleDropCollision(raindrop);
    }
  });

  console.log(gameSpeed);
}

// Обработка столкновения
function handleDropCollision(raindrop) {
  countAutoDrop++;
  console.log(countAutoDrop);

  fellDropSound.play();

  drops = drops.filter((dropData) => dropData.raindrop !== raindrop);

  // Удаляем элемент из DOM только если он еще существует
  if (raindrop.parentNode) {
    raindrop.parentNode.removeChild(raindrop);
    console.log("капля удалена");
  }

  let currentDrop = raindrop;
  console.log(currentDrop);

  createSplash(currentDrop);

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

//-------------------------------Отрисовка количества жизней(сердец)

// Устанавливаем начальное количество жизней,кот.можно менять
let initialLives = 3;
livesCount = initialLives; // Изначальное количество жизней
let hearts = [];

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
    //_________
    // Получаем высоту волны
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
    hearts = [];
    endGame();
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
  if (gameOver) return; //

  if (drops.length === 0) return; // Проверка, есть ли капли

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
  updateScore();
  // Создаем анимацию брызг
  createSplash(currentDrop.raindrop);
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
function createSplash(currentDrop) {
  const splash = document.createElement("div");
  splash.classList.add("splash");
  splash.style.left = currentDrop.style.left;
  splash.style.top = currentDrop.style.top;
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
  clearTimeout(setTimeoutId);

  // Удаляем все капли
  clearGamePlace();

  console.log(wave.offsetHeight);
  console.log(seaLevelHeight);
  wave.style.height = wave.offsetHeight - seaLevelHeight + "px";
  console.log(wave.offsetHeight);

  // Вывод результатов
  resultScore.textContent = score;
  resultRightAnswers.textContent = countRightAnswers;
  resultWrongAnswers.textContent = errors;

  gameEl.style.display = "none";
  greetingArea.style.display = "none";
  scoreBoard.style.display = "flex";

  console.log(countAutoDrop);
  console.log(totalDropsCreated);
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
