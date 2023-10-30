import Environment from '../Environment/Environment';
import BreakStatement from '../Errors/BreakStatement';
import ContinueStatement from '../Errors/ContinueStatement';
import ReturnStatement from '../Errors/ReturnStatement';
import Interpreter from '../Interpreter/Interpreter';
import { BooleanValue, NumberValue, RuntimeValue, VoidValue } from '../Interpreter/Values';
import PrintService from '../services/print.service';
import ExprType from '../Parser/ExprType';
import { Expr } from './Expr';

export class ForStmt extends Expr {
    constructor(
        public initializer: Expr | null,
        public condition: Expr | null,
        public increment: Expr | null,
        public failsafe: Expr | null,
        public body: Expr,
    ) {
        super(ExprType.FOR_STMT);
    }

    protected override parsedValue: RuntimeValue = new VoidValue();

    public override isEvaluateImplemented: boolean = true;

    public override evaluate(interpreter: Interpreter): RuntimeValue {
        const localInterpreter = new Interpreter(new Environment(interpreter.environment));
        let failsafe =
            Number(this.failsafe && (this.failsafe.evaluate(localInterpreter) as NumberValue)?.value) || undefined;

        if (this.initializer) {
            this.initializer.evaluate(localInterpreter);
        }

        while (true) {
            if (this.condition) {
                const condition = this.condition.evaluate(localInterpreter) as BooleanValue;
                if (condition.value !== true) break;
            }
            try {
                this.body.evaluate(localInterpreter);
                if (failsafe !== undefined && failsafe-- < 0) throw new BreakStatement('Failsafe limit reached');
            } catch (err) {
                if (err instanceof BreakStatement) {
                    break;
                } else if (err instanceof ContinueStatement) {
                    continue;
                } else if (err instanceof ReturnStatement) {
                    throw err;
                }
            }
            if (this.increment) {
                this.increment.evaluate(localInterpreter);
            }
        }
        return this.parsedValue;
    }

    public override toString(): string {
        return PrintService.print(this.parsedValue);
    }
}
