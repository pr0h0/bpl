import flow from ".";
import InputService from "./services/input.service";

function main() {
  console.log('Welcome to the BPL: "Best Programing Language"');

  const file = "./test.bpl";
  const content = InputService.getFileContent(file);

  flow(content);
}

main();
