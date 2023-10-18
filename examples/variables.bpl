/**
  Variables in BPL are declared using the `var` and `const` keywords.
  `var` is used to declare variables that can be reassigned, while `const` is used to declare variables that cannot be reassigned.
  Each variable must be declared with a type annotation and aprropriate value.
  The type annotation is used to determine the type of the variable.

  Syntax:
    var <variable_name>: <type> = <value>;
    const <variable_name>: <type> = <value>;
**/

var a: NUMBER = 10;
var b: STRING = "Hello World";
var c: BOOL = true;

const d: NUMBER = 10;
const e: STRING = "Hello World";
const f: BOOL = true;

var g: NUMBER = time();
var h: STRING = version;
var i: BOOL = b == e;

a = PI;
b = e;
c = f;

a++;
b = b + "!";
c = c == false;

print(`a = ${a}`);
print(`b = ${b}`);
print(`c = ${c}`);

print(`d = ${d}`);
print(`e = ${e}`);
print(`f = ${f}`);

print(`g = ${g}`);
print(`h = ${h}`);
print(`i = ${i}`);