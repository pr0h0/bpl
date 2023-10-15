1 + 2 * 3 == 7;
(1 + 2) * 3 == 9;

func printInt(a: int) : void {
  return a;
}

func printString(a: string) : void {
  return a;
}

// 1 + 2 * 3 = 7
var a : int = 1 + 2 * 3;

if(a == 7){
  printString("a is 7");
} else {
  printSting("something is wrong");
}

for(var i:int = 0; i<10; i++){
  printInt(i);
}

// (1 + 2) * 3 = 9
var b : int = (1 + 2) * 3;

if(b == 9){
  printString("b is 9");
} else {
  printString("something is wrong");
}

if( a > b) {
  printString("a is greater than b");
} else if (a < b) {
  printString("a is less than b");
} else {
  printString("a is equal to b");
}

// (1 + 2 * 3) + ((1 + 2) * 3) = 16
const c : int = a + b;

if(c == 16){
  printString("c is 16");
} else {
  printString("something is wrong");
}

func x() : int {
  return 1;
}

func y(a: int) : int {
  return a * a;
}