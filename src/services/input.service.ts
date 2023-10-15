import { readFileSync } from "fs";
import readline from "readline";

class InputService {
  static getUserInput(prompt = "") {
    const cl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise<string>((resolve) => {
      cl.question(prompt, (answer: string) => {
        cl.close();
        resolve(answer);
      });
    });
  }

  static getFileContent(file: string) {
    return readFileSync(file, "utf-8");
  }
}

export default InputService;
