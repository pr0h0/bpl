import InputService from './services/input.service';
import flow from '.';

function main() {
    let file = './examples/hello-world.bpl';
    let content;

    const args = process.argv.slice(2);
    if (args.length > 0) {
        file = args[0];
        content = InputService.getFileContent(file);
    } else {
        content = InputService.getFileContent(file);
    }

    flow(content, undefined, undefined);
}

main();
