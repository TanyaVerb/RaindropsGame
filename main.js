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
console.log(hearts);
//-------------------------Музыка---------------------------
const seaSound = document.getElementById("sea");
const fellDropSound = document.getElementById("drop-sound");
const rightAnswerSound = document.getElementById("right-answer-sound");
const failSound = document.getElementById("fail-sound");
//----------------------------------------------------------

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
//===============================Переменные==============================
let lives = 3;
let seaLevelHeight = 0;
let initialWaveHeight;
let currentExpression = "";

let gameSpeed = 40; //скорость падения капли
// let currentScore = 0;
let countAutoDrop = 0;

const maxErrors = 3; // Максимальное количество ошибок

// Игровые переменные
let score = 0;
let errors = 0;
let drops = []; // массив капель
let raindropAnswers = []; //массив ответов

let rightAnswers = 0;
let countRightAnswers = 0;

let gameOver = false;
let animation;

//-____________________________________

//============================================================================
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
let minNumber = 0;
let maxNumber = 10;
let operations;

function generateRandomNumber(minNumber, maxNumber) {
  return Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
}

//Уровни
const levelDisplay = document.createElement("div");
levelDisplay.classList.add("level-display");
resultEntryEl.appendChild(levelDisplay);

let currentLvl = 1;
let helper = null;
levelDisplay.textContent = `Level:${currentLvl}`;

// function setDifficult() {
//   operations = ["+", "-", "*", "/"];
//   minNumber = 0;
//   maxNumber = 10;
//   // gameSpeed = 40;

//   console.log(rightAnswers);

//   if (helper === currentLvl) return;
//   if (rightAnswers % 5 === 0 && rightAnswers > 0) {
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
  //Начальное положение капли - за пределами gamePlace
  // raindrop.style.top = "-50px"; //  Изменяем начальное положение капли

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
  // Активируем анимацию с задержкой
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

function loseLife() {
  if (lives > 0) {
    lives--;
    console.log(lives);

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
//Обработчик клика на цифры
numberButtons.forEach((number) => {
  number.addEventListener("click", () => {
    answerInput.value += number.textContent;
  });
});

//Обработчик клика на Delete
deleteButton.addEventListener("click", () => {
  deleteLastChar();
});
//Обработчик клика на Clear
clearButton.addEventListener("click", () => {
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
    deleteLastChar();
  }

  // Очистка поля (Clear)
  if (event.key === "Escape") {
    clearDisplayValue();
  }
  if (event.key === "Enter") {
    checkAnswer();
  }
});

//++++++++++++++++++++++++++++++++++++++++++++++++++++
function checkAnswer() {
  if (gameOver) return; //

  if (drops.length === 0) return; // Проверка, есть ли капли

  const answer = parseFloat(answerInput.value); //можно Number()

  // Проверяем, совпадает ли введенный ответ с ответом хотя бы одной из капель
  const matchingDrop = drops.find((drop) => drop.answer === answer);

  if (matchingDrop) {
    if (matchingDrop.raindrop.classList.contains("bonus-drop")) {
      if (answer === matchingDrop.answer) {
        // Если это бонусная капля-удаляем все капли
        clearGamePlace();
        answerInput.value = ""; // Очищаем поле ввода

        rightAnswerSound.play();
        rightAnswers += 1;
        score += 20 + rightAnswers;

        updateScore();

        showPoints(20 + rightAnswers, false);
      } else {
        // Если ответ неверный, обрабатываем как обычную каплю
        handleWrongAnswer();
      }
    } else {
      handleCorrectAnswer(matchingDrop, drops.indexOf(matchingDrop));
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
  // Проверка на проигрыш
  if (errors >= maxErrors) {
    setTimeout(() => {
      endGame();
      gameOver = true;
    }, 1200);
  }
}
function createSplash(currentDrop) {
  // Создаем анимацию брызг
  const splash = document.createElement("div");
  splash.classList.add("splash");
  splash.style.left = currentDrop.style.left;
  splash.style.top = currentDrop.style.top;
  gamePlace.appendChild(splash); //можно append(splash)

  setTimeout(() => {
    gamePlace.removeChild(splash); //можно remove()
  }, 500); // - время анимации брызг
}

// Обновляет счет в игре
function updateScore() {
  scoreEl.textContent = score;
}

// Обработчики событий
playButton.addEventListener("click", startGame);
seaSound.pause();

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

//********************************Fullscreen*********************************/
const fullEl = document.getElementById("full"); //кнопка fullscreen

fullEl.addEventListener("click", toggleScreen);

function toggleScreen() {
  // не null //если нет элементов в полноэкранном режиме
  if (!document.fullscreenElement) {
    gameEl.requestFullscreen(); //запрос у элемента полноэкранный режим
    fullEl.classList.add("exit-fullscreen");
    fullEl.classList.remove("fullscreen");
  } else {
    if (document.fullscreenElement) {
      document.exitFullscreen(); //все элементы возвращает к первоначальному виду
    }
  }
}

// function toggleScreen() {
//   // Проверяем, включен ли полноэкранный режим
//   if (document.fullscreenElement) {
//     // Если включен, выходим из полноэкранного режима
//     document.exitFullscreen();
//     fullEl.classList.toggle("fullscreen"); // Меняем класс на fullscreen
//     fullEl.classList.toggle("exit-fullscreen"); // Меняем класс на exit-fullscreen
//   } else {
//     // Если не включен, включаем полноэкранный режим
//     gameEl.requestFullscreen();
//     fullEl.classList.toggle("fullscreen"); // Меняем класс на fullscreen
//     fullEl.classList.toggle("exit-fullscreen"); // Меняем класс на exit-fullscreen
//   }
// }
