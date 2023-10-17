var number: NUMBER = time() % 98 + 1; // 1 - 99

var lower: NUMBER = 1;
var upper: NUMBER = 100;

var tryCount: NUMBER = 0;

var inputValue: NUMBER = 0;

do {
  var suggestion: NUMBER = convert(evalJS(`Math.floor(${(lower + upper) / 2})`), NUMBER);
  inputValue = convert(input(`Guess a number, (suggestion: ${suggestion}) `), NUMBER);

  tryCount++;

  if(inputValue < number) {
    print("Too low!");
    lower = inputValue < lower ? lower : inputValue + 1;
  } else if(inputValue > number) {
    print("Too high!");
    upper = upper > inputValue ? inputValue - 1 : upper;
  } else {
    print(`Correct! You guessed it in ${tryCount} tries!`);
    break;
  }
} until(inputValue == number)

