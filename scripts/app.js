let valueUpdated = false;

function generateRandom() {
  valueUpdated = false;
  clearResultColor(); // Clear color before generating new values
  clearButtonClasses(); // Clear result buttons colors

  // Get selected checkboxes for arithmetics
  const arithmeticsCheckboxes = document.querySelectorAll('#arithmeticDropdown input[type="checkbox"]:checked');
  const selectedArithmetics = Array.from(arithmeticsCheckboxes).map(checkbox => checkbox.value);

  // Return error if no operation selected
  if (selectedArithmetics.length == 0) {
    alert('בחר פעולה');
    return;
  }
  // Get a random arithmetic operation from the selected values
  const operation = selectedArithmetics[Math.floor(Math.random() * selectedArithmetics.length)];

  const number1 = generateRandomNumber(document.getElementById('digits').value);
  const number2 = generateRandomNumber(document.getElementById('digits').value);

  document.getElementById('number1').value = number1;
  document.getElementById('number2').value = number2;
  document.getElementById('operation').value = operation;
  document.getElementById('exercise').value = + number1 + ' ' + convertToSymbol(operation) + ' ' + number2 + ' = ?';


  // Calculate the result using the calculateResult function
  const result = calculateResult(number1, number2, operation);

  // Generate three additional options based on the result
  const options = generateOptions(result);

  // Set the buttons' text with the numbers in a randomized order
  setButtonOptions(options);

  // Focus on the "Result" input field
  document.getElementById('result').focus();
}

function clearResultColor() {
  // Clear the color styling from the result element
  document.getElementById('result').style.backgroundColor = '';
  document.getElementById('result').value = '';
}

