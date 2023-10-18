import { readFileSync } from 'fs';
import readline from 'readline';
import readlineSync from 'readline-sync';

class InputService {
    static getUserInputSync(prompt: string): string {
        process.stdout.write(prompt);
        const value = readlineSync.question('', {
            bufferSize: 2048,
        });
        return value.toString();
    }
    static getUserInput(prompt = '') {
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
        return readFileSync(file, 'utf-8');
    }
}

export default InputService;
