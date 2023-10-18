/**
  This example contains the different ways to use the failsafe value in loops.
  The failsafe value is the maximum number of iterations a loop can run before it breaks.
  It's safety mechanism to prevent infinite loops.
  The failsafe value is optional and if not present will not prevent infinite loops.
  The failsafe value must be a literal or a variable that can be parsed to Number by JavaScript.
  The failsafe is evaluated only once before the loop starts.
  The failsafe if reached will execude break statement and exit the loop.
  The failsafe value can be used with do while, while, do unitl, until and for loops.

  Syntax:
  while(condition) failsafe {
    // code
  }

  until(condition) failsafe {
    // code
  }

  for(initialization; condition; increment) failsafe {
    // code
  }

  do failsafe {
    // code
  } while(condition);

  do failsafe {
    // code
  } until(condition);
**/

var i: NUMBER = 100;
var failsafe: NUMBER = 10;

// will break after 10 iterations
while(i > 0) failsafe {
  print(i);
  i--;
}

i = 100;

// will break after 10 iterations
until(i==0) failsafe {
  print(i);
  i--;
}

// will break after 10 iterations
for(var i: NUMBER = 0; i < 100; i++) failsafe {
  print(i);
}

i = 100;

// will break after 10 iterations
do "10" {
  print(i);
  i--;
} while(i > 0);

i = 100;

// will break after 10 iterations
do 10 {
  print(i);
  i--;
} until(i == 0);