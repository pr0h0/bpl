# BPL - Best Programming Language
## What is BPL?
BPL is a yet another programming language that is built on top of JavaScript/TypeScript and it's general purpose. It's interpreted but it have strict types. It's slow but it's easy to use. It's not the best programming language yet but it will be the Best Programming Language.

## How to use BPL?
You can use BPL in two ways:
- Using the BPL REPL
- Using the BPL from file

First run `npm install` to install all dependencies
Then run `npm run build` to build the project

### Using the BPL REPL
To use the BPL REPL just run `npm start` and REPL will start
You can type `#help` inside the REPL to get help with some other commands

### Using the BPL from file
To use the BPL from file just run `npm run start:file <path to file>` and REPL will start and will interpret the file

## How to write BPL code?
BPL code is very similar to JavaScript/TypeScript code. It's case sensitive and it's using `;` as statement separator but it's optional. It's using `//` for single line comments and `/* */` for multiline comments. 

### Variables
To declare variable you can use `var` or `const` keyword. `var` is used for variables that can be reassigned and `const` is used for variables that can't be reassigned. After that put variable name, colon, and variable type and assign a value. Variables can't be without type or value. Variables are declared like this:
```
var a: NUMBER = 5;
const b: STRING = "Hello World";
var c: BOOL = true;
```

Arrays and Objects are not supported yet

### Types
There are 4 primitive types in BPL:
- `NUMBER` - number type
- `STRING` - string type
- `BOOL` - boolean type
- `VOID` - void type
It also supports `ANY` type that can be anything but it can't be used in code, currently it's used for native function arguments and return type

Currently there is no support for custom types

### Functions
To declare function you can use `func` keyword. After that put function name, open parenthesis, arguments separated by comma, close parenthesis, colon and return type. After that put function body in curly braces. Functions are declared like this:
```
func add(a: NUMBER, b: NUMBER): NUMBER {
    return a + b;
}
```

### If statements
To declare if statement you can use `if` keyword. After that put open parenthesis, condition, close parenthesis and put if statement body in curly braces. If statements are declared like this:
```
if (a > b) {
    return a;
}
```

### While loops
To declare while loop you can use `while` keyword. After that put open parenthesis, condition, close parenthesis and put while loop body in curly braces. While loops are declared like this:
```
while (a < b) {
    a = a + 1;
}
```

### Until loops
Until loops are same as while loops but it runs while condition is false. To declare until loop you can use `until` keyword. After that put open parenthesis, condition, close parenthesis and put until loop body in curly braces. Until loops are declared like this:
```
until (a > b) {
    a = a + 1;
}
```

### Do while loops
Do while loops are same as while loops but it runs at least once. To declare do while loop you can use `do` keyword. After that put do while loop body in curly braces, `while` keyword, open parenthesis, condition, close parenthesis. Do while loops are declared like this:
```
do {
    a = a + 1;
} while (a < b);
```

### Do until loops
Do until loops are same as until loops but it runs at least once. To declare do until loop you can use `do` keyword. After that put do until loop body in curly braces, `until` keyword, open parenthesis, condition, close parenthesis. Do until loops are declared like this:
```
do {
    a = a + 1;
} until (a > b);
```

### For loops
To declare for loop you can use `for` keyword. After that put open parenthesis, initializator, it can be any expression but it can't be empty, semicolon, condition can be anything but it can't be skipped, semicolon, increment can be any expression but it needs to be present, close parenthesis and put for loop body in curly braces. For loops are declared like this:
```
for (var i: NUMBER = 0; i < 10; i++) {
    a = a + 1;
}
```

### Break and continue
To break out of loop you can use `break` keyword. To skip current iteration of loop you can use `continue` keyword. They can be used only inside loops

### Return
To return value from function you can use `return` keyword. It can be used only inside functions

### Template strings
To use template strings you can use backtick character. Inside template string you can use variables and functions. To use variable or function inside template string you need to put `${}` character and then variable or function name inside. Template strings are declared like this:
```
var a: NUMBER = 5;
var b: NUMBER = 10;
var c: STRING = `a + b = ${add(a, b)}`;
```

### Native functions (STL)
Curreny there are some native functions that are part of STL (Standard Template Library):
- `print(value:ANY):VOID` - prints value to console
- `input(prompt:STRING):STRING` - gets input from user
- `time():NUMBER` - returns current time in milliseconds (`Date.now()`)
- `convert(value:ANY, type:TYPE):ANY` - converts value to type and return it
- `evalJS(code:STRING):ANY` - evaluates JavaScript code and returns result

### Native variables (STL)
Curreny there are some native variables that are part of STL (Standard Template Library):
- `PI:NUMBER` - pi number
- `version:STRING` - BPL version


## Examples
All examples are in `examples` folder, there are fibonacci example, guess the number game and some other examples

## How to run examples?
To run examples just run `npm run start:file examples/<name of the example>`

## How to contribute?
You can contribute by creating issues, pull requests or by creating new examples

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details