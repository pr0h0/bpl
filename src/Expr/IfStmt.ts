import InterpreterError from '../Errors/InterpreterError';
import Interpreter from '../Interpreter/Interpreter';
import ValueType from '../Interpreter/ValueType';
import { BooleanValue, RuntimeValue, VoidValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';
import { BlockStmt } from './BlockStmt';

export class IfStmt extends Expr {
    constructor(public condition: Expr, public thenBranch: BlockStmt, public elseBranch: BlockStmt | IfStmt | null) {
        super(ExprType.IF_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const condition = interpreter.evaluateExpr(this.condition) as BooleanValue;
        if (condition.type !== ValueType.BOOL) {
            throw new InterpreterError(`Invalid if condition type: ${condition.type}`, this);
        }
        if (condition.value) {
            return (this.parsedValue = this.thenBranch.evaluate(interpreter));
        } else if (this.elseBranch) {
            if (this.elseBranch.type === ExprType.IF_STMT) {
                return (this.parsedValue = this.elseBranch.evaluate(interpreter));
            } else if (this.elseBranch.type === ExprType.BLOCK_STMT) {
                return (this.parsedValue = this.elseBranch.evaluate(interpreter));
            }
        }
        return (this.parsedValue = new VoidValue());
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
