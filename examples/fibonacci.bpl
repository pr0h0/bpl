func fib(n: NUMBER): NUMBER {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}

for(var i: NUMBER = 1; i < 10; i++) {
    print(`${i}:\t${fib(i)}`);
}
