import InterpreterError from "./Errors/InterpreterError";
import LexerError from "./Errors/LexerError";
import ParserError from "./Errors/ParserError";
import Interpreter from "./Interpreter/Interpreter";
import Lexer from "./Lexer/Lexer";
import Token from "./Lexer/Token";
import { Expr } from "./Parser/Expr";
import Parser from "./Parser/Parser";

export default function flow(
  content: string,
  cliInterpreter?: Interpreter
): void {
  let tokens: Token[] = [];
  try {
    tokens = Lexer.tokenize(content);

    // for (let token of tokens) {
    // console.log(token);
    // }
  } catch (error: unknown) {
    console.error((error as Error | LexerError).toString());
  }

  let ast: Expr[] | null = null;

  try {
    ast = Parser.parse(tokens);
    // for (let stmt of ast) {
    //   console.dir(stmt, { depth: null });
    // }
  } catch (error: unknown) {
    console.error((error as Error | ParserError).toString());
  }

  try {
    if (ast) {
      const interpreter = cliInterpreter || new Interpreter();
      interpreter.evaluate(ast);
    }
  } catch (e) {
    console.error(((e as Error) || InterpreterError).toString());
  }
}
