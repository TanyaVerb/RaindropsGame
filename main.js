let lives = 3;
let maxError = 3; // (Максимальное количество ошибок)
let seaLevelHeight = 0;
let initialWaveHeight;
let currentExpression = "";
let stepTop;
let gameSpeed = 200; //скорость падения капли

// opacityDrop = 1;
let currentScore = 0;
let minusPoints;
let plusPoints;
let countAutoDrop = 0;

//-____________________________________

const greetingArea = document.querySelector(".greeting");
const gameEl = document.querySelector(".game-container");

const gameArea = document.querySelector(".game");
const playButton = document.querySelector(".play");
console.log(playButton);
const wave = document.querySelector(".game__wave");
console.log(wave);

const gamePlace = document.querySelector(".game__place");
const game = document.querySelector(".game");

const scoreEl = document.getElementById("score");
console.log(scoreEl);

let hearts = document.querySelectorAll(".game__heart"); //жизни

//****************Fullscreen*****************/
const fullEl = document.getElementById("full");

fullEl.addEventListener("click", toggleScreen);

function toggleScreen() {
  if (!document.fullscreenElement) {
    gameEl.requestFullscreen();
    fullEl.classList.add("exit-fullscreen");
    fullEl.classList.remove("fullscreen");
  } else {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }
}

//____________________Калькулятор__________________________
const numberButtons = document.querySelectorAll(".number");
console.log(numberButtons);
const clearButton = document.querySelector(".clear");
const enterButton = document.querySelector(".enter");
const deleteButton = document.querySelector(".delete-key");
const answerInput = document.querySelector(
  ".result-entry__calc-answer-display"
);

const resultEntryEl = document.querySelector(".result-entry");

const maxErrors = 3; // Максимальное количество ошибок
// const maxScore = 110; // Максимальный счет для выигрыша ???
// Игровые переменные
let score = 0;
let errors = 0;
let drops = []; // массив капель
let raindropAnswers = []; //массив ответов

let rightAnswers = 0;
let countRightAnswers = 0;

let gameOver = false;
let animation;
let setIntervalId;

//____________
const scoreBoard = document.querySelector(".score-board");
const continueButton = document.querySelector(".score-board__continue");
const resultScore = document.querySelector(".score-board__result-score");
const resultRightAnswers = document.querySelector(
  ".score-board__result-right-answers"
);
const resultWrongAnswers = document.querySelector(
  ".score-board__result-wrong-answers"
);

//-------------------------Музыка---------------------------
const seaSound = document.getElementById("sea");
const fellDropSound = document.getElementById("drop-sound");
const rightAnswerSound = document.getElementById("right-answer-sound");
const failSound = document.getElementById("fail-sound");
//----------------------------------------------------------

function showPoints(points, isMinus) {
  let scoreEl = document.querySelector(".game__points");

  if (!scoreEl) {
    scoreEl = document.createElement("div");
    scoreEl.classList.add("game__points");
    gamePlace.appendChild(scoreEl);
  }

  scoreEl.textContent = isMinus ? `-${points}` : `+${points}`;

  gamePlace.appendChild(scoreEl); //если убрать, то первый раз не покажет баллы

  scoreEl.classList.add("fade-out"); //  класс для анимации исчезновения

  // удаляем элемент после окончания анимации
  setTimeout(() => {
    if (scoreEl.parentNode) {
      scoreEl.parentNode.removeChild(scoreEl);
    }
  }, 2000);
}

//________________________
let min = 0;
let max = 10;
let operations;

function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Уровни
const levelDisplay = document.createElement("div");
levelDisplay.classList.add("level-display");
resultEntryEl.appendChild(levelDisplay);

