/**
  Functions in BPL are represented by the `func` keyword. Functions can be declared in any scope and called in many places.
  Functions must have name, return type and body. Functions can have parameters, which are declared in the same way as variables.
  Curerntly BPL does not support function overloading.

  Syntax:
    func <name> ([<name:TYPE>, <name:TYPE>, ...]): <return type> {
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
func hello(): VOID {
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
