import flow from ".";
import Interpreter from "./Interpreter/Interpreter";
import InputService from "./services/input.service";

async function main() {
  console.log('Welcome to the BPL: "Best Programing Language"');

  const interpreter = new Interpreter();
  let showTokens = false;
  let showExpr = false;
  let showValues = false;

  while (true) {
    const input = await InputService.getUserInput("BPL > ");

    if (input === "#exit") break;
    if (input === "#token") {
      showTokens = !showTokens;
      continue;
    }
    if (input === "#expr") {
      showExpr = !showExpr;
      continue;
    }
    if (input === "#value") {
      showValues = !showValues;
      continue;
    }
    if (input === "#help") {
      console.log("#token - toggle tokens");
      console.log("#expr - toggle ast");
      console.log("#value - toggle values");
      console.log("#exit - exit the program");
      continue;
    }

    if (!input) console.log("Enter #exit to exit the program.");

    flow(input, interpreter, {
      showTokens,
      showExpr,
      showValues,
    });
  }

  process.exit(0);
}

main();
