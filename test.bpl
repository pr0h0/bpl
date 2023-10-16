1 + 2 * 3 == 7;
(1 + 2) * 3 == 9;

var t : NUMBER = (1 == 1 ? 1 : 0);
print(t);

// var name : STRING = input("Enter your name: ");
// print("Hello " + name);

// 1 + 2 * 3 = 7
var a : NUMBER = 1 + 2 * 3;

if(a == 7){
  print("a is 7");
} else {
  print("something is wrong");
}

var i : NUMBER = 0;
for(i = 0; i<10; i++){
  print(i);
}
print(i);

// (1 + 2) * 3 = 9
var b : NUMBER = (1 + 2) * 3;

if(b == 9){
  print("b is 9");
} else {
  print("something is wrong");
}

if( a > b) {
  print("a is greater than b");
} else if (a < b) {
  print("a is less than b");
} else {
  print("a is equal to b");
}

// (1 + 2 * 3) + ((1 + 2) * 3) = 16
const c : NUMBER = a + b;

if(c == 16){
  print("c is 16");
} else {
  print("something is wrong");
}

func x() : NUMBER {
  return 1;
}

func y(a: NUMBER) : NUMBER {
  return a * a;
}

func square(a: NUMBER) : NUMBER {
  return a * a;
}

var s : NUMBER = square(2);
print(s);

s = s * square(3) ;
print(s);
