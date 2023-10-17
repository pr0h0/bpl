func getMiddle(n:NUMBER):NUMBER {
    return n / 2
}

const n: NUMBER = time() % 98 + 1;
var inp :STRING= '0';
var lower:NUMBER = 0;
var upper:NUMBER = 100;

for(1;1;1) {
    inp = input(`Enter your guess (${lower}, ${upper})`);
    print(`${inp} ${n}`);
    if (inp == n) {
        print("You guessed it!");
        break;
    } else if (inp < n) {
        print("Too low!");
        lower = inp;
    } else {
        print("Too high!");
        upper = inp;
    }
    print(`The middle is ${getMiddle(lower + upper)}`);
}

