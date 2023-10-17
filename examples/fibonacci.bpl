func fib(n: NUMBER): NUMBER {
    if (n <= 1) {
        return n;
    }
    return fib(n - 1) + fib(n - 2);
}

for(var i:NUMBER = 0; i < 30; i++) {
    const startTime: NUMBER = time();
    const result: NUMBER = fib(i);
    const diff: NUMBER = time() - startTime;

    print(`${i}:\t${result}:\t${diff}ms`);

    if(diff > 1000) {
        print("Too slow!")
        break;
    }
}
