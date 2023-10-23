import flow from '.';
import Interpreter from './Interpreter/Interpreter';
import InputService from './services/input.service';

async function main() {
    console.log('Welcome to the BPL: "Best Programing Language"');

    const interpreter = new Interpreter();
    let showTokens = false;
    let showExpr = false;
    let showValues = false;

    const history: string[] = [];

    while (true) {
        let input = await InputService.getUserInput('BPL > ');

        if (!input) {
            console.log('Enter #exit to exit the program.');
            continue;
        }

        if (input === '#exit') break;
        if (input === '#token') {
            showTokens = !showTokens;
            continue;
        }

        if (input === '#expr') {
            showExpr = !showExpr;
            continue;
        }

        if (input === '#value') {
            showValues = !showValues;
            continue;
        }

        if (input === '#clear') {
            console.clear();
            continue;
        }

        if (input === '#on') {
            showTokens = true;
            showExpr = true;
            showValues = true;
            continue;
        }

        if (input === '#off') {
            showTokens = false;
            showExpr = false;
            showValues = false;
            continue;
        }

        if (input === '#help') {
            console.log(
                [
                    '\tBPL REPL Help',
                    '#token - toggle tokens',
                    '#expr - toggle ast',
                    '#value - toggle values',
                    '#clear - clear the console',
                    '#on - turn on all toggles',
                    '#off - turn off all toggles',
                    '#history - show history',
                    '#<index> - run line from history',
                    '#help - show this help',
                    '#version - show version',
                    '#exit - exit the program',
                ].join('\n\t'),
            );
            continue;
        }

        if (input === '#version') {
            console.log('BPL version 0.1.0');
            continue;
        }

        if (input === '#history') {
            if (!history.length) {
                console.log('No history');
            } else {
                console.log(history.map((h, i) => `${i + 1}. ${h}`).join('\n'));
                console.log('Enter #<index> to run a line from history.');
            }
            continue;
        }

        if (input && !input?.startsWith('#')) {
            history.push(input);
        }

        if (/^\#(\d)+$/.test(input)) {
            const index = Number(input.slice(1)) - 1;
            if (history[index]) {
                input = history[index];
                console.log(`> ${input}`);
            } else {
                console.log('Invalid history index');
                continue;
            }
        }

        flow(input, interpreter, {
            showTokens,
            showExpr,
            showValues,
        });
    }

    process.exit(0);
}

main();
