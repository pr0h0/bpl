/**
  Here we have a simple number guessing game. The computer will pick a random number between 1 and 100 and the user will try to guess it.
  The computer will tell the user if their guess is too high or too low. The user will keep guessing until they get it right.
  We did this using a do-until loop. This is a special kind of loop that will always run at least once. The condition is checked at the end of the loop.
  We read user input and conver it to a number using the convert function and then we compare it to the random number.
**/

var number: NUMBER = time() % 98 + 1; // 1 - 99

var lower: NUMBER = 1;
var upper: NUMBER = 100;

var tryCount: NUMBER = 0;

var inputValue: NUMBER = 0;

do {
  var suggestion: STRING = ((lower != upper) ? `(${lower} - ${upper})` : `(${lower})`);
  inputValue = convert(input(`Guess a number: ${suggestion} `), NUMBER);

  tryCount++;

  if(inputValue < number) {
    print("Too low!");
    lower = inputValue <= lower ? lower : inputValue + 1;
  } else if(inputValue > number) {
    print("Too high!");
    upper = upper >= inputValue ? inputValue - 1 : upper;
  } else {
    print(`Correct! You guessed it in ${tryCount} tries!`);
    break;
  }
} until(inputValue == number)
