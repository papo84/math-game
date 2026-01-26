let valueUpdated = false;
let testMode = false;
let testTimerId = null;
let testEndTimestamp = null;
let testAskedCount = 0;
let testCorrectCount = 0;
let testResults = [];
let testTargetQuestions = 100;

function generateRandom() {
  valueUpdated = false;
  clearResultColor(); // Clear color before generating new values
  clearButtonClasses(); // Clear result buttons colors

  // Get selected checkboxes for arithmetics
  // 1. Randomize operation from arithmetics
  const operation = getRandomElement(getSelectedArithmetics());

  // Return error if no operation selected
  if (!operation) {
    alert('בחר פעולה');
    return;
  }

  // 2. Randomize Number1 as previously defined
  let number1 = generateRandomNumber(document.getElementById('digits').value);
  if ((operation === 'כפל' || operation === 'חיבור') && document.getElementById('digits').value == 1) {
    // Example logic update
    const digits = document.getElementById("digits").value;
    if (digits === "1") {
      const selectedValues = [];
      document.querySelectorAll("#dropdown-container input[type=checkbox]:checked").forEach(checkbox => {
        selectedValues.push(parseInt(checkbox.value));
      });

      // If no values are selected, assume all are selected
      const valuesToUse = selectedValues.length ? selectedValues : [1, 2, 3, 4, 5, 6, 7, 8, 9];

      // Randomize a value from the selected or default values
      const randomValue = valuesToUse[Math.floor(Math.random() * valuesToUse.length)];
      number1 = randomValue;
    }
  }

  // 3. Generate Number2 based on the selected operation
  let number2;
  if (operation === 'חזקה') {
    // If Power is selected, Number2 is randomized from the values 0, 1, 2, 3
    number2 = getRandomElement([0, 1, 2, 3]);
  } else if (operation === 'חילוק') {
    // If Divide is selected, randomize Number1 as previously
    // Then, find its factors. If not prime, randomize Number2 from the factors, else, randomize Number1 again until non-prime is selected
    let isPrime = false;

    while (!isPrime) {
      number1 = generateRandomNumber(document.getElementById('digits').value); // Randomize Number1 again
      
      // Find factors of Number1
      const factors = findFactors(number1);
      const digits = document.getElementById("digits").value;
      if (factors.length > 2) {
        // Remove 1 and number1 from factors when number1 is greater than 100
        if(number1>100) {
          const indexToRemove = factors.indexOf(1);
          if (indexToRemove !== -1) {
            factors.splice(indexToRemove, 1);
          }
      
          const numberIndexToRemove = factors.indexOf(number1);
          if (numberIndexToRemove !== -1) {
            factors.splice(numberIndexToRemove, 1);
          }
        }
        else if(digits === "2") {
          const selectedValues = [];
          document.querySelectorAll("#dropdown-container input[type=checkbox]:checked").forEach(checkbox => {
            selectedValues.push(parseInt(checkbox.value));
          });
    
          // If no values are selected, assume all are selected
          const valuesToUse = selectedValues.length ? selectedValues : [1, 2, 3, 4, 5, 6, 7, 8, 9];
          const allowed = factors.filter(f => valuesToUse.includes(f));
          if (allowed.length === 0) {
            continue;
          }
          // restrict factors in-place so the selection below uses only allowed divisors
          factors.splice(0, factors.length, ...allowed);
        }
        // Number1 is not prime, so randomize Number2 from the factors
        number2 = getRandomElement(factors);
        isPrime = true; // Exit the loop
      }
    }
  } else if (operation === 'חיסור') {
    // For subtraction, check the options
    const option1 = document.getElementById('option1').checked;
    const option2 = document.getElementById('option2').checked;
    
    if (option1 && option2) {
      // Both options selected: number2 is 1-10 and can be any value
      number2 = Math.floor(Math.random() * 10) + 1;
    } else if (option1) {
      // Only option1 selected: number2 is 1-10 and must be <= number1
      number2 = Math.floor(Math.random() * 10) + 1;
      if (number2 > number1) {
        number2 = Math.floor(Math.random() * number1) + 1;
      }
    } else if (option2) {
      // Only option2 selected: number2 can be any value
      number2 = generateRandomNumber(document.getElementById('digits').value);
    } else {
      // Neither option selected: number2 must be <= number1
      number2 = generateRandomNumber(document.getElementById('digits').value);
      if (number2 > number1) {
        number2 = Math.floor(Math.random() * number1) + 1;
      }
    }
  } else {
    // For other operations, randomize Number2 as previously defined
    number2 = generateRandomNumber(document.getElementById('digits').value);
  }

  // If 'עד 10' (option1) is enabled, enforce extra constraints in regular mode
  const limitToTen = !!document.getElementById('option1')?.checked;
  if (limitToTen) {
    if (operation === 'חיבור') {
      // Ensure sum <= 99 and second operand up to 10
      let attempts = 0;
      while ((number1 + number2 > 99 || number2 > 10) && attempts < 100) {
        const maxAllowed = Math.min(10, 99 - number1);
        if (maxAllowed < 1) {
          // regenerate number1 within 1..99 to allow a valid sum
          number1 = Math.floor(Math.random() * 99) + 1;
          attempts++;
          continue;
        }
        number2 = Math.floor(Math.random() * maxAllowed) + 1;
        attempts++;
      }
    } else if (operation === 'חיסור') {
      // Prevent negative results and keep second operand up to 10
      const maxN2 = Math.min(10, number1);
      number2 = Math.max(1, Math.min(number2, maxN2));
    } else if (operation === 'חילוק') {
      // Keep quotient <= 9; also respect digits dropdown when digits==2
      let attempts = 0;
      while (attempts < 100) {
        const factors = findFactors(number1);
        // Exclude 0 and avoid division by zero implicitly
        let allowed = factors.filter(f => f > 0 && (number1 / f) <= 9);
        const digitsVal = document.getElementById('digits') ? document.getElementById('digits').value : null;
        if (digitsVal === "2") {
          const selectedValues = [];
          document.querySelectorAll("#dropdown-container input[type=checkbox]:checked").forEach(cb => {
            const v = parseInt(cb.value, 10);
            if (!isNaN(v)) selectedValues.push(v);
          });
          const valuesToUse = selectedValues.length ? selectedValues : [1,2,3,4,5,6,7,8,9];
          allowed = allowed.filter(f => valuesToUse.includes(f));
        }
        if (allowed.length > 0) {
          number2 = getRandomElement(allowed);
          break;
        }
        // No allowed divisors for current number1: regenerate number1 within 1..99
        number1 = Math.floor(Math.random() * 99) + 1;
        attempts++;
      }
    }
  }

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

function generateTestQuestion() {
  // Force normal input mode UI during test
  const modeToggleContainer = document.querySelector('.mode-toggle');
  if (modeToggleContainer) modeToggleContainer.classList.add('hidden');
  document.getElementById('resultInput').classList.toggle('hidden', false);
  document.getElementById('resultButtons').classList.toggle('hidden', true);
  document.getElementById('resultButtons').classList.toggle('show', false);

  clearResultColor();
  clearButtonClasses();

  // Randomly choose operation: +, -, *, :
  const operations = ['חיבור', 'חיסור', 'כפל', 'חילוק'];
  const operation = getRandomElement(operations);

  let number1, number2;
  if (operation === 'כפל') {
    // multiply: both single digit (1..9)
    number1 = Math.floor(Math.random() * 9) + 1;
    number2 = Math.floor(Math.random() * 9) + 1;
  } else if (operation === 'חילוק') {
    // division: first up to 2 digits (<=99), second single digit, result single digit
    // choose divisor (1..9) and quotient (1..9), ensure product <= 99
    let valid = false;
    while (!valid) {
      const divisor = Math.floor(Math.random() * 9) + 1;
      const quotient = Math.floor(Math.random() * 9) + 1;
      const product = divisor * quotient;
      if (product <= 99) {
        number1 = product;
        number2 = divisor;
        valid = true;
      }
    }
  } else if (operation === 'חיבור') {
    // addition: first up to 2 digits (1..99), second single digit (1..9), result must be <= 99
    let maxN2 = 0;
    do {
      number1 = Math.floor(Math.random() * 99) + 1;
      maxN2 = Math.min(9, 99 - number1);
    } while (maxN2 < 1);
    number2 = Math.floor(Math.random() * maxN2) + 1;
  } else { // 'חיסור'
    // subtraction: first up to 2 digits (1..99), second single digit (1..9), result must be non-negative
    number1 = Math.floor(Math.random() * 99) + 1;
    const maxN2 = Math.min(9, number1);
    number2 = Math.floor(Math.random() * maxN2) + 1;
  }

  document.getElementById('number1').value = number1;
  document.getElementById('number2').value = number2;
  document.getElementById('operation').value = operation;
  document.getElementById('exercise').value = + number1 + ' ' + convertToSymbol(operation) + ' ' + number2 + ' = ?';
  document.getElementById('result').focus();
}

// Helper function to get a random element from an array
function getRandomElement(array) {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

function getSelectedArithmetics() {
  const arithmeticsCheckboxes = document.querySelectorAll('#arithmeticDropdown input[type="checkbox"]:checked');
  return Array.from(arithmeticsCheckboxes).map(checkbox => checkbox.value);
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

// Helper function to find factors of a number
function findFactors(number) {
  const factors = [];
  for (let i = 1; i <= number; i++) {
    if (number % i === 0) {
      factors.push(i);
    }
  }
  return factors;
}

function checkResult() {
  const number1 = parseInt(document.getElementById('number1').value, 10);
  const number2 = parseInt(document.getElementById('number2').value, 10);
  const operation = document.getElementById('operation').value;
  const resultInput = document.getElementById('result');
  const result = parseInt(resultInput.value, 10);

  let calculatedResult = calculateResult(number1, number2, operation);

  if (testMode) {
    const correct = result === calculatedResult;
    handleTestAnswer(correct, { number1, number2, operation, userAnswer: result, correctAnswer: calculatedResult });
    return;
  }

  if (result === calculatedResult) {
    resultInput.style.backgroundColor = 'lightgreen';  // Assuming the result is correct, trigger confetti

    // Update and display the score based on the correctness of the answer
    if (!valueUpdated) {
      updateScore(true);
      valueUpdated = true;
    }
    // Trigger confetti for correct answer
    triggerConfetti();
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
  if (negativeNumber) shuffledArray = shuffledArray.map(number => { return 0 - number; });

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
  const subtractCheckbox = document.getElementById('subtractCheckbox');
  const toggleContainer = document.querySelector('.subtract-container');

  // Initial check for subtract checkbox
  toggleContainer.classList.toggle('hidden', !subtractCheckbox.checked);

  // Add event listener for subtract checkbox
  subtractCheckbox.addEventListener('change', function() {
    toggleContainer.classList.toggle('hidden', !this.checked);
  });

  // Validate digits only when focus leaves the field (allow empty while editing)
  digitsInput.addEventListener('blur', function () {
    validateDigitsOnBlur(digitsInput);
  });

  // While typing, keep updating visibility (but don't coerce value)
  digitsInput.addEventListener('input', function () {
    updateDigitsDropdownVisibility();
  });

  // Update visibility when arithmetic choices change
  ['addCheckbox','multiplyCheckbox','subtractCheckbox','divideCheckbox','powerCheckbox']
    .forEach(function(id){
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', updateDigitsDropdownVisibility);
    });

  // Initialize visibility on load
  updateDigitsDropdownVisibility();
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

// (moved to DOMContentLoaded with richer logic via updateDigitsDropdownVisibility)

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

// Validate digits on blur: allow empty while editing; on blur, set default 2 or clamp 1-5
function validateDigitsOnBlur(inputElement) {
  const raw = (inputElement.value || '').trim();
  let finalValue;

  if (raw === '') {
    finalValue = 2; // default when left empty
  } else {
    let parsed = parseInt(raw, 10);
    if (isNaN(parsed)) {
      parsed = 2;
    }
    if (parsed < 1) parsed = 1;
    if (parsed > 5) parsed = 5;
    finalValue = parsed;
  }

  inputElement.value = finalValue;
  updateDigitsDropdownVisibility();
}

// Determine whether to show the digits dropdown based on selected arithmetics and digits value
function updateDigitsDropdownVisibility() {
  const container = document.getElementById('dropdown-container');
  if (!container) return;

  const digitsVal = parseInt(document.getElementById('digits').value, 10);

  const add = !!document.getElementById('addCheckbox')?.checked;
  const multiply = !!document.getElementById('multiplyCheckbox')?.checked;
  const subtract = !!document.getElementById('subtractCheckbox')?.checked;
  const divide = !!document.getElementById('divideCheckbox')?.checked;
  const power = !!document.getElementById('powerCheckbox')?.checked;

  const onlyAddOrMultiply = (add || multiply) && !subtract && !divide && !power;
  const onlyDivide = divide && !add && !multiply && !subtract && !power;

  const shouldShow = (digitsVal === 1 && onlyAddOrMultiply) || (digitsVal === 2 && onlyDivide);
  container.style.display = shouldShow ? 'block' : 'none';
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

function toggleDropdownArithmeticDropdown() {
  var dropdown = document.getElementById("arithmeticDropdown");
  dropdown.classList.toggle("show");

  // Close the dropdown if it's already open
  if (dropdown.classList.contains("show")) {
    dropdown.style.display = 'block';
    window.onclick = function (event) {
      if (!event.target.matches('.dropbtn') && !event.target.matches('.dropbtnCheckbox')) {
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

function toggleDropdownDigitsDropdown() {
  var dropdown = document.getElementById("digitsDropdown");
  dropdown.classList.toggle("show");

  // Close the dropdown if it's already open
  if (dropdown.classList.contains("show")) {
    dropdown.style.display = 'block';
    window.onclick = function (event) {
      if (!event.target.matches('.dropdown-digit-button') && !event.target.matches('.dropbtnCheckbox')) {
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

  if (testMode) {
    handleTestAnswer(resultIsCorrect, {
      number1: parseInt(document.getElementById('number1').value, 10),
      number2: parseInt(document.getElementById('number2').value, 10),
      operation: document.getElementById('operation').value,
      userAnswer: userAnswerValue,
      correctAnswer: correctAnswer
    });
    return;
  }

  // Update and display the streak based on the correctness of the answer
  updateScore(resultIsCorrect);

  // Trigger confetti for correct answer
  if (resultIsCorrect) {
    triggerConfetti();
  }

  // Update button colors based on correctness
  updateButtonColors(userAnswer, resultIsCorrect);
}

function handleTestAnswer(isCorrect, details) {
  // Update counters
  testAskedCount++;
  if (isCorrect) testCorrectCount++;

  // Append to summary list
  appendTestSummary(details.number1, details.number2, details.operation, details.userAnswer, details.correctAnswer, isCorrect);

  // Update UI counters
  const progressEl = document.getElementById('testProgress');
  const correctEl = document.getElementById('testCorrect');
  if (progressEl) progressEl.textContent = `${testAskedCount}/${testTargetQuestions}`;
  if (correctEl) correctEl.textContent = `נכונות: ${testCorrectCount}`;

  // Check end condition
  if (testAskedCount >= testTargetQuestions) {
    endTestMode();
    return;
  }

  // Next question instantly
  document.getElementById('result').value = '';
  generateTestQuestion();
}

function appendTestSummary(n1, n2, opName, userAnswer, correctAnswer, isCorrect) {
  const summary = document.getElementById('testSummary');
  if (!summary) return;
  summary.classList.remove('hidden');

  const item = document.createElement('div');
  item.className = `test-item ${isCorrect ? 'correct' : 'wrong'}`;
  const op = convertToSymbol(opName);
  item.textContent = `${n1} ${op} ${n2} = ${correctAnswer} | תשובתך: ${userAnswer}`;
  summary.appendChild(item);

  // Save for download
  testResults.push({ n1, n2, op: opName, correctAnswer, userAnswer, isCorrect });
}

function startTestMode() {
  if (testMode) return;
  testMode = true;
  testAskedCount = 0;
  testCorrectCount = 0;
  testResults = [];
  const countSelect = document.getElementById('testCount');
  testTargetQuestions = parseInt(countSelect && countSelect.value ? countSelect.value : '100', 10);

  // Hide mode toggle
  const modeToggleContainer = document.querySelector('.mode-toggle');
  if (modeToggleContainer) modeToggleContainer.classList.add('hidden');

  // Show/Hide controls
  const startBtn = document.getElementById('startTest');
  const endBtn = document.getElementById('endTest');
  const downloadBtn = document.getElementById('downloadResults');
  const summary = document.getElementById('testSummary');
  const progressEl = document.getElementById('testProgress');
  const correctEl = document.getElementById('testCorrect');
  const timerEl = document.getElementById('testTimer');
  if (startBtn) startBtn.classList.add('hidden');
  if (endBtn) endBtn.classList.remove('hidden');
  if (downloadBtn) downloadBtn.classList.add('hidden');
  if (summary) { summary.classList.add('hidden'); summary.innerHTML = ''; }
  if (progressEl) progressEl.textContent = `0/${testTargetQuestions}`;
  if (correctEl) correctEl.textContent = `נכונות: 0`;
  if (timerEl) timerEl.textContent = `10:00`;

  // Start timer (10 minutes)
  const now = Date.now();
  testEndTimestamp = now + 10 * 60 * 1000;
  if (testTimerId) clearInterval(testTimerId);
  testTimerId = setInterval(updateTestTimer, 250);

  // Generate first question
  generateTestQuestion();
}

function updateTestTimer() {
  const remainingMs = Math.max(0, testEndTimestamp - Date.now());
  const totalSeconds = Math.floor(remainingMs / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');
  const timerEl = document.getElementById('testTimer');
  if (timerEl) timerEl.textContent = `${mm}:${ss}`;

  if (remainingMs <= 0) {
    endTestMode();
  }
}

function endTestMode() {
  if (!testMode) return;
  testMode = false;
  if (testTimerId) {
    clearInterval(testTimerId);
    testTimerId = null;
  }

  // Show score
  const score = testCorrectCount;
  showTestModal(score);
  if (score === testTargetQuestions) {
    triggerConfetti();
  }

  // Restore controls
  const startBtn = document.getElementById('startTest');
  const endBtn = document.getElementById('endTest');
  const downloadBtn = document.getElementById('downloadResults');
  const clearBtn = document.getElementById('clearTest');
  if (startBtn) startBtn.classList.remove('hidden');
  if (endBtn) endBtn.classList.add('hidden');
  if (downloadBtn) downloadBtn.classList.remove('hidden');
  if (clearBtn) clearBtn.classList.remove('hidden');

  // Show mode toggle again
  const modeToggleContainer = document.querySelector('.mode-toggle');
  if (modeToggleContainer) modeToggleContainer.classList.remove('hidden');
}

function downloadTestResults() {
  if (!testResults.length) return;
  // CSV export
  const header = ['number1','operation','number2','correctAnswer','userAnswer','isCorrect'];
  const rows = testResults.map(r => [r.n1, convertToSymbol(r.op), r.n2, r.correctAnswer, r.userAnswer, r.isCorrect ? 'true' : 'false']);
  const lines = [header.join(','), ...rows.map(arr => arr.join(','))];
  // Prepend BOM for Excel and use CRLF line endings
  const csv = '\\ufeff' + lines.join('\\r\\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `test-results-${testTargetQuestions}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getAllowedOperationsFromSettings() {
  const ops = [];
  const add = document.getElementById('addCheckbox');
  const sub = document.getElementById('subtractCheckbox');
  const mul = document.getElementById('multiplyCheckbox');
  const div = document.getElementById('divideCheckbox');
  if (add && add.checked) ops.push('חיבור');
  if (sub && sub.checked) ops.push('חיסור');
  if (mul && mul.checked) ops.push('כפל');
  if (div && div.checked) ops.push('חילוק');
  return ops.length ? ops : ['חיבור','חיסור','כפל','חילוק'];
}

function generatePrintableQuestion(ops) {
  const operation = getRandomElement(ops);
  let number1, number2;
  if (operation === 'כפל') {
    number1 = Math.floor(Math.random() * 9) + 1;
    number2 = Math.floor(Math.random() * 9) + 1;
  } else if (operation === 'חילוק') {
    let valid = false;
    while (!valid) {
      const divisor = Math.floor(Math.random() * 9) + 1;
      const quotient = Math.floor(Math.random() * 9) + 1;
      const product = divisor * quotient;
      if (product <= 99) {
        number1 = product;
        number2 = divisor;
        valid = true;
      }
    }
  } else if (operation === 'חיבור') {
    let maxN2 = 0;
    do {
      number1 = Math.floor(Math.random() * 99) + 1;
      maxN2 = Math.min(9, 99 - number1);
    } while (maxN2 < 1);
    number2 = Math.floor(Math.random() * maxN2) + 1;
  } else { // חיסור
    number1 = Math.floor(Math.random() * 99) + 1;
    const maxN2 = Math.min(9, number1);
    number2 = Math.floor(Math.random() * maxN2) + 1;
  }
  return { number1, number2, operation };
}

function generatePrintableTest() {
  const countSelect = document.getElementById('testCount');
  const questionsCount = parseInt(countSelect && countSelect.value ? countSelect.value : '100', 10);
  const ops = getAllowedOperationsFromSettings();
  const questions = [];
  for (let i = 0; i < questionsCount; i++) {
    questions.push(generatePrintableQuestion(ops));
  }
  const w = window.open('', '_blank');
  if (!w) return;
  const style = `
    <style>
      body { font-family: Arial, sans-serif; direction: rtl; }
      .sheet { max-width: 800px; margin: 0 auto; padding: 16px; }
      h2 { text-align: center; }
      .q-list { list-style: none; padding: 0; margin: 0; columns: 2; -webkit-columns: 2; -moz-columns: 2; }
      .q-list li { padding: 6px 8px; margin-bottom: 6px; break-inside: avoid; }
      .eq { direction: ltr; unicode-bidi: bidi-override; display: inline-block; }
      .meta { display: flex; justify-content: space-between; margin-bottom: 12px; }
      @media print { .no-print { display: none; } }
    </style>
  `;
  const listItems = questions.map((q) => {
    const sym = convertToSymbol(q.operation);
    return `<li><span class="eq">${q.number1} ${sym} ${q.number2} = ______</span></li>`;
  }).join('');
  const html = `
    <!doctype html>
    <html lang="he">
      <head>
        <meta charset="utf-8">
        ${style}
        <title>מבחן חשבון (${questionsCount} שאלות)</title>
      </head>
      <body>
        <div class="sheet">
          <div class="meta">
            <div>שם: __________</div>
            <div>תאריך: __________</div>
          </div>
          <h2>מבחן חשבון (${questionsCount} שאלות)</h2>
          <ul class="q-list">
            ${listItems}
          </ul>
          <div class="no-print">
            <button onclick="window.print()">הדפס</button>
          </div>
        </div>
      </body>
    </html>
  `;
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
}

function showTestModal(score) {
  const modal = document.getElementById('testModal');
  const body = document.getElementById('testModalBody');
  if (!modal || !body) return;
  body.textContent = `הציון שלך: ${score}/${testTargetQuestions}`;
  modal.classList.remove('hidden');
}

function hideTestModal() {
  const modal = document.getElementById('testModal');
  if (!modal) return;
  modal.classList.add('hidden');
}

function clearTestResults() {
  // Reset state
  testAskedCount = 0;
  testCorrectCount = 0;
  testResults = [];
  if (testTimerId) {
    clearInterval(testTimerId);
    testTimerId = null;
  }
  testMode = false;

  // Reset UI
  const progressEl = document.getElementById('testProgress');
  const correctEl = document.getElementById('testCorrect');
  const timerEl = document.getElementById('testTimer');
  const summary = document.getElementById('testSummary');
  const startBtn = document.getElementById('startTest');
  const endBtn = document.getElementById('endTest');
  const downloadBtn = document.getElementById('downloadResults');
  const clearBtn = document.getElementById('clearTest');
  if (progressEl) progressEl.textContent = `0/100`;
  const countSelect = document.getElementById('testCount');
  const countVal = parseInt(countSelect && countSelect.value ? countSelect.value : '100', 10);
  if (progressEl) progressEl.textContent = `0/${countVal}`;
  if (correctEl) correctEl.textContent = `נכונות: 0`;
  if (timerEl) timerEl.textContent = `10:00`;
  if (summary) { summary.classList.add('hidden'); summary.innerHTML = ''; }
  if (startBtn) startBtn.classList.remove('hidden');
  if (endBtn) endBtn.classList.add('hidden');
  if (downloadBtn) downloadBtn.classList.add('hidden');
  if (clearBtn) clearBtn.classList.add('hidden');

  // Show mode toggle
  const modeToggleContainer = document.querySelector('.mode-toggle');
  if (modeToggleContainer) modeToggleContainer.classList.remove('hidden');
  hideTestModal();
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

document.getElementById('subtractCheckbox').addEventListener('change', function() {
  const toggleContainer = document.querySelector('.subtract-container');
  if (this.checked) {
    toggleContainer.classList.remove('hidden');
  } else {
    toggleContainer.classList.add('hidden');
  }
});