function generateRandomNumber(digits, operation) {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checkResult() {
  const number1 = parseInt(document.getElementById('number1').value, 10);
  const number2 = parseInt(document.getElementById('number2').value, 10);
  const operation = document.getElementById('operation').value;
  const resultInput = document.getElementById('result');
  const result = parseInt(resultInput.value, 10);

  let calculatedResult = calculateResult(number1, number2, operation);

  if (result === calculatedResult) {
    resultInput.style.backgroundColor = 'lightgreen';  // Assuming the result is correct, trigger confetti

    // Update and display the score based on the correctness of the answer
    if (!valueUpdated) {
      updateScore(true);
      valueUpdated = true;
    }
  } else {
    resultInput.style.backgroundColor = '#FFCCCB';
    // Update and display the score based on the correctness of the answer
    if (!valueUpdated) {
      updateScore(false);
      valueUpdated = true;
    }
  }
}

function calculateResult(number1, number2, operation) {
  let calculatedResult;
  switch (convertToSymbol(operation)) {
    case '+':
      calculatedResult = number1 + number2;
      break;
    case '-':
      calculatedResult = number1 - number2;
      break;
    case '*':
      calculatedResult = number1 * number2;
      break;
    case ':':
      calculatedResult = number1 / number2;
      break;
    case '^':
      calculatedResult = Math.pow(number1, number2);
      break;
    default:
      calculatedResult = NaN;
  }
  return calculatedResult;
}

function generateOptions(number) {
  const negativeNumber = number < 0;
  // Extract digits from the number
  const digits = Array.from(Math.abs(number).toString()).map(Number);

  // Initialize options with the original number
  const options = [];

  // Generate options by applying +-1 and +-2 to each digit
  digits.forEach((digit, index) => {
    // Generate options for the current digit
    const digitOptions = generateDigitOptions(digit, index === 0);

    // Create new options by replacing the current digit
    const newOptions = digitOptions.map(newDigit => {
      const newDigits = [...digits];
      newDigits[index] = newDigit;
      return parseInt(newDigits.join(''), 10);
    });

    // Add new options to the overall options array
    options.push(...newOptions);
  });

  // Randomize the options and select three distinct values
  let shuffledArray = shuffleArray(options).slice(0, 3);

  // If original number was negative, turn all to negative
  if(negativeNumber) shuffledArray = shuffledArray.map(number => { return 0-number; });

  // Add the correct answer 
  shuffledArray.push(number);
  return shuffledArray;
}

function generateDigitOptions(digit) {
  // Define rules for each digit
  const rules = {
    0: [1, 2, 3],
    1: [0, 2, 3],
    2: [0, 1, 3, 4],
    3: [1, 2, 4, 5],
    4: [2, 3, 5, 6],
    5: [3, 4, 6, 7],
    6: [4, 5, 7, 8],
    7: [5, 6, 8, 9],
    8: [6, 7, 9],
    9: [6, 7, 8]
  };

  // Apply rules based on the digit
  return rules[digit] || [];
}

function shuffleArray(array) {
  // Randomize the order of elements in the array (Fisher-Yates algorithm)
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function setButtonOptions(options) {
  // Shuffle the options for random order
  const shuffledOptions = shuffleArray(options);

  // Set the buttons' text with the shuffled options
  const buttons = document.getElementById('resultButtons').getElementsByTagName('button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].textContent = shuffledOptions[i];
  }
}

function triggerConfetti() {
  // Configure confetti options
  // const confettiConfig = {
  //   particleCount: 100,
  //   spread: 70,
  //   origin: { y: 0.6 },
  // };

  // Trigger confetti
  var confetties = ['confetti', 'stars', 'hearts'];
  var randomIndex = Math.floor(Math.random() * confetties.length);
  var selectedVersion = confetties[randomIndex];
  switch (selectedVersion) {
    case 'confetti':
      startConfetti();
      setTimeout(function () { stopConfetti(); }, 2000)
      break;
    case 'stars':
      startStars();
      setTimeout(function () { stopStars(); }, 2000)
      break;
    case 'hearts':
      startHearts();
      setTimeout(function () { stopHearts(); }, 2000)
      break;
    default:
      break;
  }
}

// Add an event listener for the "Enter" key on the entire document
document.addEventListener('keydown', function (event) {
  if (event.key === 'Enter') {
    // Trigger the "Check" button click
    document.getElementById('check').click();
  }
});

document.addEventListener('keydown', function (event) {
  // Check if the Shift key is pressed
  if (event.key === 'Shift') {
    // Trigger the "Random" button click
    document.getElementById('random').click();
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const digitsInput = document.getElementById('digits');

  // Add an input event listener to the digits input field
  digitsInput.addEventListener('input', function () {
    enforceValidDigits(digitsInput);
  });
  const resultInput = document.getElementById('result');

  // Add an input event listener to the result input field
  resultInput.addEventListener('input', function () {
    document.getElementById('result').style.backgroundColor = '';
  });

  // Load high score
  let highScore = parseInt(getCookie('highScore')) || 0;
  document.getElementById('highScore').textContent = `שיא: ${highScore}`;
  setCookie('highScore', highScore, 365);
});

function enforceValidDigits(inputElement) {
  let enteredDigits = parseInt(inputElement.value, 10);

  // Ensure enteredDigits is within the valid range (1 to 5)
  if (isNaN(enteredDigits) || enteredDigits < 1) {
    enteredDigits = 1;
  } else if (enteredDigits > 5) {
    enteredDigits = 5;
  }

  // Update the input field value
  inputElement.value = enteredDigits;
}

function convertToSymbol(operationName) {
  const operationMap = {
    'חיבור': '+',
    'חיסור': '-',
    'כפל': '*',
    'חילוק': ':',
    'חזקה': '^'
  };

  // Convert the operation name to the corresponding symbol
  return operationMap[operationName] || operationName;
}

// Function to set a cookie
function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// Function to get a cookie value by name
function getCookie(name) {
  const cookieArray = document.cookie.split(';');
  for (let i = 0; i < cookieArray.length; i++) {
    const cookiePair = cookieArray[i].split('=');
    if (cookiePair[0].trim() === name) {
      return cookiePair[1];
    }
  }
  return null;
}

// Function to update and display the streak and high score
function updateScore(correct) {
  const streakElement = document.getElementById('streak');
  const highScoreElement = document.getElementById('highScore');

  let streak = parseInt(streakElement.textContent.split(':')[1]) || 0;
  let highScore = parseInt(getCookie('highScore')) || 0;

  if (correct) {
    // Increase streak for correct answer
    streak++;

    // Update high score if the current streak is higher
    if (streak > highScore) {
      highScore = streak;
      setCookie('highScore', highScore, 365);
    }
    setTimeout(function () { generateRandom(); }, 1000)
  } else {
    // Reset streak for wrong answer
    streak = 0;
  }

  // Display the updated streak and high score
  streakElement.textContent = `רצף נוכחי: ${streak}`;
  highScoreElement.textContent = `שיא: ${highScore}`;
}

function toggleDropdown() {
  var dropdown = document.getElementById("arithmeticDropdown");
  dropdown.classList.toggle("show");

  // Close the dropdown if it's already open
  if (dropdown.classList.contains("show")) {
    dropdown.style.display = 'block';
    window.onclick = function (event) {
      if (!event.target.matches('.dropbtn')) {
        dropdown.classList.remove('show');
        dropdown.style.display = 'none';
      }
    };
  } else {
    // Revert to the default behavior if the dropdown is closed
    window.onclick = null;
    dropdown.classList.remove('show');
    dropdown.style.display = 'none';
  }
}

// Close the dropdown if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

// Add the following variables to track the current mode and the correct answer
let currentMode = 'normal'; // Default mode is 'normal'

function toggleMode() {
  const modeToggle = document.getElementById('modeToggle');
  const modeLabel = document.getElementById('modeLabel');
  
  if (modeToggle.checked) {
    currentMode = 'american';
    document.getElementById('resultInput').classList.toggle('hidden', true);
    document.getElementById('resultButtons').classList.toggle('hidden', false);
    document.getElementById('resultButtons').classList.toggle('show', true);
  } else {
    currentMode = 'normal';
    document.getElementById('resultInput').classList.toggle('hidden', false);
    document.getElementById('resultButtons').classList.toggle('hidden', true);
    document.getElementById('resultButtons').classList.toggle('show', false);
  }

  // Generate a new question when toggling modes
  generateRandom();
}

// Add the following function to check the answer in American mode
function checkAnswer(userAnswer) {
  // Get the actual result
  const correctAnswer = calculateResultFromEmpty();

  // Get the result from the user selected button
  const userAnswerValue = parseInt(document.getElementsByClassName("resultButton")[userAnswer - 1].innerText)
  // Check if the selected answer is correct
  const resultIsCorrect = userAnswerValue === correctAnswer;

  // Update and display the streak based on the correctness of the answer
  updateScore(resultIsCorrect);

  // Trigger confetti for correct answer
  if (resultIsCorrect) {
    triggerConfetti();
  }

  // Update button colors based on correctness
  updateButtonColors(userAnswer, resultIsCorrect);
}

function calculateResultFromEmpty() {

  const number1 = parseInt(document.getElementById('number1').value, 10);
  const number2 = parseInt(document.getElementById('number2').value, 10);
  const operation = document.getElementById('operation').value;

  return calculateResult(number1, number2, operation);
}

const number1 = parseInt(document.getElementById('number1').value, 10);
const number2 = parseInt(document.getElementById('number2').value, 10);
const operation = document.getElementById('operation').value;
const resultInput = document.getElementById('result');
const result = parseInt(resultInput.value, 10);

let calculatedResult = calculateResult(number1, number2, operation);

// Add the following function to update button colors based on correctness
function updateButtonColors(userAnswer, resultIsCorrect) {
  const buttons = document.getElementById('resultButtons').getElementsByTagName('button');

  for (let i = 0; i < buttons.length; i++) {
    if (i + 1 === userAnswer) {
      // Highlight the selected button
      buttons[i].classList.add(resultIsCorrect ? 'correct' : 'incorrect');
    } else {
      // Reset other buttons
      buttons[i].classList.remove('correct', 'incorrect');
    }
  }
}

function clearButtonClasses() {
  const buttons = document.getElementById('resultButtons').getElementsByTagName('button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.remove('correct', 'incorrect');
  }
}