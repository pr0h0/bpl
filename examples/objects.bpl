type ADDRESS = {
  street: STRING,
  city: STRING,
  state: STRING,
  zip: NUMBER,
}
print(typeof(ADDRESS))
print(ADDRESS)

type USER = {
  name: STRING,
  age: NUMBER,
  address: ADDRESS,
}
print(typeof(USER))
print(USER)

var address: ADDRESS = {
  street: "123 Main St",
  city: "Anytown",
  state: "NY",
  zip: 12345,
}
print(typeof(address))
print(address)

var user: USER = {
  name: "John Doe",
  age: 30,
  address: address,
}
print(typeof(user))
print(user)


print(`Name: ${user.name}`);
print(`Age: ${user.age}`)
print(user.address)