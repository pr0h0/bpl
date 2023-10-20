/**
  Functions in BPL are represented by the `func` keyword. Functions can be declared in any scope and called in many places.
  Functions must have name and body. Return type is optional and if ommited, VOID is assumed. Functions can have parameters, which are declared in the same way as variables.
  Curerntly BPL does not support function overloading. We have anonymous functions and closures.

  Syntax:
    func <name> ([<name:TYPE>, <name:TYPE>, ...]): [<return type> | VOID] {
      <body>
    }
**/

// Function declaration
func add(a: NUMBER, b: NUMBER): NUMBER {
  return a + b;
}

// Function call
print(`Sum is ${add(1, 2)}`); // 3

// Function with no parameters
func hello() {
  print("Hello, world!")
}

hello(); // Hello, world!

func recursive(n: NUMBER): NUMBER {
  if (n == 0) {
    return 0;
  }
  print(n);
  return n + recursive(n - 1);
}

recursive(5); // 5 4 3 2 1

var f: FUNC = func (a: NUMBER, b: NUMBER): NUMBER {
  return a + b;
}

print(f(1,2)) // 3;

func pow(n: NUMBER): FUNC {
  return func (x: NUMBER): NUMBER {
    return x ** n;
  }
}

var square: FUNC = pow(2);
var cube: FUNC = pow(3);

print(square(2)); // 4
print(cube(2)); // 8
