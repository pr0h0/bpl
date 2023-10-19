/**
  Currying is a technique of creating function inside of a function, capturing the outer function's variables.
  Here we have example of currying in BPL. We capure n variable in pow and return new function that calculates power of n.
  We can use this function to create new functions that calculate square or cube of a number.
**/

func pow(n: NUMBER): FUNC {
  return func (x: NUMBER): NUMBER {
    var result: NUMBER = 1;
    for (var i: NUMBER = 0; i < n; i++) {
      result = result * x;
    }
    return result;
  }
}

var square: FUNC = pow(2);
var cube: FUNC = pow(3);

print(square(5)); // 25
print(cube(5)); // 125
