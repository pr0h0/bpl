import Environment from '../Environment/Environment';
import BreakStatement from '../Errors/BreakStatement';
import ContinueStatement from '../Errors/ContinueStatement';
import Interpreter from '../Interpreter/Interpreter';
import { BooleanValue, NumberValue, RuntimeValue, VoidValue } from '../Interpreter/Values';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class DoWhileUntilStmt extends Expr {
    constructor(
        public override type: ExprType,
        public condition: Expr,
        public failsafe: Expr | null,
        public body: Expr,
    ) {
        super(ExprType.DO_WHILE_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const localInterpreter = new Interpreter(new Environment(interpreter.environment));
        let failsafe =
            Number(this.failsafe && (this.failsafe.evaluate(localInterpreter) as NumberValue)?.value) || undefined;

        if (this.type === ExprType.DO_WHILE_STMT) {
            do {
                try {
                    localInterpreter.evaluate(this.body);
                    if (failsafe !== undefined && failsafe-- < 0) throw new BreakStatement(`Failsafe limit reached`);
                } catch (err) {
                    if (err instanceof BreakStatement) {
                        break;
                    } else if (err instanceof ContinueStatement) {
                        continue;
                    }
                    throw err;
                }
            } while ((this.condition.evaluate(localInterpreter) as BooleanValue).value === true);
        } else if (this.type === ExprType.DO_UNTIL_STMT) {
            do {
                try {
                    localInterpreter.evaluate(this.body);
                    if (failsafe !== undefined && failsafe-- < 0) throw new BreakStatement(`Failsafe limit reached`);
                } catch (err) {
                    if (err instanceof BreakStatement) {
                        break;
                    } else if (err instanceof ContinueStatement) {
                        continue;
                    }
                    throw err;
                }
            } while ((this.condition.evaluate(localInterpreter) as BooleanValue).value === false);
        }
        return this.parsedValue;
    }
}
