import InterpreterError from './Errors/InterpreterError';
import LexerError from './Errors/LexerError';
import ParserError from './Errors/ParserError';
import Interpreter from './Interpreter/Interpreter';
import Lexer from './Lexer/Lexer';
import Token from './Lexer/Token';
import { Expr } from './Parser/Expr';
import Parser from './Parser/Parser';

export default function flow(
    content: string,
    cliInterpreter: Interpreter | undefined = undefined,
    debug: { showTokens?: boolean; showExpr: boolean; showValues: boolean } = {
        showTokens: false,
        showExpr: false,
        showValues: false,
    },
): void {
    let tokens: Token[] = [];
    try {
        tokens = new Lexer().tokenize(content);

        if (debug.showTokens) {
            for (const token of tokens) {
                console.dir(token, { depth: null });
            }
        }
    } catch (error: unknown) {
        if (error instanceof LexerError) {
            console.error(error.toString());
        } else {
            console.error((error as Error).message);
            console.error((error as Error).stack);
        }
        return;
    }

    let ast: Expr[] | null = null;

    try {
        ast = new Parser().parse(tokens);
        if (debug.showExpr) {
            for (const stmt of ast) {
                console.dir(stmt, { depth: null });
            }
        }
    } catch (error: unknown) {
        if (error instanceof ParserError) {
            console.error(error.toString());
        } else {
            console.error((error as Error).message);
            console.error((error as Error).stack);
        }
        return;
    }

    try {
        if (ast) {
            const interpreter = cliInterpreter || new Interpreter();
            const value = interpreter.evaluate(ast);

            if (debug.showValues) {
                console.dir(value, { depth: null });
            }
        }
    } catch (error: unknown) {
        if (error instanceof InterpreterError) {
            console.error(error.toString());
        } else {
            console.error((error as Error).message);
            console.error((error as Error).stack);
        }
        return;
    }
}
