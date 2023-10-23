import { Expr } from '../Expr/Expr';

class InterpreterError extends Error {
    constructor(message: string, expr: Expr | null) {
        super(message);
        this.name = InterpreterError.name;
        this.expr = expr;
    }

    public expr: Expr | null;

    public override toString(): string {
        return `Interpreter:: ${this.message} [${this.expr?.type}]\n\n${this.stack}`;
    }
}

export default InterpreterError;