function setDifficult() {
  if (score < 100) {
    min = 0;
    max = 10;
    gameSpeed = 200;
    operations = ["+", "-"];
    levelDisplay.textContent = "Level: 1";
  } else if (score > 100 && score < 200) {
    min = 10;
    max = 20;
    operations = ["+", "-"];
    gameSpeed = 150;
    levelDisplay.textContent = "Level: 2";
  } else if (score > 200 && score < 300) {
    min = 20;
    max = 30;
    operations = ["+", "-", "*"];
    gameSpeed = 100;
    levelDisplay.textContent = "Level: 3";
  } else if (score > 300 && score < 400) {
    min = 30;
    max = 35;
    operations = ["+", "-", "*", "/"];
    gameSpeed = 100;
    levelDisplay.textContent = "Level: 4";
  }
  console.log({ min, max, operations });

  return { min, max, operations };
}

// Создание выражения
function generateExpression() {
  const { min, max, operations } = setDifficult(); // Устанавливаем уровень сложности перед генерацией
  let firstNum = generateRandomNumber(min, max);
  let secondNum = generateRandomNumber(min, max);

  const operator = operations[Math.floor(Math.random() * operations.length)];
  if ((firstNum < secondNum && operator === "-") || operator === "/") {
    [firstNum, secondNum] = [secondNum, firstNum];
  }
  if (operator === "/" && firstNum % secondNum != 0) {
    firstNum -= firstNum % secondNum; //уменьшаем первое число на остаток от деления
  }

  currentExpression = `${firstNum} ${operator} ${secondNum}`;

  return currentExpression;
}
console.log(generateExpression());

function hiddenDrop() {
  opacityDrop -= 0.1;
}

function calculateExpression(exp) {
  // Разделяем выражение на части
  const parts = exp.split(" ");
  const num1 = Number(parts[0]);
  const operation = parts[1];
  const num2 = Number(parts[2]);

  console.log(operation);

  // Выполняем операцию
  switch (operation) {
    case "+":
      return num1 + num2;
    case "-":
      return num1 - num2;
    case "*":
      return num1 * num2;
    case "/":
      return num1 / num2;
  }
}

//=======================================================
let totalDropsCreated = 0;
// let dropsBeforeBonus = 5; // Количество обычных капель перед первой бонусной
// Создание капли дождя
function createRaindrop() {
  totalDropsCreated++;
  // const isBonus = totalDropsCreated > dropsBeforeBonus && Math.random() < 0.2; //Вероятность получения бонусной капли составляет 20%.

  const raindrop = document.createElement("div");
  raindrop.classList.add("raindrop");
  // Определение типа капли
  //------ (isBonus)
  if (totalDropsCreated % 5 === 0) {
    raindrop.classList.add("bonus-drop");
  }
  gamePlace.appendChild(raindrop);
  //Начальное положение капли - за пределами gamePlace
  raindrop.style.top = "-50px"; //  Изменяем начальное положение капли

  //Вычисляем случайное левое положение в пределах gamePlace
  let leftPos = generateRandomNumber(
    0,
    gamePlace.offsetWidth - raindrop.offsetWidth
  );
  raindrop.style.left = leftPos + "px";

  let exp = generateExpression();
  console.log(exp); //выражение в виде строки

  //==========Добавляем выражение в каплю===============
  // Создаем элементы для выражения
  const num1El = document.createElement("div");
  num1El.classList.add("num1");
  const num2El = document.createElement("div");
  num2El.classList.add("num2");
  const operatorEl = document.createElement("div");
  operatorEl.classList.add("operator");

  // Разбиваем выражение на части
  const parts = exp.split(" ");
  console.log(parts);
  num1El.textContent = parts[0];
  operatorEl.textContent = parts[1];
  num2El.textContent = parts[2];

  // Добавляем элементы в каплю
  raindrop.appendChild(num1El);
  raindrop.appendChild(operatorEl);
  raindrop.appendChild(num2El);

  //================================================

  let raindropAnswer = calculateExpression(exp); //ответ в капле в виде числа
  console.log(raindropAnswer);

  // Сохраняем ответ и каплю в объекте
  const raindropData = {
    raindrop: raindrop,
    answer: raindropAnswer,
  };

  drops.push(raindropData); //добавляем в массив капли
  console.log(drops);

  // Запускаем анимацию падения
  animateRaindrop(raindrop);

  // Создаем следующую каплю с задержкой
  setTimeoutId = setTimeout(() => {
    createRaindrop();
  }, 3500);
}

