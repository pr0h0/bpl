var n: NUMBER = convert(input("Enter a number: "), NUMBER);

func isPrime(n: NUMBER): BOOL {
    if(n % 2 == 0 && n != 2) {
        print (`${n} is divisible by 2`)
        return false;
    }

    var i: NUMBER = 3;

    while (i < n / 2) {
        if (n % i == 0) {
            print(`${n} is divisible by ${i}`)
            return false;
        }
        i = i + 2;
    }
    return true;
}

if (isPrime(n)) {
    print(`${n} is prime`);
} else {
    print(`${n} is not prime`);
}
