import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import { ArrayValue, NumberValue, RuntimeValue, VoidValue } from '../Interpreter/Values';
import ValueType from '../Interpreter/ValueType';
import ExprType from '../Parser/ExprType';
import PrintService from '../services/print.service';
import { Expr } from './Expr';

export class ArrayAccessExpr extends Expr {
    constructor(public array: string, public index: Expr) {
        super(ExprType.ARRAY_ACCESS_EXPR);
    }

    public override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const array = interpreter.environment.getVariable(this.array) as [ArrayValue, string, boolean];
        const index = this.index.evaluate(interpreter);

        if (!(index instanceof NumberValue)) {
            throw new InterpreterError('Array index must be a number', this.index);
        }

        if (array[1] !== ValueType.ARRAY && array[1] !== ValueType.TUPLE) {
            throw new InterpreterError('Variable is not an array', this);
        }

        const value = array[0]?.value[index.value];
        if (value === undefined) {
            throw new InterpreterError('Array index out of bounds', this);
        }

        return (this.parsedValue = value);
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
