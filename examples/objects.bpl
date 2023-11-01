type ADDRESS {
  street: STRING,
  city: STRING,
  state: STRING,
  zip: NUMBER,
}
print(typeof(ADDRESS))
print(ADDRESS)

var address: ADDRESS = {
  street: "123 Main St",
  city: "Anytown",
  state: "NY",
  zip: 12345,
}
print(typeof(address))
print(address)

func printAddress(address: ADDRESS) {
  print(`Street: ${address.street}`);
  print(`City: ${address.city}`)
  print(`State: ${address.state}`)
  print(`Zip: ${address.zip}`)
}
printAddress(address)

type USER {
  name: STRING,
  age: NUMBER,
  address: ADDRESS,
}
print(typeof(USER))
print(USER)

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

func printUser(user: USER) {
  print(`Name: ${user.name}`);
  print(`Age: ${user.age}`)
  print(user.address)
}
printUser(user)
