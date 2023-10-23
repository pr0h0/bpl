import InterpreterError from '../Errors/InterpreterError';
import { NumberValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class NumberLiteralExpr extends Expr {
    constructor(public value: number) {
        super(ExprType.NUMBER_LITERAL_EXPR);
    }

    protected override parsedValue: NumberValue = new NumberValue(0);

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(): NumberValue {
        const value = Number(this.value.toString());
        if (isNaN(value)) {
            throw new InterpreterError('Cannot parse number literal', this);
        }
        return (this.parsedValue = new NumberValue(value));
    }
    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
