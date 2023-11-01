type ARRAY [NUMBER];
type TUPLE (NUMBER, STRING, NUMBER);
type USER {name: STRING, age: NUMBER};

var user: USER = { name: "John", age: 20 };
var tuple: TUPLE = (1, "2", 3);
var arr: ARRAY = [1,2,3,4,5,6,7];

user.name = "James"
user.age = 25;

print(user);

tuple[0] = 5;
tuple[1] = "6";
tuple[2] = 7;

print(tuple);

arr[0] = 10;
arr[1] = 20;
arr[2] = 30;
arr[3] = 40;
arr[4] = 50;
arr[5] = arr[0] + arr[1] + arr[2] + arr[3] + arr[4];
arr[6] = arr[5] * 2;

print(arr);


tuple[0] = convert((tuple[1] = convert((tuple[2] = 0), STRING)), NUMBER);
print(tuple)

arr[0] = (arr[1] = (arr[2] = (arr[3] = (arr[4] = (arr[5] = (arr[6] = 0))))));
print(arr);

user.name = convert((user.age = 0), STRING);

print(user)
