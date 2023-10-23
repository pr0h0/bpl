import Environment from '../Environment/Environment';
import BreakStatement from '../Errors/BreakStatement';
import ContinueStatement from '../Errors/ContinueStatement';
import Interpreter from '../Interpreter/Interpreter';
import { BooleanValue, NumberValue, RuntimeValue, VoidValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class WhileUntilStmt extends Expr {
    constructor(
        public override type: ExprType,
        public condition: Expr,
        public failsafe: Expr | null,
        public body: Expr,
    ) {
        super(ExprType.WHILE_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const localInterpreter = new Interpreter(new Environment(interpreter.environment));
        let failsafe =
            Number(this.failsafe && (localInterpreter.evaluateExpr(this.failsafe) as NumberValue)?.value) || undefined;

        if (this.type === ExprType.WHILE_STMT) {
            while ((interpreter.evaluateExpr(this.condition) as BooleanValue).value === true) {
                try {
                    localInterpreter.evaluateExpr(this.body);
                    if (failsafe !== undefined && failsafe-- < 0) throw new BreakStatement(`Failsafe limit reached`);
                } catch (err) {
                    if (err instanceof BreakStatement) {
                        break;
                    } else if (err instanceof ContinueStatement) {
                        continue;
                    }
                    throw err;
                }
            }
        } else if (this.type === ExprType.UNTIL_STMT) {
            while ((interpreter.evaluateExpr(this.condition) as BooleanValue).value === false) {
                try {
                    localInterpreter.evaluateExpr(this.body);
                    if (failsafe !== undefined && failsafe-- < 0) throw new BreakStatement(`Failsafe limit reached`);
                } catch (err) {
                    if (err instanceof BreakStatement) {
                        break;
                    } else if (err instanceof ContinueStatement) {
                        continue;
                    }
                    throw err;
                }
            }
        }
        return this.parsedValue;
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
