import flow from ".";
import Interpreter from "./Interpreter/Interpreter";
import InputService from "./services/input.service";

async function main() {
  console.log('Welcome to the BPL: "Best Programing Language"');

  const interpreter = new Interpreter();
  while (true) {
    const input = await InputService.getUserInput("BPL > ");

    if (input === "#exit" || !input) {
      break;
    }

    flow(input, interpreter);
  }

  process.exit(0);
}

main();