// Функция анимации падения капли
function animateRaindrop(raindrop) {
  let animation = setInterval(() => {
    raindrop.style.top = parseInt(raindrop.style.top) + 5 + "px";

    // Получаем точные позиции капли и волны
    const dropRect = raindrop.getBoundingClientRect();
    const waveRect = wave.getBoundingClientRect();

    if (parseInt(dropRect.bottom) > parseInt(waveRect.top)) {
      console.log(wave.offsetTop);
      countAutoDrop++;
      console.log(countAutoDrop); //количество капель утонуло
      fellDropSound.play();
      clearInterval(animation);
      // Находим индекс капли в массиве drops
      const dropIndex = drops.findIndex(
        (dropData) => dropData.raindrop === raindrop
      );
      if (dropIndex !== -1) {
        drops.splice(dropIndex, 1); // Удаляем каплю из массива
      }
      // Удаляем элемент из DOM только если он еще существует
      if (raindrop.parentNode) {
        raindrop.parentNode.removeChild(raindrop);
      }

      let currentDrop = raindrop;
      console.log(currentDrop);

      createSplash(currentDrop);
      // loseLife();
      score -= 13;
      if (score < 0) {
        score = 0;
      }
      // minusPoints = 13;
      showPoints(13, true); //списываются баллы, если капля упала в море

      // для того, чтобы после последнего неправильного ответа, успевало показаться  showPoints(13, true)
      setTimeout(() => {
        loseLife();
      }, 500);
      // loseLife();
      updateScore();
    }
  }, gameSpeed);

  console.log(gameSpeed);
}

//========================================================

function clearDisplayValue() {
  answerInput.value = "";
}
function deleteLastChar() {
  answerInput.value = answerInput.value.slice(0, -1);
}
//Обработчик клика на цифры
numberButtons.forEach((number) => {
  number.addEventListener("click", () => {
    answerInput.value += number.textContent;
  });
});

