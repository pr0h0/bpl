/**
  In BPL we have 5 types of the loops:
  1. for loop
  2. while loop
  3. do while loop
  4. until loop
  5. do until loop
**/

/**
  1. For loop follows the JavaScript syntax, we have initializer, condition and increment/decrement.
  Of course we can put any expression in the initializer, condition and increment/decrement, but it is not recommended.
  The for loop is used when we know how many times we want to execute the loop.
  Initializer is evaluated only once, before the first iteration.
  Condition is evaluated before each iteration, if it is true, the loop continues, otherwise it stops.
  Increment/decrement is evaluated after each iteration.
  Also we have the break and continue statements, which are the same as in JavaScript.
  The break statement stops the loop and the continue statement skips the current iteration and goes to the next one.
  Also we have failsafe value which is evaluated only once before the first iteration, even before the initializer.
  It's purpose is to prevent infinite loops. It's optional, if it is not provided, the loop will run until condition is true.  
  Condition type is BOOLEAN and it must be provided as that, otherwise it will be considered false for any other TYPE;

  Syntax:
  for(initializer; condition:BOOLEAN; increment/decrement) [failsafe:NUMBER] {
    // code
  }
**/

// Example 1 - Simple for loop 
for(var i:NUMBER = 0; i < 10; i++) {
  print(i);
}

// Example 2 - For loop with failsafe value
for(var i:NUMBER = 0; i < 10; i++) 10 {
  print(i);
}

// Example 3 - Minimal valid for loop setup
for(1;true;1) {
  print("Hello World");
  break;
}

/**
  2. While loop is the same as in JavaScript, it has only condition and code block.
  The condition is evaluated before each iteration, if it is true, the loop continues, otherwise it stops.
  Also we have the break and continue statements, which are the same as in JavaScript.
  The break statement stops the loop and the continue statement skips the current iteration and goes to the next one.
  Also we have failsafe value which is evaluated only once before the first iteration.
  Condition type is BOOLEAN and it must be provided as that, otherwise it will be considered false for any other TYPE;

  Syntax:
  while(condition:BOOLEAN) [failsafe:NUMBER] {
    // code
  }
**/

// Example 1 - Simple while loop
var i:NUMBER = 0;
while(i < 10) {
  print(i);
  i++;
}

// Example 2 - While loop with failsafe value
i = 0;
while(i < 10) 10 {
  print(i);
  i++;
}

// Example 3 - Minimal valid while loop setup
while(true) {
  print("Hello World");
  break;
}

/**
  3. Do while loop is the same as in JavaScript, it has only condition and code block.
  The condition is evaluated after each iteration, if it is true, the loop continues, otherwise it stops.
  Also we have the break and continue statements, which are the same as in JavaScript.
  The break statement stops the loop and the continue statement skips the current iteration and goes to the next one.
  Also we have failsafe value which is evaluated only once before the first iteration.
  Condition type is BOOLEAN and it must be provided as that, otherwise it will be considered false for any other TYPE;

  Syntax:
  do [failsafe:NUMBER] {
    // code
  } while(condition:BOOLEAN)
**/

// Example 1 - Simple do while loop
i = 0;
do {
  print(i);
  i++;
} while(i < 10);

// Example 2 - Do while loop with failsafe value
i = 0;
do 10 {
  print(i);
  i++;
} while(i < 10);

// Example 3 - Minimal valid do while loop setup
do {
  print("Hello World");
  break;
} while(true);

/**
  4. Until loop is the same as while loop, but the condition is inverted. It runs while the condition is false.
  The condition is evaluated before each iteration, if it is false, the loop continues, otherwise it stops.
  Also we have the break and continue statements, which are the same as in JavaScript.
  The break statement stops the loop and the continue statement skips the current iteration and goes to the next one.
  Also we have failsafe value which is evaluated only once before the first iteration.
  Condition type is BOOLEAN and it must be provided as that, otherwise it will be considered false for any other TYPE;

  Syntax:
  until(condition:BOOLEAN) [failsafe:NUMBER] {
    // code
  }
**/

// Example 1 - Simple until loop
i = 0;
until(i >= 10) {
  print(i);
  i++;
}

// Example 2 - Until loop with failsafe value
i = 0;
until(i >= 10) 10 {
  print(i);
  i++;
}

// Example 3 - Minimal valid until loop setup
until(false) {
  print("Hello World");
  break;
}

/**
  5. Do until loop is the same as do while loop, but the condition is inverted. It runs while the condition is false.
  The condition is evaluated after each iteration, if it is false, the loop continues, otherwise it stops.
  Also we have the break and continue statements, which are the same as in JavaScript.
  The break statement stops the loop and the continue statement skips the current iteration and goes to the next one.
  Also we have failsafe value which is evaluated only once before the first iteration.
  Condition type is BOOLEAN and it must be provided as that, otherwise it will be considered false for any other TYPE;

  Syntax:
  do [failsafe:NUMBER] {
    // code
  } until(condition:BOOLEAN)
**/

// Example 1 - Simple do until loop
i = 0;
do {
  print(i);
  i++;
} until(i >= 10);

// Example 2 - Do until loop with failsafe value
i = 0;
do 10 {
  print(i);
  i++;
} until(i >= 10);

// Example 3 - Minimal valid do until loop setup
do {
  print("Hello World");
  break;
} until(false);
