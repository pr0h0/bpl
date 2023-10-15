import { Expr } from "../Parser/Expr";

class InterpreterError extends Error {
  constructor(message: string, expr: Expr | null) {
    super(message);
    this.name = InterpreterError.name;
    this.expr = expr;
  }

  public expr: Expr | null;

  public override toString(): string {
    return `Interpreter:: ${this.message} [${this.expr?.type}]`;
  }
}

export default InterpreterError;
