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
        const condition = interpreter.evaluateExpr(this.condition) as BooleanValue;
        if (condition.type !== ValueType.BOOL) {
            throw new InterpreterError(`Invalid ternary condition type: ${condition.type}`, this);
        }
        return (this.parsedValue = interpreter.evaluateExpr(condition.value ? this.thenBranch : this.elseBranch));
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
