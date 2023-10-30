import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import ValueType from '../Interpreter/ValueType';
import { BooleanValue, RuntimeValue, VoidValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class TernaryExpr extends Expr {
    constructor(public condition: Expr, public thenBranch: Expr, public elseBranch: Expr) {
        super(ExprType.TERNARY_EXPR);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const condition = this.condition.evaluate(interpreter) as BooleanValue;
        if (condition.type !== ValueType.BOOL) {
            throw new InterpreterError(`Invalid ternary condition type: ${condition.type}`, this);
        }
        return (this.parsedValue = (condition.value ? this.thenBranch : this.elseBranch).evaluate(interpreter));
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
