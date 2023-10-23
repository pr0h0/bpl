import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import ValueType from '../Interpreter/ValueType';
import { ArrayValue, RuntimeValue } from '../Interpreter/Values';
import ExprType from '../Parser/ExprType';
import PrintService from '../services/print.service';
import { Expr } from './Expr';

export class ArrayLiteralExpr extends Expr {
    constructor(public values: Expr[]) {
        super(ExprType.ARRAY_LITERAL_EXPR);
    }

    public override isEvaluateImplemented: boolean = true;
    public override parsedValue: ArrayValue = new ArrayValue([], ValueType.VOID);

    public override evaluate(interpreter: Interpreter) {
        const values = this.values
            .map((value) => interpreter.evaluate(value))
            .flat(Infinity)
            .map((value) => value as RuntimeValue);
        if (!values.every((value) => value.type === values[0].type)) {
            throw new InterpreterError(`All values in array must be of same type`, this);
        }
        return (this.parsedValue = new ArrayValue(values, values[0].type ?? ValueType.ANY));
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
