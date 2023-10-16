import flow from ".";
import InputService from "./services/input.service";

function main() {
  console.log('Welcome to the BPL: "Best Programing Language"');

  let file = "./test.bpl",
    content;
  const args = process.argv.slice(2);
  if (args.length > 0) {
    file = args[0];
    content = InputService.getFileContent(file);
  } else {
    content = InputService.getFileContent(file);
  }

  flow(content);
}

main();
