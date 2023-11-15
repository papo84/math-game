let valueUpdated = false;

function generateRandom() {
  valueUpdated = false;
  clearResultColor(); // Clear color before generating new values

  // Get selected checkboxes for arithmetics
  const arithmeticsCheckboxes = document.querySelectorAll('#arithmetics input[type="checkbox"]:checked');
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
  document.getElementById('exercise').value = '? = ' + number2 + ' ' + convertToSymbol(operation) + ' ' + number1;
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

  if (result === calculatedResult) {
    resultInput.style.backgroundColor = 'lightgreen';  // Assuming the result is correct, trigger confetti

    var confetties = ['confetti', 'stars', 'hearts'];
    var randomIndex = Math.floor(Math.random() * confetties.length);
    var selectedVersion = confetties[randomIndex];
    resultInput.style.backgroundColor = 'lightgreen';  // Assuming the result is correct, trigger confetti
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
    // Update and display the score based on the correctness of the answer
    if(!valueUpdated) {
      updateScore(true);
      valueUpdated = true;
    }
  } else {
    resultInput.style.backgroundColor = '#FFCCCB';
    // Update and display the score based on the correctness of the answer
    if(!valueUpdated) {
      updateScore(false);
      valueUpdated = true;
    }
  }
}

function triggerConfetti() {
  // Configure confetti options
  const confettiConfig = {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  };

  // Trigger confetti
  confetti(confettiConfig);
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
  } else {
    // Reset streak for wrong answer
    streak = 0;
  }

  // Display the updated streak and high score
  streakElement.textContent = `רצף נוכחי: ${streak}`;
  highScoreElement.textContent = `שיא: ${highScore}`;
}