//Обработчик клика на Delete
deleteButton.addEventListener("click", () => {
  // answerInput.value = answerInput.value.slice(0, -1);
  deleteLastChar();
});
//Обработчик клика на Clear
clearButton.addEventListener("click", () => {
  // answerInput.value = "";
  clearDisplayValue();
});
//Обработчик клика на Enter
enterButton.addEventListener("click", checkAnswer);
//*********************************************/
//ввод ответа при помощи клавиатуры
window.addEventListener("keydown", function (event) {
  // Ввод цифры
  if (event.key >= "0" && event.key <= "9") {
    answerInput.value += event.key;
    console.log(answerInput.value);
  }

  // Удаление последней цифры (Delete)
  if (event.key === "Delete") {
    // answerInput.value = answerInput.value.slice(0, -1);
    deleteLastChar();
  }

  // Очистка поля (Clear)
  if (event.key === "Escape") {
    // answerInput.value = ""; // Очищаем значение input
    clearDisplayValue();
  }
  if (event.key === "Enter") {
    checkAnswer();
  }
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++
function checkAnswer() {
  if (gameOver) return; //??????????????????????

  if (drops.length === 0) return; // Проверка, есть ли капли

  const answer = parseFloat(answerInput.value);

  // Проверяем, совпадает ли введенный ответ с ответом хотя бы одной из капель
  const dropIndex = drops.findIndex((drop) => drop.answer === answer);

  if (dropIndex !== -1) {
    // Если совпадение найдено
    const currentDrop = drops[dropIndex];

    if (currentDrop.raindrop.classList.contains("bonus-drop")) {
      if (answer === currentDrop.answer) {
        // Если это бонусная капля-удаляем все капли
        clearGamePlace();
        answerInput.value = ""; // Очищаем поле ввода

        rightAnswerSound.play();
        rightAnswers += 1;
        score += 20 + rightAnswers;

        updateScore();
        // plusPoints = 20 + rightAnswers;
        // showPlusPoints(rightAnswers);
        showPoints(20 + rightAnswers, false);
      } else {
        // Если ответ неверный, обрабатываем как обычную каплю
        handleWrongAnswer();
      }
    } else {
      handleCorrectAnswer(currentDrop, dropIndex);
    }
  } else {
    handleWrongAnswer();
  }
}

function handleCorrectAnswer(currentDrop, dropIndex) {
  rightAnswerSound.play();
  rightAnswers += 1;
  score += 10 + rightAnswers;

  updateScore();
  // plusPoints = 10 + rightAnswers;
  // showPlusPoints(rightAnswers);
  showPoints(10 + rightAnswers, false);

  // Создаем анимацию брызг
  createSplash(currentDrop.raindrop);

  gamePlace.removeChild(currentDrop.raindrop);

  // Удаляем каплю из массива drops
  drops.splice(dropIndex, 1);

  answerInput.value = ""; // Очищаем поле ввода
}

function handleWrongAnswer() {
  failSound.play();
  errors++;
  // minusPoints = 13;
  score -= 13;

  answerInput.value = "";
  if (score < 0) {
    score = 0;
  }
  updateScore();

  setTimeout(() => {
    loseLife();
  }, 500);
  // loseLife();
  showPoints(13, true);
  // Проверка на проигрыш
  if (errors >= maxErrors) {
    setTimeout(() => {
      endGame();
      gameOver = true;
    }, 1200);
    // endGame();
  }
  // showMinusPoints();
  // showPoints(13, true);
}
function createSplash(currentDrop) {
  // Создаем анимацию брызг
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

// Обработчики событий
playButton.addEventListener("click", startGame);
seaSound.pause();

function startGame() {
  seaSound.play();
  // Очищаем поле и переменные
  score = 0;
  errors = 0;
  drops = [];
  updateScore();

  gameEl.style.display = "block";
  greetingArea.style.display = "none";

  answerInput.value = "";

  initialWaveHeight = wave.offsetHeight; // Сохраняем начальную высоту волны

  // Создаем первую каплю при запуске игры
  createRaindrop(generateExpression());
}

function loseLife() {
  if (lives > 0) {
    lives--;

    failSound.play();
    // Находим последний  элемент и добавляем класс "game__lose"
    let lastHeart = hearts[lives]; //элемент массива hearts, индекс кот. соответствует текущему кол-ву жизней.
    lastHeart.classList.add("game__lose");
  }
  //_________
  // Получаем высоту волны
  const waveHeight = wave.offsetHeight;
  // Поднимаем уровень моря на 20% от высоты волны
  seaLevelHeight += waveHeight * 0.2;

  wave.style.height = wave.offsetHeight + seaLevelHeight + "px";
  console.log(seaLevelHeight);
  if (lives === 0) {
    // failSound.pause();
    clearInterval(animation);
    endGame();
  }
}

function endGame() {
  seaSound.pause();
  clearTimeout(setTimeoutId);
  clearInterval(animation);

  // Удаляем все капли
  clearGamePlace();

  console.log(wave.offsetHeight);
  console.log(seaLevelHeight);
  wave.style.height = wave.offsetHeight - seaLevelHeight + "px";
  console.log(wave.offsetHeight);

  // Вывод результатов
  resultScore.textContent = score;
  resultRightAnswers.textContent = rightAnswers;
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

continueButton.addEventListener("click", continueGame);
function continueGame() {
  scoreBoard.style.display = "none";
  greetingArea.style.display = "flex";

  lives = 3;

  rightAnswers = 0;
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
