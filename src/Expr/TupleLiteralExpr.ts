import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import ValueType from '../Interpreter/ValueType';
import { RuntimeValue, TupleValue } from '../Interpreter/Values';
import ExprType from '../Parser/ExprType';
import PrintService from '../services/print.service';
import { Expr } from './Expr';

export class TupleLiteralExpr extends Expr {
    constructor(public values: Expr[]) {
        super(ExprType.TUPLE_LITERAL_EXPR);
    }

    public override isEvaluateImplemented: boolean = true;
    public override parsedValue: TupleValue = new TupleValue([], [ValueType.VOID, ValueType.VOID]);

    public override evaluate(interpreter: Interpreter) {
        const values = this.values
            .map((value) => interpreter.evaluate(value))
            .flat(Infinity)
            .map((value) => value as RuntimeValue);
        if (values.length < 2) {
            throw new InterpreterError(`Tuple must have at least 2 values`, this);
        }
        return (this.parsedValue = new TupleValue(
            values,
            values.map((value) => value.type),
        ));
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
