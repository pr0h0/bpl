var n: NUMBER = convert(input("Enter starting number: "), NUMBER);
var counter: NUMBER = 0 -1;

until (n == 1) {
  counter++;
  if(n % 2 == 0) {
    print(`${counter}: ${n} / 2 = ${n / 2}`)
    n = n / 2;
  } else {
    print(`${counter}: ${n} * 3 + 1 = ${(n * 3) + 1}`)
    n = (n * 3) + 1;
  }
}

print(`The process took ${counter} steps to reach 1`);
